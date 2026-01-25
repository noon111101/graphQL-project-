# Hướng dẫn Triển khai AWS EKS Cluster (Production Ready)

Tài liệu này hướng dẫn chi tiết các bước thiết lập một cụm EKS hoàn chỉnh với hạ tầng mạng an toàn (VPC, Private/Public Subnets, NAT Gateway), Database RDS trong Private Subnet, và triển khai ứng dụng Backend lên Kubernetes.

## Mục lục

1. [Chuẩn bị](#1-chuan-bi)
2. [Thiết lập Hạ tầng Mạng (VPC)](#2-thiet-lap-ha-tang-mang)
3. [Thiết lập Security & Database](#3-thiet-lap-security--database)
4. [Khởi tạo Bastion Host](#4-khoi-tao-bastion-host)
5. [Khởi tạo EKS Cluster](#5-khoi-tao-eks-cluster)
6. [Khởi tạo Node Group](#6-khoi-tao-node-group)
7. [Kết nối & Kiểm thử](#7-ket-noi--kiem-thu)
8. [Dọn dẹp Tài nguyên](#8-don-dep-tai-nguyen)

---

## 1. Chuẩn bị

Đảm bảo bạn đã cài đặt `aws-cli`, `kubectl` và cấu hình credentials hợp lệ.

### Lấy Account ID
```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"
```

### Tạo IAM Roles
Tạo các Role cần thiết cho Cluster và Node Group.

**1. Cluster Role (MyMinimalEksRole)**
```bash
# Tạo Policy Trust
cat > eks-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "eks.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Tạo Role và Attach Policy
aws iam create-role --role-name MyMinimalEksRole --assume-role-policy-document file://eks-trust-policy.json
aws iam attach-role-policy --role-name MyMinimalEksRole --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy
```

**2. Node Group Role (MyMinimalNodeRole)**
```bash
# Tạo Policy Trust
cat > node-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Tạo Role và Attach Policy
aws iam create-role --role-name MyMinimalNodeRole --assume-role-policy-document file://node-trust-policy.json
aws iam attach-role-policy --role-name MyMinimalNodeRole --policy-arn arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy
aws iam attach-role-policy --role-name MyMinimalNodeRole --policy-arn arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy
aws iam attach-role-policy --role-name MyMinimalNodeRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
```

---

## 2. Thiết lập Hạ tầng Mạng

Chúng ta sẽ tạo mô hình VPC với 4 Subnets (2 Public, 2 Private) và 1 NAT Gateway.

```bash
# 1. Tạo VPC
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/21 --query 'Vpc.VpcId' --output text)
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames "{\"Value\":true}"
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=EKS-Lab-VPC

# 2. Tạo Internet Gateway (IGW)
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# 3. Tạo 2 Public Subnets (Zone 1a, 1b)
PUB_SUB_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.0.0/24 --availability-zone ap-southeast-1a --query 'Subnet.SubnetId' --output text)
PUB_SUB_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone ap-southeast-1b --query 'Subnet.SubnetId' --output text)
aws ec2 create-tags --resources $PUB_SUB_1 $PUB_SUB_2 --tags Key=Name,Value=Public-Subnet Key=kubernetes.io/role/elb,Value=1

# 4. Tạo 2 Private Subnets (Zone 1a, 1b)
PRI_SUB_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone ap-southeast-1a --query 'Subnet.SubnetId' --output text)
PRI_SUB_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.3.0/24 --availability-zone ap-southeast-1b --query 'Subnet.SubnetId' --output text)
aws ec2 create-tags --resources $PRI_SUB_1 $PRI_SUB_2 --tags Key=Name,Value=Private-Subnet Key=kubernetes.io/role/internal-elb,Value=1

# 5. Cấu hình Route Table PUBLIC
RT_PUB=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT_PUB --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --subnet-id $PUB_SUB_1 --route-table-id $RT_PUB
aws ec2 associate-route-table --subnet-id $PUB_SUB_2 --route-table-id $RT_PUB
aws ec2 modify-subnet-attribute --subnet-id $PUB_SUB_1 --map-public-ip-on-launch
aws ec2 modify-subnet-attribute --subnet-id $PUB_SUB_2 --map-public-ip-on-launch

# 6. Tạo NAT Gateway (Cho Private Subnet truy cập Internet)
EIP_ALLOC=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
NAT_GW_ID=$(aws ec2 create-nat-gateway --subnet-id $PUB_SUB_1 --allocation-id $EIP_ALLOC --query 'NatGateway.NatGatewayId' --output text)
echo "Đang khởi tạo NAT Gateway... Vui lòng chờ 30s..."
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_GW_ID

# 7. Cấu hình Route Table PRIVATE
RT_PRI=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT_PRI --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_GW_ID
aws ec2 associate-route-table --subnet-id $PRI_SUB_1 --route-table-id $RT_PRI
aws ec2 associate-route-table --subnet-id $PRI_SUB_2 --route-table-id $RT_PRI

echo "✅ Hạ tầng mạng hoàn tất!"
```

---

## 3. Thiết lập Security & Database

### Security Groups
```bash
# SG cho EKS Nodes (Cho phép ra Internet)
NODE_SG_ID=$(aws ec2 create-security-group --group-name EKS-Nodes-SG --description "Security group for EKS Nodes" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-egress --group-id $NODE_SG_ID --protocol all --cidr 0.0.0.0/0

# SG cho Bastion Host
BASTION_SG_ID=$(aws ec2 create-security-group --group-name Bastion-SG --description "SSH Access" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $BASTION_SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0

# SG cho RDS (Chỉ nhận từ Node và Bastion)
DB_SG_ID=$(aws ec2 create-security-group --group-name RDS-Private-SG --description "Security group for RDS" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $DB_SG_ID --protocol tcp --port 5432 --source-group $NODE_SG_ID
aws ec2 authorize-security-group-ingress --group-id $DB_SG_ID --protocol tcp --port 5432 --source-group $BASTION_SG_ID
```

### RDS PostgreSQL
```bash
# Tạo Subnet Group
aws rds create-db-subnet-group \
    --db-subnet-group-name my-db-private-group \
    --db-subnet-group-description "Private subnets for RDS" \
    --subnet-ids $PRI_SUB_1 $PRI_SUB_2

# Tạo DB Instance
aws rds create-db-instance \
    --db-instance-identifier my-lab-postgres \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username dbadmin \
    --master-user-password Admin123456 \
    --allocated-storage 20 \
    --db-subnet-group-name my-db-private-group \
    --vpc-security-group-ids $DB_SG_ID \
    --no-publicly-accessible \
    --backup-retention-period 0 \
    --skip-final-snapshot

echo "⏳ Đang tạo RDS..."
```

---

## 4. Khởi tạo Bastion Host

Dùng để kết nối SSH Tunnel vào Database từ local máy tính.

```bash
# Tạo SSH Key
KEY_NAME="LabKey_Global"
aws ec2 create-key-pair --key-name $KEY_NAME --query 'KeyMaterial' --output text > $KEY_NAME.pem
chmod 400 $KEY_NAME.pem

# Tìm AMI AL2023 mới nhất
AMI_ID=$(aws ec2 describe-images --owners amazon --filters "Name=name,Values=al2023-ami-2023.*-x86_64" "Name=state,Values=available" --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text)

# Khởi chạy Bastion (trong Public Subnet)
BASTION_ID=$(aws ec2 run-instances --image-id $AMI_ID --count 1 --instance-type t3.micro --key-name $KEY_NAME --security-group-ids $BASTION_SG_ID --subnet-id $PUB_SUB_1 --associate-public-ip-address --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Bastion-Host}]' --query 'Instances[0].InstanceId' --output text)

echo "⏳ Đang khởi động Bastion..."
aws ec2 wait instance-running --instance-ids $BASTION_ID
BASTION_IP=$(aws ec2 describe-instances --instance-ids $BASTION_ID --query "Reservations[0].Instances[0].PublicIpAddress" --output text)
echo "✅ Bastion Public IP: $BASTION_IP"
```

---

## 5. Khởi tạo EKS Cluster

Tạo cluster với phiên bản 1.34, gắn vào cả 4 Subnets để quản lý toàn diện.

```bash
aws eks create-cluster \
   --name my-production-cluster \
   --role-arn arn:aws:iam::$ACCOUNT_ID:role/MyMinimalEksRole \
   --resources-vpc-config subnetIds=$PUB_SUB_1,$PUB_SUB_2,$PRI_SUB_1,$PRI_SUB_2 \
   --region ap-southeast-1
```
*Lưu ý: Chờ trạng thái Cluster chuyển sang `ACTIVE` trước khi tiếp tục.*

---

## 6. Khởi tạo Node Group

Quan trọng: Node Group chỉ được đặt trong **Private Subnets** để đảm bảo bảo mật.

* check xem được dùng loại máy ảo nào của free-tier
```bash
aws ec2 describe-instance-types \
    --filters Name=free-tier-eligible,Values=true \
    --query "InstanceTypes[*].[InstanceType, MemoryInfo.SizeInMiB, VCpuInfo.DefaultVCpus]" \
    --output table
```

```bash
aws eks create-nodegroup \
  --cluster-name my-production-cluster \
  --nodegroup-name my-private-workers \
  --node-role arn:aws:iam::$ACCOUNT_ID:role/MyMinimalNodeRole \
  --subnets $PRI_SUB_1 $PRI_SUB_2 \
  --scaling-config minSize=1,maxSize=2,desiredSize=1 \
  --instance-types t3.micro \
  --ami-type AL2023_x86_64_STANDARD
```

---

## 7. Kết nối & Kiểm thử

### Cập nhật kubeconfig
```bash
aws eks update-kubeconfig --region ap-southeast-1 --name my-production-cluster
```

### SSH Tunnel vào Database
Lấy Endpoint RDS:
```bash
RDS_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier my-lab-postgres --query "DBInstances[0].Endpoint.Address" --output text)
```

Tạo tunnel (chạy lệnh này trên terminal riêng):
```bash
ssh -i "LabKey_Global.pem" -L 5433:$RDS_ENDPOINT:5432 ec2-user@$BASTION_IP -N
```

### Cấu hình môi trường (.env / properties)
Khi kết nối qua Tunnel:
- Host: `127..0.1`
- Port: `5433`
- User: `dbadmin`
- Pass: `Admin123456`

---

## 8. Dọn dẹp Tài nguyên (NUKE Script)

Chạy lệnh xoá để tránh phát sinh chi phí.

```bash
# 0. Load Resource IDs (Chạy lệnh này nếu mở Terminal mới)
# Lấy VPC ID từ Tag Name
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=EKS-Lab-VPC" --query "Vpcs[0].VpcId" --output text)

# Lấy Bastion Instance ID
BASTION_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Bastion-Host" "Name=instance-state-name,Values=running,stopped" --query "Reservations[0].Instances[0].InstanceId" --output text)

# Lấy NAT Gateway ID trong VPC (chỉ lấy state available)
NAT_GW_ID=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$VPC_ID" "Name=state,Values=available" --query "NatGateways[0].NatGatewayId" --output text)

# Lấy Allocation ID của EIP gắn với NAT Gateway
EIP_ALLOC=$(aws ec2 describe-nat-gateways --nat-gateway-ids $NAT_GW_ID --query "NatGateways[0].NatGatewayAddresses[0].AllocationId" --output text)

echo "Retrieved IDs: VPC=$VPC_ID, BASTION=$BASTION_ID, NAT=$NAT_GW_ID"

# 1. Xóa EKS & Node Group
aws eks delete-nodegroup --cluster-name my-production-cluster --nodegroup-name my-private-workers
aws eks delete-cluster --name my-production-cluster

# 2. Xóa RDS
aws rds delete-db-instance --db-instance-identifier my-lab-postgres --skip-final-snapshot

# 3. Xóa Bastion
aws ec2 terminate-instances --instance-ids $BASTION_ID

# 4. Xóa NAT Gateway (Chờ xóa xong mới release IP)
aws ec2 delete-nat-gateway --nat-gateway-id $NAT_GW_ID
echo "Chờ xóa NAT..."
sleep 60
aws ec2 release-address --allocation-id $EIP_ALLOC

# 5. Xóa VPC
aws ec2 delete-vpc --vpc-id $VPC_ID
```
