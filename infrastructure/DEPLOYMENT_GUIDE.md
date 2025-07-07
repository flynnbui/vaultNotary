# VaultNotary CloudFormation Deployment Guide

## 🚀 Quick Deployment

### 1. Deploy the CloudFormation Stack

```bash
# Navigate to the infrastructure directory
cd /path/to/vaultNotary/infrastructure/cloudformation

# Deploy the stack (replace parameters as needed)
aws cloudformation create-stack \
  --stack-name vaultnotary-prod \
  --template-body file://vaultnotary-stack.yml \
  --parameters \
    ParameterKey=Environment,ParameterValue=prod \
    ParameterKey=S3BucketName,ParameterValue=your-unique-bucket-name \
    ParameterKey=EnableVersioning,ParameterValue=true \
    ParameterKey=EnableCloudTrail,ParameterValue=true \
    ParameterKey=DynamoDBBillingMode,ParameterValue=PAY_PER_REQUEST \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Monitor deployment progress
aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].StackStatus'
```

### 2. Alternative: Deploy via AWS Console

1. Go to **CloudFormation** in AWS Console
2. Click **Create Stack** → **With new resources**
3. Upload the `vaultnotary-stack.yml` file
4. Fill in parameters:
   - **Environment**: `prod` (or `dev`/`staging`)
   - **S3BucketName**: Choose a globally unique name
   - **EnableVersioning**: `true`
   - **EnableCloudTrail**: `true`
   - **DynamoDBBillingMode**: `PAY_PER_REQUEST`
5. Check **I acknowledge that AWS CloudFormation might create IAM resources**
6. Click **Create Stack**

## 📋 What Gets Created Automatically

### ✅ Infrastructure Resources
- **S3 Bucket** with encryption, versioning, and lifecycle policies
- **3 DynamoDB Tables** (Customers, Documents, PartyDocuments) with indexes
- **2 KMS Keys** (S3 encryption + document signing)
- **4 IAM Policies** with least-privilege permissions
- **2 IAM Users** (app + background jobs)
- **CloudWatch Log Groups** for monitoring
- **CloudTrail** for auditing (optional)
- **CloudWatch Alarms** for error monitoring

### ✅ Security Features
- **Encrypted storage** (S3 + DynamoDB)
- **Point-in-time recovery** for DynamoDB
- **S3 public access blocked**
- **IAM least-privilege policies**
- **KMS key rotation** enabled

### ✅ Monitoring & Compliance
- **CloudWatch logs** for all services
- **CloudTrail auditing** of all API calls
- **Cost optimization** with S3 lifecycle rules
- **Automatic backups** via DynamoDB streams

## 🔑 Manual Steps Required

### 1. Generate IAM Access Keys

**⚠️ CRITICAL: You must do this manually for security reasons**

```bash
# Get the IAM usernames from stack outputs
aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`AppUserName`].OutputValue' \
  --output text

aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`JobsUserName`].OutputValue' \
  --output text
```

**Create access keys for Application User:**
```bash
APP_USER=$(aws cloudformation describe-stacks --stack-name vaultnotary-prod --query 'Stacks[0].Outputs[?OutputKey==`AppUserName`].OutputValue' --output text)

aws iam create-access-key --user-name $APP_USER
```

**Create access keys for Jobs User:**
```bash
JOBS_USER=$(aws cloudformation describe-stacks --stack-name vaultnotary-prod --query 'Stacks[0].Outputs[?OutputKey==`JobsUserName`].OutputValue' --output text)

aws iam create-access-key --user-name $JOBS_USER
```

**💾 Save these credentials securely!**

### 2. Update Application Configuration

Get the configuration template from CloudFormation outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`ConfigurationTemplate`].OutputValue' \
  --output text > config-template.json
```

Update your `appsettings.json`:
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
      "BucketName": "your-bucket-name-prod-123456789",
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

### 3. Update Environment Variables for Docker

Create/update your `.env` file:
```bash
# Extract values from CloudFormation outputs
aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].Outputs' > stack-outputs.json

# Create .env file
cat > .env << EOF
# AWS Configuration
AWS_ACCESS_KEY=YOUR_APP_ACCESS_KEY_ID
AWS_SECRET_KEY=YOUR_APP_SECRET_ACCESS_KEY
AWS_REGION=us-east-1

# Background Jobs AWS Configuration  
JOBS_AWS_ACCESS_KEY=YOUR_JOBS_ACCESS_KEY_ID
JOBS_AWS_SECRET_KEY=YOUR_JOBS_SECRET_ACCESS_KEY

# S3 Configuration
S3_BUCKET_NAME=$(jq -r '.[] | select(.OutputKey=="S3BucketName") | .OutputValue' stack-outputs.json)

# DynamoDB Configuration
DYNAMODB_CUSTOMERS_TABLE=$(jq -r '.[] | select(.OutputKey=="CustomersTableName") | .OutputValue' stack-outputs.json)
DYNAMODB_DOCUMENTS_TABLE=$(jq -r '.[] | select(.OutputKey=="DocumentsTableName") | .OutputValue' stack-outputs.json)
DYNAMODB_PARTY_DOCUMENTS_TABLE=$(jq -r '.[] | select(.OutputKey=="PartyDocumentsTableName") | .OutputValue' stack-outputs.json)

