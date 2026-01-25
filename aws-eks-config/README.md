# AWS EKS Minimal Cluster Setup

This document records the steps to create a minimal EKS cluster and node group using the AWS CLI, based on the setup flow performed.

## 1. Prepare Network Resources

Retrieve available subnets for the cluster:

```bash
aws ec2 describe-subnets \
    --filters "Name=default-for-az,Values=true" \
    --query "Subnets[0:2].SubnetId" --output text
```

*Note: In this setup, we used `subnet-09410e49baa85c77e` and `subnet-0cea6ccf71894e950`.*

## 2. Create Cluster IAM Role

Create the trust policy `eks-trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "eks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Create the role and attach the necessary policy:

```bash
aws iam create-role \
    --role-name MyMinimalEksRole \
    --assume-role-policy-document file://eks-trust-policy.json

aws iam attach-role-policy \
    --role-name MyMinimalEksRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy
```

## 3. Create EKS Cluster

Create the cluster (version 1.34) using the role and subnets prepared above:

```bash
aws eks create-cluster \
   --name my-minimal-cluster \
   --role-arn arn:aws:iam::531906857012:role/MyMinimalEksRole \
   --resources-vpc-config subnetIds=subnet-09410e49baa85c77e,subnet-0cea6ccf71894e950 \
   --region ap-southeast-1
```

Wait for the cluster status to become `ACTIVE`:

```bash
aws eks describe-cluster --name my-minimal-cluster --query "cluster.status"
```

## 4. Create Node Group IAM Role

Create the trust policy `node-trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Create the role and attach the worker node policies:

```bash
aws iam create-role \
  --role-name MyMinimalNodeRole \
  --assume-role-policy-document file://node-trust-policy.json

aws iam attach-role-policy \
  --role-name MyMinimalNodeRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy

aws iam attach-role-policy \
  --role-name MyMinimalNodeRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy

aws iam attach-role-policy \
  --role-name MyMinimalNodeRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
```

## 5. Create Node Group

Create the node group. 

**Important:** For Kubernetes 1.34+, use `AL2023_x86_64_STANDARD` as the AMI type (Amazon Linux 2 is not supported for this version).

```bash
aws eks create-nodegroup \
  --cluster-name my-minimal-cluster \
  --nodegroup-name my-minimal-workers \
  --node-role arn:aws:iam::531906857012:role/MyMinimalNodeRole \
  --subnets subnet-09410e49baa85c77e subnet-0cea6ccf71894e950 \
  --scaling-config minSize=1,maxSize=2,desiredSize=1 \
  --instance-types t3.medium \
  --ami-type AL2023_x86_64_STANDARD
```

Check the node group status:

```bash
aws eks describe-nodegroup \
  --cluster-name my-minimal-cluster \
  --nodegroup-name my-minimal-workers \
  --query "nodegroup.status"
```







Chi tiết tự tạo vpc subnet



BƯỚC 1: DỰNG HẠ TẦNG MẠNG (4 Subnets + NAT)
Bạn copy paste đoạn script này. Lưu ý: Tôi dùng 1 NAT Gateway chung để tiết kiệm tiền (chỉ tốn ~$0.045/giờ), thay vì 2 cái.

Bash
# 0. Lấy Account ID (Để dùng cho lệnh sau)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"
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
# Tag chuẩn cho EKS nhận diện Public Load Balancer
aws ec2 create-tags --resources $PUB_SUB_1 $PUB_SUB_2 --tags Key=Name,Value=Public-Subnet Key=kubernetes.io/role/elb,Value=1

# 4. Tạo 2 Private Subnets (Zone 1a, 1b)
PRI_SUB_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone ap-southeast-1a --query 'Subnet.SubnetId' --output text)
PRI_SUB_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.3.0/24 --availability-zone ap-southeast-1b --query 'Subnet.SubnetId' --output text)
# Tag chuẩn cho EKS nhận diện Internal Load Balancer
aws ec2 create-tags --resources $PRI_SUB_1 $PRI_SUB_2 --tags Key=Name,Value=Private-Subnet Key=kubernetes.io/role/internal-elb,Value=1

# 5. Cấu hình Route Table cho PUBLIC (Đi ra IGW)
RT_PUB=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT_PUB --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --subnet-id $PUB_SUB_1 --route-table-id $RT_PUB
aws ec2 associate-route-table --subnet-id $PUB_SUB_2 --route-table-id $RT_PUB
# Bật auto-assign Public IP cho Public Subnet
aws ec2 modify-subnet-attribute --subnet-id $PUB_SUB_1 --map-public-ip-on-launch
aws ec2 modify-subnet-attribute --subnet-id $PUB_SUB_2 --map-public-ip-on-launch

