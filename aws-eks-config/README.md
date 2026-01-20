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
