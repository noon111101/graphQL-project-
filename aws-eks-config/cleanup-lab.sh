#!/bin/bash

# ==============================================================================
# SCRIPT DỌN DẸP TÀI NGUYÊN LAB AWS EKS (NUKE SCRIPT)
# ==============================================================================
# Script này sẽ xóa toàn bộ tài nguyên được tạo ra trong bài lab:
# - EKS Cluster & Node Group
# - RDS Database & Subnet Group
# - EC2 Bastion Host & Security Groups
# - VPC, Subnets, NAT Gateway, Internet Gateway, Route Tables
#
# LƯU Ý: Script sử dụng các Tag (Name=EKS-Lab-VPC, etc.) để định danh tài nguyên.
# Đảm bảo bạn đã cấu hình AWS CLI đúng region (ap-southeast-1).
# ==============================================================================

set -e

# Configuration
CLUSTER_NAME="my-production-cluster"
NODEGROUP_NAME="my-private-workers"
DB_INSTANCE_ID="my-lab-postgres"
DB_SUBNET_GROUP="my-db-private-group"
KEY_NAME="LabKey_Global"
VPC_TAG_NAME="EKS-Lab-VPC"

echo "================================================================"
echo "⚠️  CẢNH BÁO: SCRIPT SẼ XÓA TOÀN BỘ TÀI NGUYÊN LAB!"
echo "================================================================"
read -p "Bạn có chắc chắn muốn tiếp tục? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Hủy bỏ."
    exit 1
fi

echo ""
echo "🔍 1. Đang lấy thông tin tài nguyên..."

# Lấy VPC ID
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=$VPC_TAG_NAME" --query "Vpcs[0].VpcId" --output text)
if [ "$VPC_ID" == "None" ] || [ -z "$VPC_ID" ]; then
    echo "❌ Không tìm thấy VPC với tag $VPC_TAG_NAME. Kiểm tra lại hoặc tài nguyên đã bị xóa."
    exit 1
fi
echo "✅ Found VPC ID: $VPC_ID"

# Lấy Bastion ID
BASTION_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=Bastion-Host" "Name=instance-state-name,Values=running,stopped,pending" --query "Reservations[0].Instances[0].InstanceId" --output text)
echo "✅ Found Bastion ID: $BASTION_ID"

# Lấy NAT Gateway
NAT_GW_ID=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$VPC_ID" "Name=state,Values=available,pending" --query "NatGateways[0].NatGatewayId" --output text)
echo "✅ Found NAT Gateway ID: $NAT_GW_ID"

# Lấy Resource khác
echo "----------------------------------------------------------------"

# ==============================================================================
# 2. Xóa EKS Cluster & Node Group
# ==============================================================================
echo "🚀 2. Xóa EKS Node Group & Cluster..."

# Check Node Group
NG_STATUS=$(aws eks describe-nodegroup --cluster-name $CLUSTER_NAME --nodegroup-name $NODEGROUP_NAME --query "nodegroup.status" --output text 2>/dev/null || echo "NOT_FOUND")
if [ "$NG_STATUS" != "NOT_FOUND" ] && [ "$NG_STATUS" != "DELETING" ]; then
    echo "   - Deleting Node Group: $NODEGROUP_NAME"
    aws eks delete-nodegroup --cluster-name $CLUSTER_NAME --nodegroup-name $NODEGROUP_NAME
    echo "   ⏳ Đang chờ Node Group bị xóa (có thể mất 5-10 phút)..."
    aws eks wait nodegroup-deleted --cluster-name $CLUSTER_NAME --nodegroup-name $NODEGROUP_NAME
    echo "   ✅ Node Group đã xóa."
elif [ "$NG_STATUS" == "DELETING" ]; then
    echo "   ⏳ Node Group đang bị xóa. Đang chờ..."
    aws eks wait nodegroup-deleted --cluster-name $CLUSTER_NAME --nodegroup-name $NODEGROUP_NAME
    echo "   ✅ Node Group đã xóa."
else
    echo "   - Node Group không tồn tại hoặc đã xóa."
fi

# Check Cluster
CLUSTER_STATUS=$(aws eks describe-cluster --name $CLUSTER_NAME --query "cluster.status" --output text 2>/dev/null || echo "NOT_FOUND")
if [ "$CLUSTER_STATUS" != "NOT_FOUND" ] && [ "$CLUSTER_STATUS" != "DELETING" ]; then
    echo "   - Deleting Cluster: $CLUSTER_NAME"
    aws eks delete-cluster --name $CLUSTER_NAME
    echo "   ⏳ Đang chờ Cluster bị xóa (có thể mất 10-15 phút)..."
    aws eks wait cluster-deleted --name $CLUSTER_NAME
    echo "   ✅ Cluster đã xóa."