# 6. Tạo NAT Gateway (Để Private Node tải được Docker Image)
# 6.1. Xin cấp 1 IP Tĩnh (Elastic IP)
EIP_ALLOC=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
# 6.2. Tạo NAT Gateway đặt tại Public Subnet 1
NAT_GW_ID=$(aws ec2 create-nat-gateway --subnet-id $PUB_SUB_1 --allocation-id $EIP_ALLOC --query 'NatGateway.NatGatewayId' --output text)
echo "Đang tạo NAT Gateway... Vui lòng chờ 30s..."
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_GW_ID

# 7. Cấu hình Route Table cho PRIVATE (Đi qua NAT)
RT_PRI=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT_PRI --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_GW_ID
aws ec2 associate-route-table --subnet-id $PRI_SUB_1 --route-table-id $RT_PRI
aws ec2 associate-route-table --subnet-id $PRI_SUB_2 --route-table-id $RT_PRI

echo "Hạ tầng mạng XONG! NAT GW: $NAT_GW_ID"
BƯỚC 2: TẠO SECURITY GROUP (Lớp bảo vệ)
Quy tắc bất di bất dịch: Database chỉ mở cửa cho EKS Node.

Bash

# 1. Tạo SG cho EKS Nodes
NODE_SG_ID=$(aws ec2 create-security-group --group-name EKS-Nodes-SG --description "Security group for EKS Nodes" --vpc-id $VPC_ID --query 'GroupId' --output text)
# Cho phép Node ra ngoài Internet (để tải image)
aws ec2 authorize-security-group-egress --group-id $NODE_SG_ID --protocol all --cidr 0.0.0.0/0

# 2. Tạo SG cho RDS Database
DB_SG_ID=$(aws ec2 create-security-group --group-name RDS-Private-SG --description "Security group for RDS" --vpc-id $VPC_ID --query 'GroupId' --output text)
# Rule 1 Chỉ cho phép traffic cổng 5432 đến từ EKS Nodes
aws ec2 authorize-security-group-ingress --group-id $DB_SG_ID --protocol tcp --port 5432 --source-group $NODE_SG_ID

# Rule 2: Cho phép Bastion (Dev) truy cập
aws ec2 authorize-security-group-ingress --group-id $DB_SG_ID --protocol tcp --port 5432 --source-group $BASTION_SG_ID
BƯỚC 3: TẠO RDS POSTGRESQL (Trong Private Subnet)
Chúng ta sẽ tạo một con RDS nhỏ nhất (Free tier eligible nếu tài khoản mới) và giấu nó vào trong Private Subnet.

# 3. Cấu hình bastion host
# 1. Tạo SSH Key
KEY_NAME="LabKey_Global"
aws ec2 create-key-pair --key-name $KEY_NAME --query 'KeyMaterial' --output text > $KEY_NAME.pem
chmod 400 $KEY_NAME.pem

# 2. SG cho Bastion (Mở cổng 22 toàn cầu)
BASTION_SG_ID=$(aws ec2 create-security-group --group-name Bastion-SG --description "SSH Access" --vpc-id $VPC_ID --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $BASTION_SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
# 3. Khởi tạo Bastion Host
AMI_ID=$(aws ec2 describe-images --owners amazon --filters "Name=name,Values=al2023-ami-2023.*-x86_64" "Name=state,Values=available" --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text)
BASTION_ID=$(aws ec2 run-instances --image-id $AMI_ID --count 1 --instance-type t3.micro --key-name $KEY_NAME --security-group-ids $BASTION_SG_ID --subnet-id $PUB_SUB_1 --associate-public-ip-address --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=Bastion-Host}]' --query 'Instances[0].InstanceId' --output text)

echo "⏳ Đang bật Bastion..."
aws ec2 wait instance-running --instance-ids $BASTION_ID
BASTION_IP=$(aws ec2 describe-instances --instance-ids $BASTION_ID --query "Reservations[0].Instances[0].PublicIpAddress" --output text)

echo "✅ BASTION IP: $BASTION_IP"
Bash

# 1. Tạo Subnet Group (Gom 2 Private Subnet lại thành 1 nhóm cho DB dùng)
aws rds create-db-subnet-group \
    --db-subnet-group-name my-db-private-group \
    --db-subnet-group-description "Private subnets for RDS" \
    --subnet-ids $PRI_SUB_1 $PRI_SUB_2

