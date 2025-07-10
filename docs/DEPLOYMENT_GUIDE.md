# VaultNotary ECS Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the VaultNotary application to AWS ECS with ALB, RDS, and other AWS services.

## Prerequisites

### 1. AWS CLI Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region, and output format
```

### 2. Session Manager Plugin (for debugging)
```bash
# For Ubuntu/Debian
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb

# For Amazon Linux/CentOS/RHEL
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm" -o "session-manager-plugin.rpm"
sudo yum install -y session-manager-plugin.rpm
```

### 3. Docker
```bash
# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

### 4. Required Information
- AWS Account ID
- AWS Region (e.g., ap-southeast-1)
- Database credentials
- S3 bucket name
- KMS key ID

## Step 1: Infrastructure Setup

### 1.1 Create VPC and Networking (if not exists)
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 172.31.0.0/16 --region ap-southeast-1

# Create subnets in multiple AZs
aws ec2 create-subnet --vpc-id vpc-xxxxxxxxx --cidr-block 172.31.1.0/24 --availability-zone ap-southeast-1a
aws ec2 create-subnet --vpc-id vpc-xxxxxxxxx --cidr-block 172.31.2.0/24 --availability-zone ap-southeast-1b
aws ec2 create-subnet --vpc-id vpc-xxxxxxxxx --cidr-block 172.31.3.0/24 --availability-zone ap-southeast-1c
```

### 1.2 Create Security Group
```bash
# Create security group
aws ec2 create-security-group --group-name vaultnotary-sg --description "Security group for VaultNotary" --vpc-id vpc-xxxxxxxxx --region ap-southeast-1

# Add ingress rules
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxxx --protocol tcp --port 80 --cidr 0.0.0.0/0 --region ap-southeast-1
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxxx --protocol tcp --port 5432 --cidr 172.31.0.0/16 --region ap-southeast-1
aws ec2 authorize-security-group-ingress --group-id sg-xxxxxxxxx --protocol tcp --port 80 --source-group sg-xxxxxxxxx --region ap-southeast-1

# Add egress rules
aws ec2 authorize-security-group-egress --group-id sg-xxxxxxxxx --protocol tcp --port 5432 --cidr 172.31.0.0/16 --region ap-southeast-1
aws ec2 authorize-security-group-egress --group-id sg-xxxxxxxxx --protocol tcp --port 443 --cidr 0.0.0.0/0 --region ap-southeast-1
aws ec2 authorize-security-group-egress --group-id sg-xxxxxxxxx --protocol tcp --port 80 --cidr 172.31.0.0/16 --region ap-southeast-1
```

### 1.3 Create RDS Database
```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name vaultnotary-db-subnet-group \
  --db-subnet-group-description "Subnet group for VaultNotary database" \
  --subnet-ids subnet-xxxxxxxxx subnet-yyyyyyyyy \
  --region ap-southeast-1

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier vaultnotary-db-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username vaultnotary_user \
  --master-user-password "YourSecurePassword" \
  --allocated-storage 20 \
  --db-name vaultnotary \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name vaultnotary-db-subnet-group \
  --region ap-southeast-1
```

### 1.4 Create S3 Bucket
```bash
# Create S3 bucket for file storage
aws s3 mb s3://vaultnotary-files-prod-YOUR_ACCOUNT_ID --region ap-southeast-1

# Configure bucket policy if needed
```

### 1.5 Create KMS Key
```bash
# Create KMS key for encryption
aws kms create-key --description "VaultNotary encryption key" --region ap-southeast-1
```

## Step 2: ECS Setup

### 2.1 Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name vaultnotary-cluster --region ap-southeast-1
```

### 2.2 Create ECR Repository
```bash
# Create ECR repository
aws ecr create-repository --repository-name vaultnotary --region ap-southeast-1

# Get login command
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com
```

### 2.3 Create IAM Roles
```bash
# Create execution role
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
```

