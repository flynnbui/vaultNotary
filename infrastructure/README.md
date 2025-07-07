# VaultNotary AWS Infrastructure

This directory contains CloudFormation templates and deployment scripts to set up the complete AWS infrastructure for VaultNotary.

## 🏗️ What Gets Created

### 📦 **Automatic Resources**
- **S3 Bucket** with encryption, versioning, and lifecycle policies
- **3 DynamoDB Tables** (Customers, Documents, PartyDocuments) with indexes
- **2 KMS Keys** (S3 encryption + document signing) 
- **4 IAM Policies** with least-privilege permissions
- **2 IAM Users** (application + background jobs)
- **CloudWatch Log Groups** for monitoring
- **CloudTrail** for auditing (optional)
- **CloudWatch Alarms** for error monitoring

### 🔐 **Security Features**
- Encrypted storage (S3 + DynamoDB)
- Point-in-time recovery for DynamoDB
- S3 public access blocked
- IAM least-privilege policies
- KMS key rotation enabled

## 🚀 Quick Start

### 1. **Prerequisites**
```bash
# Install and configure AWS CLI
aws configure
# Set your region, access key, and secret key

# Verify configuration
aws sts get-caller-identity
```

### 2. **Deploy Infrastructure**
```bash
cd infrastructure

# Deploy with default settings
./deploy.sh

# Or customize deployment
./deploy.sh my-stack-name prod us-east-1 my-unique-bucket-name
```

### 3. **Verify Deployment**
```bash
# Run verification tests
./verify.sh

# Or specify custom stack
./verify.sh my-stack-name us-east-1
```

## 📋 Manual Steps Required

**⚠️ IMPORTANT: These steps cannot be automated for security reasons**

### 1. **Create IAM Access Keys**
```bash
# Get usernames from stack output
STACK_NAME="vaultnotary-prod"
APP_USER=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`AppUserName`].OutputValue' \
  --output text)

JOBS_USER=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`JobsUserName`].OutputValue' \
  --output text)

# Create access keys
aws iam create-access-key --user-name $APP_USER
aws iam create-access-key --user-name $JOBS_USER

# 💾 SAVE THESE CREDENTIALS SECURELY!
```

### 2. **Get Configuration Template**
```bash
aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`ConfigurationTemplate`].OutputValue' \
  --output text > config-template.json
```

### 3. **Update Application Configuration**

Update `backend/src/VaultNotary.Web/appsettings.json`:
```json
{
  "Aws": {
    "Region": "us-east-1",
    "AccessKey": "YOUR_APP_ACCESS_KEY_ID",
    "SecretKey": "YOUR_APP_SECRET_ACCESS_KEY",
    "DynamoDb": {
      "CustomersTableName": "VaultNotary-Customers-prod",
      "DocumentsTableName": "VaultNotary-Documents-prod",
      "PartyDocumentsTableName": "VaultNotary-PartyDocuments-prod"
    },
    "S3": {
      "BucketName": "vaultnotary-files-prod-123456789",
      "FileKeyPrefix": "files/",
      "PresignedUrlExpirationHours": 24
    },
    "Kms": {
      "AsymmetricKeyId": "arn:aws:kms:us-east-1:123456789:key/...",
      "SymmetricKeyId": "arn:aws:kms:us-east-1:123456789:key/..."
    }
  }
}
```

### 4. **Update Docker Environment Variables**

Create/update `.env` file in project root:
```bash
# AWS Configuration
AWS_ACCESS_KEY=YOUR_APP_ACCESS_KEY_ID
AWS_SECRET_KEY=YOUR_APP_SECRET_ACCESS_KEY
AWS_REGION=us-east-1

# Background Jobs AWS Configuration
JOBS_AWS_ACCESS_KEY=YOUR_JOBS_ACCESS_KEY_ID
JOBS_AWS_SECRET_KEY=YOUR_JOBS_SECRET_ACCESS_KEY

# S3 Configuration (from stack output)
S3_BUCKET_NAME=vaultnotary-files-prod-123456789

# DynamoDB Configuration (from stack output)
DYNAMODB_CUSTOMERS_TABLE=VaultNotary-Customers-prod
DYNAMODB_DOCUMENTS_TABLE=VaultNotary-Documents-prod
DYNAMODB_PARTY_DOCUMENTS_TABLE=VaultNotary-PartyDocuments-prod

# KMS Configuration (from stack output)
KMS_ASYMMETRIC_KEY_ID=arn:aws:kms:us-east-1:123456789:key/...
KMS_SYMMETRIC_KEY_ID=arn:aws:kms:us-east-1:123456789:key/...
```

## 🔍 Verification Checklist

Run the verification script to check all components:

```bash
./verify.sh
```