elif [ "$CLUSTER_STATUS" == "DELETING" ]; then
    echo "   ⏳ Cluster đang bị xóa. Đang chờ..."
    aws eks wait cluster-deleted --name $CLUSTER_NAME
    echo "   ✅ Cluster đã xóa."
else
    echo "   - Cluster không tồn tại hoặc đã xóa."
fi

# ==============================================================================
# 3. Xóa RDS
# ==============================================================================
echo "🚀 3. Xóa RDS Database..."
RDS_STATUS=$(aws rds describe-db-instances --db-instance-identifier $DB_INSTANCE_ID --query "DBInstances[0].DBInstanceStatus" --output text 2>/dev/null || echo "NOT_FOUND")
if [ "$RDS_STATUS" != "NOT_FOUND" ] && [ "$RDS_STATUS" != "deleting" ]; then
    echo "   - Deleting RDS instance..."
    aws rds delete-db-instance --db-instance-identifier $DB_INSTANCE_ID --skip-final-snapshot
    echo "   ⏳ Đang chờ RDS bị xóa (cần chờ để release ENI)..."
    aws rds wait db-instance-deleted --db-instance-identifier $DB_INSTANCE_ID
    echo "   ✅ RDS đã xóa."
elif [ "$RDS_STATUS" == "deleting" ]; then
    echo "   ⏳ RDS đang bị xóa. Đang chờ..."
    aws rds wait db-instance-deleted --db-instance-identifier $DB_INSTANCE_ID
    echo "   ✅ RDS đã xóa."
else
    echo "   - RDS không tồn tại hoặc đã xóa."
fi

# Xóa DB Subnet Group
echo "   - Deleting DB Subnet Group..."
aws rds delete-db-subnet-group --db-subnet-group-name $DB_SUBNET_GROUP 2>/dev/null || echo "   - DB Subnet Group không tồn tại."

# ==============================================================================
# 4. Xóa Bastion Host
# ==============================================================================
echo "🚀 4. Xóa Bastion Host..."
if [ "$BASTION_ID" != "None" ] && [ -n "$BASTION_ID" ]; then
    aws ec2 terminate-instances --instance-ids $BASTION_ID
    echo "   ⏳ Đang chờ Bastion Terminated..."
    aws ec2 wait instance-terminated --instance-ids $BASTION_ID
    echo "   ✅ Bastion đã xóa."
else
    echo "   - Bastion không tồn tại."
fi

# Xóa Key Pair
aws ec2 delete-key-pair --key-name $KEY_NAME
rm -f "$KEY_NAME.pem"
echo "   ✅ Đã xóa Key Pair $KEY_NAME."

# ==============================================================================
# 5. Xóa NAT Gateway & Release EIP
# ==============================================================================
echo "🚀 5. Xóa NAT Gateway..."
if [ "$NAT_GW_ID" != "None" ] && [ -n "$NAT_GW_ID" ]; then
    # Lấy Allocation ID trước khi xóa NAT
    EIP_ALLOC=$(aws ec2 describe-nat-gateways --nat-gateway-ids $NAT_GW_ID --query "NatGateways[0].NatGatewayAddresses[0].AllocationId" --output text)
    
    aws ec2 delete-nat-gateway --nat-gateway-id $NAT_GW_ID
    echo "   ⏳ Đang chờ NAT Gateway bị xóa (thường mất 1-2 phút)..."
    aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT_GW_ID
    echo "   ✅ NAT Gateway đã xóa."

    if [ "$EIP_ALLOC" != "None" ]; then
        echo "   - Releasing Elastic IP: $EIP_ALLOC"
        aws ec2 release-address --allocation-id $EIP_ALLOC
    fi
else
    echo "   - NAT Gateway không tồn tại."
fi

# ==============================================================================
# 6. Dọn dẹp Network Dependencies (Clean for VPC Deletion)
# ==============================================================================
echo "🚀 6. Dọn dẹp Network Dependencies..."

# F. Xóa Load Balancers (Thường bị bỏ sót khi xóa Cluster)
echo "   - Checking for Load Balancers..."
# Classic ELB
ELBS=$(aws elb describe-load-balancers --query "LoadBalancerDescriptions[?VPCId=='$VPC_ID'].LoadBalancerName" --output text)
if [ -n "$ELBS" ]; then
    for elb in $ELBS; do
        echo "     Deleting Classic ELB: $elb"
        aws elb delete-load-balancer --load-balancer-name $elb
    done
fi
# ALB/NLB (ELBv2)
ELBV2S=$(aws elbv2 describe-load-balancers --query "LoadBalancers[?VpcId=='$VPC_ID'].LoadBalancerArn" --output text)
if [ -n "$ELBV2S" ]; then
    for elb in $ELBV2S; do
        echo "     Deleting ELBv2: $elb"
        aws elbv2 delete-load-balancer --load-balancer-arn $elb
        # Cần chờ LB xóa xong để Target Groups được release
        echo "     Waiting for state change..."
        sleep 10
    done