Trust policy file (`trust-policy.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

## Step 3: Application Configuration

### 3.1 Configure Environment Variables
Create/update `.env` file:
```bash
# Application Environment
ASPNETCORE_ENVIRONMENT=Test

# Database Configuration  
DATABASE_CONNECTION_STRING=Host=your-rds-endpoint;Port=5432;Database=vaultnotary;Username=vaultnotary_user;Password=YourPassword

# AWS Configuration
AWS_REGION=ap-southeast-1
AWS_USE_IAM_ROLE=false
AWS_ACCESS_KEY=YOUR_ACCESS_KEY
AWS_SECRET_KEY=YOUR_SECRET_KEY

# AWS Resources
AWS_S3_BUCKET_NAME=vaultnotary-files-prod-YOUR_ACCOUNT_ID
AWS_S3_FILE_PREFIX=files/
AWS_S3_PRESIGNED_URL_HOURS=24
AWS_KMS_SYMMETRIC_KEY_ID=your-kms-key-id
```

### 3.2 Update Task Definition
Update `vaultnotary-task-definition.json`:
```json
{
  "family": "vaultnotary",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "vaultnotary-api",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ASPNETCORE_ENVIRONMENT",
          "value": "Test"
        },
        {
          "name": "ASPNETCORE_URLS", 
          "value": "http://+:80"
        },
        {
          "name": "ConnectionStrings__DefaultConnection",
          "value": "YOUR_CONNECTION_STRING"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/aws/vaultnotary/app-prod",
          "awslogs-region": "ap-southeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "essential": true
    }
  ]
}
```

## Step 4: Build and Deploy Application

### 4.1 Build Docker Image
```bash
# Navigate to project directory
cd /path/to/vaultNotary

# Build using docker-compose
docker-compose build vaultnotary-api

# Or build manually
cd backend/src
docker build -t vaultnotary-local -f VaultNotary.Web/Dockerfile .
```

### 4.2 Test Locally (Optional)
```bash
# Run locally
docker-compose up -d vaultnotary-api

# Test health endpoint
curl http://localhost:5000/health
# Should return: Healthy

# Test application
curl http://localhost:5000/swagger
```

### 4.3 Push to ECR
```bash
# Tag image
docker tag vaultnotary-vaultnotary-api:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary:latest
```

### 4.4 Create CloudWatch Log Group
```bash
aws logs create-log-group --log-group-name "/aws/vaultnotary/app-prod" --region ap-southeast-1
```

### 4.5 Register Task Definition
```bash
aws ecs register-task-definition --cli-input-json file://vaultnotary-task-definition.json --region ap-southeast-1
```

## Step 5: Load Balancer Setup

### 5.1 Create Application Load Balancer
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name vaultnotary-alb \
  --subnets subnet-xxxxxxxxx subnet-yyyyyyyyy \
  --security-groups sg-xxxxxxxxx \
  --region ap-southeast-1
```

### 5.2 Create Target Group
```bash
# Create target group
aws elbv2 create-target-group \
  --name vaultnotary-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxxxxxx \
  --target-type ip \
  --health-check-path "/health" \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 5 \
  --unhealthy-threshold-count 2 \
  --region ap-southeast-1
```

### 5.3 Create Listener
```bash
# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:ap-southeast-1:YOUR_ACCOUNT_ID:loadbalancer/app/vaultnotary-alb/XXXXXXXXXX \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:ap-southeast-1:YOUR_ACCOUNT_ID:targetgroup/vaultnotary-targets/XXXXXXXXXX \
  --region ap-southeast-1
```

## Step 6: Create ECS Service

### 6.1 Create ECS Service
```bash
aws ecs create-service \
  --cluster vaultnotary-cluster \
  --service-name vaultnotary-service \
  --task-definition vaultnotary:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --platform-version LATEST \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxxx,subnet-yyyyyyyyy,subnet-zzzzzzzzz],securityGroups=[sg-xxxxxxxxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:ap-southeast-1:YOUR_ACCOUNT_ID:targetgroup/vaultnotary-targets/XXXXXXXXXX,containerName=vaultnotary-api,containerPort=80 \
  --enable-execute-command \
  --region ap-southeast-1
```