**Expected Results:**
- ✅ Stack status: CREATE_COMPLETE
- ✅ S3 bucket accessible
- ✅ DynamoDB tables accessible  
- ✅ KMS keys accessible
- ✅ IAM users exist
- ✅ File upload/download works (with access keys)
- ✅ DynamoDB read/write works (with access keys)
- ✅ CloudWatch log groups exist

## 📁 File Structure

```
infrastructure/
├── README.md                          # This file
├── DEPLOYMENT_GUIDE.md               # Detailed deployment guide
├── deploy.sh                         # Automated deployment script
├── verify.sh                         # Verification test script
└── cloudformation/
    ├── vaultnotary-stack-fixed.yml   # Main CloudFormation template
    └── vaultnotary-stack.yml         # Original template (has circular deps)
```

## 🛠️ Troubleshooting

### Common Issues

**1. Circular Dependencies Error**
- Use `vaultnotary-stack-fixed.yml` instead of `vaultnotary-stack.yml`

**2. Access Denied Errors**
```bash
# Check IAM policies are attached
aws iam list-attached-user-policies --user-name YOUR_USER_NAME

# Verify resource ARNs
aws cloudformation describe-stack-resources --stack-name YOUR_STACK_NAME
```

**3. S3 Bucket Name Already Exists**
```bash
# Use a more unique bucket name
./deploy.sh my-stack prod us-east-1 my-company-vaultnotary-files
```

**4. DynamoDB Throttling**
```bash
# Check current capacity
aws dynamodb describe-table --table-name YOUR_TABLE_NAME

# Switch to on-demand billing
# Redeploy with DynamoDBBillingMode=PAY_PER_REQUEST
```

### Debug Commands

```bash
# Check stack events
aws cloudformation describe-stack-events --stack-name vaultnotary-prod

# Get detailed stack information
aws cloudformation describe-stacks --stack-name vaultnotary-prod

# Check CloudWatch logs
aws logs describe-log-groups --log-group-name-prefix "/aws/vaultnotary"

# Test IAM permissions
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789:user/vaultnotary-app-user-prod \
  --action-names s3:GetObject \
  --resource-arns arn:aws:s3:::your-bucket-name/*
```

## 🗑️ Cleanup

To delete all infrastructure:

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name vaultnotary-prod

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name vaultnotary-prod

# Verify deletion
aws cloudformation describe-stacks --stack-name vaultnotary-prod
# Should return: Stack does not exist
```

**⚠️ Warning**: This will permanently delete all data!

## 💰 Cost Optimization

The infrastructure includes several cost optimization features:

- **S3 Lifecycle Rules**: Automatically transition to cheaper storage classes
- **DynamoDB On-Demand**: Pay only for what you use
- **CloudWatch Log Retention**: Automatic log cleanup
- **KMS Key Rotation**: Included in AWS costs

**Estimated Monthly Costs** (for moderate usage):
- S3: $5-20
- DynamoDB: $10-50  
- KMS: $1-5
- CloudWatch: $2-10
- **Total: ~$20-85/month**

## 🔄 Updates and Maintenance

### Update Infrastructure
```bash
# Modify the CloudFormation template
# Then redeploy
./deploy.sh

# Or use AWS CLI directly
aws cloudformation update-stack \
  --stack-name vaultnotary-prod \
  --template-body file://cloudformation/vaultnotary-stack-fixed.yml \
  --capabilities CAPABILITY_IAM
```

### Rotate Access Keys
```bash
# Create new access key
aws iam create-access-key --user-name YOUR_USER_NAME

# Update application configuration with new keys
# Test application
# Delete old access key
aws iam delete-access-key --user-name YOUR_USER_NAME --access-key-id OLD_KEY_ID
```

### Monitor Resources
```bash
# Check S3 usage
aws s3api get-bucket-versioning --bucket YOUR_BUCKET_NAME
aws s3 ls s3://YOUR_BUCKET_NAME --recursive --human-readable --summarize

# Check DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=YOUR_TABLE_NAME \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

## 📞 Support

For issues with the infrastructure:

1. **Check CloudFormation Events**: AWS Console → CloudFormation → Events tab
2. **Run Verification Script**: `./verify.sh`
3. **Review Logs**: CloudWatch → Log Groups → `/aws/vaultnotary/`
4. **Test Individual Components**: Use verification commands above

## 🏆 Production Readiness

This infrastructure is production-ready with:

- ✅ **Security**: Encryption, IAM least privilege, access controls
- ✅ **Reliability**: Multi-AZ, backups, point-in-time recovery
- ✅ **Scalability**: Auto-scaling DynamoDB, S3 unlimited storage
- ✅ **Monitoring**: CloudWatch logs, metrics, alarms
- ✅ **Compliance**: CloudTrail auditing, encryption at rest
- ✅ **Cost Optimization**: Lifecycle rules, on-demand billing

The infrastructure follows AWS Well-Architected Framework principles and is ready for production workloads.