# 2. Tạo Database PostgreSQL
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
    
echo "Đang tạo DB... Mất khoảng 5-10 phút."
BƯỚC 4: TẠO EKS CLUSTER & NODE GROUP (Cập nhật)
Chúng ta dùng lại lệnh tạo EKS cũ, nhưng thay đổi tham số Subnet.

Cluster: Gắn vào cả 4 Subnet (Để nó quản lý được tất cả).

Node Group: CHỈ GẮN VÀO 2 PRIVATE SUBNET ($PRI_SUB_1, $PRI_SUB_2).

Bash

# ... (Đoạn tạo IAM Role làm y hệt bài trước) ...

BƯỚC 4: TẠO EKS CLUSTER (Dùng lại Role cũ)
Chúng ta sẽ dùng ARN của Role cũ: arn:aws:iam::$ACCOUNT_ID:role/MyMinimalEksRole. Lưu ý: Cluster nên nhìn thấy cả 4 Subnet.

Bash

aws eks create-cluster \
   --name my-production-cluster \
   --role-arn arn:aws:iam::$ACCOUNT_ID:role/MyMinimalEksRole \
   --resources-vpc-config subnetIds=$PUB_SUB_1,$PUB_SUB_2,$PRI_SUB_1,$PRI_SUB_2 \
   --region ap-southeast-1
Bạn cần đợi lệnh này chạy xong (trạng thái ACTIVE) thì mới chạy Bước 5 được.

BƯỚC 5: TẠO NODE GROUP (Dùng lại Role cũ - Đặt vào Private)
Dùng ARN của Role cũ: arn:aws:iam::$ACCOUNT_ID:role/MyMinimalNodeRole. Quan trọng: Chỉ đặt Node vào $PRI_SUB_1 và $PRI_SUB_2.

Bash

aws eks create-nodegroup \
  --cluster-name my-production-cluster \
  --nodegroup-name my-private-workers \
  --node-role arn:aws:iam::$ACCOUNT_ID:role/MyMinimalNodeRole \
  --subnets $PRI_SUB_1 $PRI_SUB_2 \
  --scaling-config minSize=1,maxSize=2,desiredSize=1 \
  --instance-types t3.micro \
  --ami-type AL2023_x86_64_STANDARD
## BƯỚC 6: VERIFY (Kiểm tra)

Kiểm tra trạng thái Node Group:

```bash
aws eks describe-nodegroup \
  --cluster-name my-production-cluster \
  --nodegroup-name my-private-workers \
  --query "nodegroup.status"
```
1. Lấy thông tin kết nối:

Bash

# Cập nhật Kubeconfig
aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

# Lấy RDS Endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances --db-instance-identifier my-lab-postgres --query "DBInstances[0].Endpoint.Address" --output text)

echo "--- THÔNG TIN KẾT NỐI ---"
echo "Bastion IP  : $BASTION_IP"
echo "RDS Endpoint: $RDS_ENDPOINT"
echo "SSH Key File: $KEY_NAME.pem"
2. Lệnh tạo Tunnel (Chạy trên Laptop để Dev):

Bash

# Thay thế giá trị in ra ở trên vào lệnh này
ssh -i "LabKey_Global.pem" -L 5433:$RDS_ENDPOINT:5432 ec2-user@$BASTION_IP -N
3. Cấu hình App (.env):

Properties

DB_HOST=127.0.0.1
DB_PORT=5433
DB_USER=dbadmin
DB_PASS=Admin123456
💣 SCRIPT DỌN DẸP (NUKE)
Chạy cái này khi học xong để không mất tiền ($1-2/ngày cho NAT & RDS).

Bash

# Xóa EKS
aws eks delete-nodegroup --cluster-name $CLUSTER_NAME --nodegroup-name private-workers
aws eks delete-cluster --name $CLUSTER_NAME

# Xóa RDS
aws rds delete-db-instance --db-instance-identifier my-lab-db --skip-final-snapshot

# Xóa Bastion
aws ec2 terminate-instances --instance-ids $BASTION_ID

# Xóa NAT (Quan trọng nhất)
aws ec2 delete-nat-gateway --nat-gateway-id $NAT_GW_ID
sleep 60 # Chờ NAT xóa xong
aws ec2 release-address --allocation-id $EIP_ALLOC

# Xóa VPC (Xóa nốt các thứ còn lại)
aws ec2 delete-vpc --vpc-id $VPC_ID