## Step 7: Verification and Monitoring

### 7.1 Check Service Status
```bash
# Check service status
aws ecs describe-services --cluster vaultnotary-cluster --services vaultnotary-service --region ap-southeast-1

# Check running tasks
aws ecs list-tasks --cluster vaultnotary-cluster --service-name vaultnotary-service --region ap-southeast-1

# Check target health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:ap-southeast-1:YOUR_ACCOUNT_ID:targetgroup/vaultnotary-targets/XXXXXXXXXX --region ap-southeast-1
```

### 7.2 Check Application Logs
```bash
# Get log events
aws logs get-log-events \
  --log-group-name "/aws/vaultnotary/app-prod" \
  --log-stream-name "ecs/vaultnotary-api/TASK_ID" \
  --region ap-southeast-1
```

### 7.3 Test Application
```bash
# Get ALB DNS name
aws elbv2 describe-load-balancers --load-balancer-arns arn:aws:elasticloadbalancing:ap-southeast-1:YOUR_ACCOUNT_ID:loadbalancer/app/vaultnotary-alb/XXXXXXXXXX --region ap-southeast-1 --query 'LoadBalancers[0].DNSName'

# Test health endpoint
curl http://your-alb-dns-name/health

# Test swagger UI
curl http://your-alb-dns-name/swagger
```

## Step 8: Updates and Redeployment

### 8.1 Update Application
```bash
# Build new image
docker-compose build vaultnotary-api

# Tag and push
docker tag vaultnotary-vaultnotary-api:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary:latest

# Force new deployment
aws ecs update-service --cluster vaultnotary-cluster --service vaultnotary-service --force-new-deployment --region ap-southeast-1
```

### 8.2 Update Task Definition
```bash
# Register new task definition revision
aws ecs register-task-definition --cli-input-json file://vaultnotary-task-definition.json --region ap-southeast-1

# Update service to use new task definition
aws ecs update-service --cluster vaultnotary-cluster --service vaultnotary-service --task-definition vaultnotary:2 --region ap-southeast-1
```

## Troubleshooting Commands

### Debug ECS Tasks
```bash
# Exec into running container
aws ecs execute-command --cluster vaultnotary-cluster --task TASK_ID --container vaultnotary-api --interactive --command "/bin/bash" --region ap-southeast-1

# Stop failing task
aws ecs stop-task --cluster vaultnotary-cluster --task TASK_ID --reason "Debug restart" --region ap-southeast-1
```

### Debug Networking
```bash
# Test connectivity to task
curl -v http://TASK_PRIVATE_IP/health

# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx --region ap-southeast-1
```

### Debug Health Checks
```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn TARGET_GROUP_ARN --region ap-southeast-1

# Modify health check settings
aws elbv2 modify-target-group --target-group-arn TARGET_GROUP_ARN --health-check-path "/health" --region ap-southeast-1
```

## Security Best Practices

1. **Use IAM roles instead of access keys** where possible
2. **Enable encryption** for RDS and S3
3. **Use VPC endpoints** for AWS services
4. **Implement least privilege** security group rules
5. **Enable CloudTrail** for audit logging
6. **Use AWS Secrets Manager** for sensitive data
7. **Enable container insights** for monitoring

## Cost Optimization

1. **Use Fargate Spot** for development environments
2. **Right-size** CPU and memory allocations
3. **Use S3 lifecycle policies** for old files
4. **Monitor CloudWatch costs** and set up billing alerts
5. **Use reserved capacity** for production workloads

## Monitoring and Alerting

1. **Set up CloudWatch alarms** for:
   - ECS service CPU/Memory utilization
   - ALB target health
   - RDS connection count
   - Application error rates

2. **Enable container insights** for detailed metrics
3. **Set up log aggregation** and analysis
4. **Configure SNS notifications** for critical alerts

This deployment guide provides a complete end-to-end process for deploying VaultNotary to AWS ECS with all necessary components and troubleshooting information.