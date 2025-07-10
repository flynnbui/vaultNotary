# VaultNotary AWS Deployment Guide
## Cheapest Cost with Future Scalability

This guide provides a cost-optimized AWS deployment strategy for VaultNotary with clear scaling paths.

## 🏗️ Architecture Overview

Your VaultNotary application consists of:
- **Backend**: .NET 8 Web API with Entity Framework
- **Frontend**: Next.js React application  
- **Database**: PostgreSQL (currently RDS)
- **File Storage**: S3 bucket with KMS encryption
- **Background Jobs**: .NET worker service
- **Message Queue**: RabbitMQ (currently local)

## 💰 Phase 1: Minimum Viable Deployment (Ultra-Low Cost)

**Target Cost: $15-25/month**

### Option A: Single EC2 Instance (Cheapest)

```bash
# Deploy everything on one t3.micro instance
# Cost: ~$8-10/month + storage
```

**Infrastructure:**
- 1x t3.micro EC2 instance (Free Tier eligible)
- 1x 20GB GP3 EBS volume
- 1x S3 bucket with lifecycle policies
- PostgreSQL on the same instance
- RabbitMQ containerized locally

**Deployment Steps:**

1. **Launch EC2 Instance**
```bash
# Create security group
aws ec2 create-security-group \
    --group-name vaultnotary-sg \
    --description "VaultNotary Security Group"

# Add rules
aws ec2 authorize-security-group-ingress \
    --group-name vaultnotary-sg \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name vaultnotary-sg \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name vaultnotary-sg \
    --protocol tcp \
    --port 22 \
    --cidr YOUR_IP/32

# Launch instance
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --count 1 \
    --instance-type t3.micro \
    --key-name your-key-pair \
    --security-groups vaultnotary-sg \
    --user-data file://user-data.sh
```

2. **User Data Script (user-data.sh)**
```bash
#!/bin/bash
# Install Docker
yum update -y
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install PostgreSQL
yum install -y postgresql15-server postgresql15
postgresql-setup --initdb
systemctl start postgresql
systemctl enable postgresql

# Configure PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE vaultnotary;"
sudo -u postgres psql -c "CREATE USER vaultnotary_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vaultnotary TO vaultnotary_user;"
```

3. **Deploy using existing docker-compose.yml**
```bash
# On the EC2 instance
git clone your-repo
cd vaultNotary
docker-compose up -d
```

### Option B: AWS Lightsail (Simpler Management)

```bash
# Cost: $5-10/month
# Includes 1 GB RAM, 1 vCPU, 40 GB SSD
```

**Benefits:**
- Fixed monthly pricing
- Built-in monitoring
- Automatic backups
- Easy scaling

**Setup:**
```bash
# Create Lightsail instance
aws lightsail create-instances \
    --instance-names vaultnotary-app \
    --availability-zone us-east-1a \
    --blueprint-id ubuntu_20_04 \
    --bundle-id nano_2_0
```

## 💡 Phase 2: Optimized Production (Scalable)

**Target Cost: $50-100/month**

### Recommended Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   Application   │    │    Database     │
│   (CDN + SSL)   │◄──►│  Load Balancer  │◄──►│   RDS t3.micro  │
│   $5-10/month   │    │   $15/month     │    │   $15/month     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   ECS Fargate   │
                       │   $20-30/month  │
                       └─────────────────┘
```

### Infrastructure as Code

Use the existing CloudFormation template:

```bash
# Deploy simplified version for cost optimization
aws cloudformation create-stack \
    --stack-name vaultnotary-prod \
    --template-body file://infrastructure/cloudformation/vaultnotary-simplified.yml \
    --parameters \
        ParameterKey=Environment,ParameterValue=prod \
        ParameterKey=S3BucketName,ParameterValue=your-unique-bucket-name \
        ParameterKey=VpcId,ParameterValue=vpc-12345678 \
        ParameterKey=SubnetIds,ParameterValue=subnet-12345678,subnet-87654321 \
        ParameterKey=DatabaseName,ParameterValue=vaultnotary \
        ParameterKey=DatabaseUsername,ParameterValue=vaultnotary_user \
        ParameterKey=DatabasePassword,ParameterValue=your_secure_password \
    --capabilities CAPABILITY_IAM