# KMS Configuration
KMS_ASYMMETRIC_KEY_ID=$(jq -r '.[] | select(.OutputKey=="SigningKMSKeyId") | .OutputValue' stack-outputs.json)
KMS_SYMMETRIC_KEY_ID=$(jq -r '.[] | select(.OutputKey=="S3KMSKeyId") | .OutputValue' stack-outputs.json)
EOF
```

## ✅ Verification Steps

### 1. Check Stack Deployment Status

```bash
# Verify stack creation completed successfully
aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].StackStatus'

# Should return: CREATE_COMPLETE
```

### 2. Test S3 Access

```bash
# Get bucket name
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
  --output text)

# Test upload (using app user credentials)
echo "test file" > test.txt
aws s3 cp test.txt s3://$BUCKET_NAME/test/ --profile vaultnotary-app

# Test download
aws s3 cp s3://$BUCKET_NAME/test/test.txt downloaded.txt --profile vaultnotary-app

# Clean up
rm test.txt downloaded.txt
aws s3 rm s3://$BUCKET_NAME/test/test.txt --profile vaultnotary-app
```

### 3. Test DynamoDB Access

```bash
# Get table names
CUSTOMERS_TABLE=$(aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`CustomersTableName`].OutputValue' \
  --output text)

# Test table access
aws dynamodb describe-table --table-name $CUSTOMERS_TABLE --profile vaultnotary-app

# Test write operation
aws dynamodb put-item \
  --table-name $CUSTOMERS_TABLE \
  --item '{"Id":{"S":"test-123"},"FullName":{"S":"Test Customer"}}' \
  --profile vaultnotary-app

# Test read operation
aws dynamodb get-item \
  --table-name $CUSTOMERS_TABLE \
  --key '{"Id":{"S":"test-123"}}' \
  --profile vaultnotary-app

# Clean up test item
aws dynamodb delete-item \
  --table-name $CUSTOMERS_TABLE \
  --key '{"Id":{"S":"test-123"}}' \
  --profile vaultnotary-app
```

### 4. Test KMS Access

```bash
# Get KMS key IDs
SIGNING_KEY=$(aws cloudformation describe-stacks \
  --stack-name vaultnotary-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`SigningKMSKeyId`].OutputValue' \
  --output text)

# Test KMS access
aws kms describe-key --key-id $SIGNING_KEY --profile vaultnotary-app

# Test signing capability
echo "test message" > message.txt
aws kms sign \
  --key-id $SIGNING_KEY \
  --message fileb://message.txt \
  --message-type RAW \
  --signing-algorithm RSASSA_PKCS1_V1_5_SHA_256 \
  --profile vaultnotary-app

rm message.txt
```

### 5. Test Application Integration

```bash
# Start your application with the new configuration
cd /path/to/vaultNotary
docker-compose up -d

# Test file upload endpoint
curl -X POST http://localhost:3000/api/upload/single \
  -F "file=@test-document.pdf" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Check logs
docker-compose logs api
docker-compose logs background-jobs
```

## 🔍 Monitoring & Troubleshooting

### CloudWatch Dashboards

Access your monitoring dashboards:
- **S3 Metrics**: AWS Console → CloudWatch → Dashboards
- **DynamoDB Metrics**: Monitor read/write capacity and throttling
- **Application Logs**: View structured logs in CloudWatch

### Common Issues & Solutions

**Access Denied Errors:**
```bash
# Check IAM user policies
aws iam list-attached-user-policies --user-name YOUR_USER_NAME

# Verify resource ARNs match
aws cloudformation describe-stack-resources --stack-name vaultnotary-prod
```

**DynamoDB Throttling:**
```bash
# Check current capacity
aws dynamodb describe-table --table-name YOUR_TABLE_NAME

# Monitor throttling metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ThrottledRequests \
  --dimensions Name=TableName,Value=YOUR_TABLE_NAME \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

**S3 Upload Issues:**
```bash
# Check bucket policy and CORS
aws s3api get-bucket-policy --bucket YOUR_BUCKET_NAME
aws s3api get-bucket-cors --bucket YOUR_BUCKET_NAME

# Test with verbose output
aws s3 cp test.txt s3://YOUR_BUCKET_NAME/ --debug
```

## 🗑️ Cleanup

To delete all resources:

```bash
# Delete the CloudFormation stack
aws cloudformation delete-stack --stack-name vaultnotary-prod

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name vaultnotary-prod

# Verify deletion
aws cloudformation describe-stacks --stack-name vaultnotary-prod
# Should return: Stack does not exist
```

**⚠️ Warning**: This will permanently delete all data in S3 and DynamoDB!

## 📞 Support

If you encounter issues:

1. **Check CloudFormation Events**: AWS Console → CloudFormation → Events tab
2. **Review Stack Outputs**: Ensure all expected outputs are present
3. **Validate IAM Permissions**: Use AWS IAM Policy Simulator
4. **Monitor CloudWatch Logs**: Check application and infrastructure logs
5. **Test Components Individually**: Use the verification steps above

## 🔄 Updates & Maintenance

### Update Stack
```bash
# Update the stack with new template
aws cloudformation update-stack \
  --stack-name vaultnotary-prod \
  --template-body file://vaultnotary-stack.yml \
  --capabilities CAPABILITY_IAM
```

### Rotate Access Keys
```bash
# Create new access key
aws iam create-access-key --user-name YOUR_USER_NAME

# Update application configuration
# Test with new keys
# Delete old access key
aws iam delete-access-key --user-name YOUR_USER_NAME --access-key-id OLD_KEY_ID
```

The CloudFormation stack provides a complete, production-ready infrastructure for VaultNotary with proper security, monitoring, and cost optimization built-in.