fi

# G. Xóa Target Groups (ELBv2 Dependencies)
TGS=$(aws elbv2 describe-target-groups --query "TargetGroups[?VpcId=='$VPC_ID'].TargetGroupArn" --output text)
if [ -n "$TGS" ]; then
    for tg in $TGS; do
        echo "     Deleting Target Group: $tg"
        aws elbv2 delete-target-group --target-group-arn $tg
    done
fi

# A. Xóa Security Groups (Trừ default) - Aggressive Mode
# Revoke rules first to break cyclic dependencies
echo "   - Cleaning Security Groups Rules..."
SGS=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)
if [ -n "$SGS" ]; then
    for sg in $SGS; do
        # Revoke Ingress
        aws ec2 revoke-security-group-ingress --group-id $sg --protocol all --source-group-id $sg 2>/dev/null || true
        aws ec2 revoke-security-group-ingress --group-id $sg --protocol all --cidr 0.0.0.0/0 2>/dev/null || true
        # Revoke Egress
        aws ec2 revoke-security-group-egress --group-id $sg --protocol all --cidr 0.0.0.0/0 2>/dev/null || true
    done

    echo "   - Deleting Security Groups..."
    sleep 5 # Chờ propagation
    for sg in $SGS; do
        aws ec2 delete-security-group --group-id $sg 2>/dev/null || echo "     ⚠️ Không thể xóa SG $sg (có thể đang attach vào ENI chưa xóa). Sẽ thử lại sau."
    done
fi

# B. Kiểm tra và Xóa ENIs Network Interfaces còn sót
echo "   - Checking for lingering ENIs..."
ENIS=$(aws ec2 describe-network-interfaces --filters "Name=vpc-id,Values=$VPC_ID" --query "NetworkInterfaces[?Attachment==null].NetworkInterfaceId" --output text)
if [ -n "$ENIS" ]; then
    for eni in $ENIS; do
        echo "     Deleting Detached ENI: $eni"
        aws ec2 delete-network-interface --network-interface-id $eni
    done
fi

# C. Detach & Delete Internet Gateway
IGW_ID=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --query "InternetGateways[0].InternetGatewayId" --output text)
if [ "$IGW_ID" != "None" ] && [ -n "$IGW_ID" ]; then
    echo "   - Detaching IGW: $IGW_ID"
    aws ec2 detach-internet-gateway --internet-gateway-id $IGW_ID --vpc-id $VPC_ID 2>/dev/null || true
    aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID 2>/dev/null || true
    echo "   ✅ IGW đã xóa."
fi

# D. Subnets
SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[].SubnetId" --output text)
if [ -n "$SUBNETS" ]; then
    echo "   - Deleting Subnets..."
    for subnet in $SUBNETS; do
        aws ec2 delete-subnet --subnet-id $subnet 2>/dev/null || echo "     ⚠️ Không thể xóa Subnet $subnet (Còn Dependency?)"
    done
fi

# E. Route Tables (Trừ Main)
RTS=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --query "RouteTables[?Associations[0].Main!=\`true\`].RouteTableId" --output text)
if [ -n "$RTS" ]; then
    echo "   - Deleting Route Tables..."
    for rt in $RTS; do
        aws ec2 delete-route-table --route-table-id $rt
    done
fi

# ==============================================================================
# 7. Xóa VPC (Retry Mode)
# ==============================================================================
echo "🚀 7. Xóa VPC..."
MAX_RETRIES=5
COUNT=0
while [ $COUNT -lt $MAX_RETRIES ]; do
    if aws ec2 delete-vpc --vpc-id $VPC_ID 2>/dev/null; then
        echo "✅ ĐÃ XÓA VPC THÀNH CÔNG!"
        break
    else
        echo "⚠️  Vẫn còn dependency (ENI/SG?). Đợi 10s và thử lại... ($((COUNT+1))/$MAX_RETRIES)"
        
        # Thử xóa lại các SG còn sót
        SGS_REMAIN=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)
        for sg in $SGS_REMAIN; do aws ec2 delete-security-group --group-id $sg 2>/dev/null; done

        sleep 10
        COUNT=$((COUNT+1))
    fi
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "❌ KHÔNG THỂ XÓA VPC SAU $MAX_RETRIES LẦN THỬ."
    echo "👉 Vui lòng kiểm tra thủ công: Load Balancers, Lambda ENIs, hoặc RDS Snapshots."
    echo "   Command: aws ec2 describe-network-interfaces --filters Name=vpc-id,Values=$VPC_ID"
    exit 1
fi