```

### ECS Fargate Deployment

**task-definition.json:**
```json
{
  "family": "vaultnotary",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/vaultnotary-task-role",
  "containerDefinitions": [
    {
      "name": "vaultnotary-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/vaultnotary:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ASPNETCORE_ENVIRONMENT",
          "value": "Production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/vaultnotary",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 📈 Phase 3: High Availability & Scale

**Target Cost: $200-500/month**

### Full Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   ALB + WAF     │    │   ECS Cluster   │
│   Global CDN    │◄──►│   $20/month     │◄──►│   Auto Scaling  │
│   $10-20/month  │    │                 │    │   $100-200/month│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   RDS Multi-AZ  │    │   ElastiCache   │
                       │   $100/month    │    │   $50/month     │
                       └─────────────────┘    └─────────────────┘
```

### Services Configuration

**Auto Scaling Group:**
```bash
# Create launch template
aws ec2 create-launch-template \
    --launch-template-name vaultnotary-template \
    --launch-template-data '{
        "ImageId": "ami-12345678",
        "InstanceType": "t3.small",
        "SecurityGroupIds": ["sg-12345678"],
        "IamInstanceProfile": {"Name": "vaultnotary-instance-profile"},
        "UserData": "base64-encoded-user-data"
    }'

# Create auto scaling group
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name vaultnotary-asg \
    --launch-template LaunchTemplateName=vaultnotary-template,Version=1 \
    --min-size 1 \
    --max-size 5 \
    --desired-capacity 2 \
    --vpc-zone-identifier subnet-12345678,subnet-87654321
```

## 🔧 Cost Optimization Strategies

### 1. Reserved Instances
```bash
# Save 30-60% on EC2 costs
aws ec2 describe-reserved-instances-offerings \
    --instance-type t3.micro \
    --offering-class standard \
    --offering-type "No Upfront"
```

### 2. S3 Lifecycle Policies
```json
{
  "Rules": [
    {
      "Id": "VaultNotaryLifecycle",
      "Status": "Enabled",
      "Filter": {"Prefix": "files/"},
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ]
    }
  ]
}
```

### 3. Database Optimization
```sql
-- Enable connection pooling
-- Set appropriate max_connections
-- Use read replicas for read-heavy workloads
```

### 4. Monitoring & Alerting
```bash
# Set up billing alarms
aws cloudwatch put-metric-alarm \
    --alarm-name "VaultNotary-Billing-Alarm" \
    --alarm-description "Billing alarm for VaultNotary" \
    --metric-name EstimatedCharges \
    --namespace AWS/Billing \
    --statistic Maximum \
    --period 86400 \
    --threshold 100 \
    --comparison-operator GreaterThanThreshold
```

## 📊 Scaling Strategies

### Horizontal Scaling

**Application Tier:**
- ECS Fargate with auto-scaling
- Application Load Balancer
- Multiple availability zones

**Database Tier:**
- Read replicas for read-heavy workloads
- Connection pooling
- Query optimization

### Vertical Scaling

**Start Small, Scale Up:**
1. t3.micro → t3.small → t3.medium
2. db.t3.micro → db.t3.small → db.m5.large
3. Monitor CPU/Memory utilization

### Global Scaling

**CDN & Edge Locations:**
- CloudFront for static assets
- S3 Transfer Acceleration
- Regional deployments

## 🔒 Security Best Practices

### Network Security
```bash
# VPC with private subnets
# Security groups with minimal access
# WAF for application protection
```

### Data Security
```bash
# KMS encryption for S3 and RDS
# SSL/TLS certificates
# Regular security updates
```

### Access Control
```bash
# IAM roles with least privilege
# Multi-factor authentication
# Regular key rotation
```

## 📈 Monitoring & Observability

### CloudWatch Setup
```bash
# Create custom metrics
aws cloudwatch put-metric-data \
    --namespace VaultNotary/Application \
    --metric-data MetricName=DocumentUploads,Value=1,Unit=Count
```

### Log Aggregation
```bash
# Centralized logging with CloudWatch Logs
# Log retention policies
# Log analysis with CloudWatch Insights
```

## 🚀 Deployment Pipeline

### CI/CD with GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Build and push Docker image
        run: |
          docker build -t vaultnotary .
          docker tag vaultnotary:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/vaultnotary:latest
          docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/vaultnotary:latest
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster vaultnotary-cluster --service vaultnotary-service --force-new-deployment
```

## 📋 Migration Checklist

### Pre-Migration
- [ ] Set up AWS account and billing alerts
- [ ] Create IAM users and roles
- [ ] Deploy infrastructure using CloudFormation
- [ ] Test database connectivity
- [ ] Configure SSL certificates

### Migration
- [ ] Export data from current system
- [ ] Deploy application containers
- [ ] Run database migrations
- [ ] Configure monitoring and alerting
- [ ] Test all application endpoints

### Post-Migration
- [ ] Monitor performance and costs
- [ ] Set up automated backups
- [ ] Configure log retention
- [ ] Test disaster recovery procedures
- [ ] Update documentation

## 💡 Cost Examples

### Phase 1: Minimum Viable (Monthly)
- EC2 t3.micro: $8-10
- S3 storage (100GB): $2-3
- Data transfer: $1-2
- **Total: $15-25/month**

### Phase 2: Production Ready (Monthly)
- ECS Fargate: $20-30
- RDS t3.micro: $15-20
- ALB: $15-20
- S3 + CloudFront: $10-15
- **Total: $60-85/month**

### Phase 3: High Availability (Monthly)
- ECS Cluster: $100-200
- RDS Multi-AZ: $100-150
- ElastiCache: $50-80
- WAF + CloudFront: $20-30
- **Total: $270-460/month**

## 🎯 Next Steps

1. **Start with Phase 1** for immediate cost savings
2. **Monitor usage patterns** to optimize scaling
3. **Implement CI/CD pipeline** for automated deployments
4. **Set up comprehensive monitoring** for proactive management
5. **Plan Phase 2 migration** based on growth requirements

This deployment strategy provides a clear path from minimal cost to enterprise-scale while maintaining the flexibility to adapt based on your specific needs and growth patterns.