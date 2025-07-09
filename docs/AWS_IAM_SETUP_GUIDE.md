# AWS IAM Setup Guide for VaultNotary

This guide will walk you through creating the necessary AWS IAM users, policies, and configuration for your VaultNotary application.

## Overview

VaultNotary requires access to the following AWS services:
- **Amazon S3**: File storage and retrieval
- **Amazon DynamoDB**: Document and customer data storage
- **AWS KMS**: Encryption and digital signatures
- **Amazon CloudWatch**: Logging and monitoring (optional)

## 1. Create IAM Policies

### S3 Policy for File Operations

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VaultNotaryS3Access",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetObjectVersion",
                "s3:PutObjectAcl"
            ],
            "Resource": [
                "arn:aws:s3:::vaultnotary-files",
                "arn:aws:s3:::vaultnotary-files/*"
            ]
        },
        {
            "Sid": "VaultNotaryS3BucketLocation",
            "Effect": "Allow",
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListAllMyBuckets"
            ],
            "Resource": "*"
        }
    ]
}
```

### DynamoDB Policy for Data Operations

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VaultNotaryDynamoDBAccess",
            "Effect": "Allow",
            "Action": [
                "dynamodb:BatchGetItem",
                "dynamodb:BatchWriteItem",
                "dynamodb:DeleteItem",
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:UpdateItem",
                "dynamodb:DescribeTable",
                "dynamodb:CreateTable",
                "dynamodb:UpdateTable",
                "dynamodb:DescribeTimeToLive",
                "dynamodb:PutTimeToLive"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/VaultNotary-Customers",
                "arn:aws:dynamodb:*:*:table/VaultNotary-Documents",
                "arn:aws:dynamodb:*:*:table/VaultNotary-PartyDocuments",
                "arn:aws:dynamodb:*:*:table/VaultNotary-Customers/index/*",
                "arn:aws:dynamodb:*:*:table/VaultNotary-Documents/index/*",
                "arn:aws:dynamodb:*:*:table/VaultNotary-PartyDocuments/index/*"
            ]
        }
    ]
}
```

### KMS Policy for Encryption and Signatures

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VaultNotaryKMSAccess",
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt",
                "kms:Encrypt",
                "kms:GenerateDataKey",
                "kms:Sign",
                "kms:Verify",
                "kms:GetPublicKey",
                "kms:DescribeKey"
            ],
            "Resource": [
                "arn:aws:kms:*:*:key/*"
            ],
            "Condition": {
                "StringEquals": {
                    "kms:ViaService": [
                        "s3.*.amazonaws.com",
                        "dynamodb.*.amazonaws.com"
                    ]
                }
            }
        }
    ]
}
```

### CloudWatch Logs Policy (Optional)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VaultNotaryCloudWatchLogs",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams"
            ],
            "Resource": "arn:aws:logs:*:*:log-group:/aws/vaultnotary/*"
        }
    ]
}
```

## 2. Create IAM Users

### Step 1: Create Application User

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. Set username: `vaultnotary-app-user`
4. Select "Attach policies directly"
5. Create and attach the policies created above:
   - `VaultNotaryS3Policy`
   - `VaultNotaryDynamoDBPolicy`
   - `VaultNotaryKMSPolicy`
   - `VaultNotaryCloudWatchPolicy` (optional)

### Step 2: Create Background Jobs User

1. Create another user: `vaultnotary-jobs-user`
2. Attach the same policies (background jobs need same access)
3. This separation allows for different security configurations if needed

### Step 3: Generate Access Keys

For each user:
1. Go to user details → Security credentials
2. Click "Create access key"
3. Choose "Application running outside AWS"
4. Save the Access Key ID and Secret Access Key securely

## 3. Create AWS Resources

### Create S3 Bucket

```bash
aws s3 mb s3://vaultnotary-files --region us-east-1
```

Or using AWS Console:
1. Go to S3 → Create bucket
2. Name: `vaultnotary-files`
3. Region: `us-east-1`
4. Block public access: Enable
5. Versioning: Enable (recommended)
6. Encryption: Enable with S3 managed keys

### Create DynamoDB Tables

```bash
# Customers table
aws dynamodb create-table \
    --table-name VaultNotary-Customers \
    --attribute-definitions \
        AttributeName=Id,AttributeType=S \
        AttributeName=DocumentId,AttributeType=S \
        AttributeName=PassportId,AttributeType=S \
    --key-schema AttributeName=Id,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=DocumentIdIndex,KeySchema=[{AttributeName=DocumentId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
        IndexName=PassportIdIndex,KeySchema=[{AttributeName=PassportId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Documents table
aws dynamodb create-table \
    --table-name VaultNotary-Documents \
    --attribute-definitions \
        AttributeName=Id,AttributeType=S \
        AttributeName=Sha256Hash,AttributeType=S \
    --key-schema AttributeName=Id,KeyType=HASH \
    --global-secondary-indexes \
        IndexName=Sha256HashIndex,KeySchema=[{AttributeName=Sha256Hash,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# PartyDocuments table
aws dynamodb create-table \
    --table-name VaultNotary-PartyDocuments \
    --attribute-definitions \
        AttributeName=DocumentId,AttributeType=S \
        AttributeName=CustomerId,AttributeType=S \
    --key-schema \
        AttributeName=DocumentId,KeyType=HASH \
        AttributeName=CustomerId,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### Create KMS Keys

```bash
# Create asymmetric key for signatures
aws kms create-key \
    --description "VaultNotary Asymmetric Signing Key" \
    --key-usage SIGN_VERIFY \
    --key-spec RSA_2048

# Create symmetric key for encryption
aws kms create-key \
    --description "VaultNotary Symmetric Encryption Key" \
    --key-usage ENCRYPT_DECRYPT
```

## 4. Update Application Configuration

### Update appsettings.json

```json
{
  "Aws": {
    "Region": "us-east-1",
    "AccessKey": "YOUR_ACCESS_KEY_ID",
    "SecretKey": "YOUR_SECRET_ACCESS_KEY",
    "DynamoDb": {
      "CustomersTableName": "VaultNotary-Customers",
      "DocumentsTableName": "VaultNotary-Documents",
      "PartyDocumentsTableName": "VaultNotary-PartyDocuments"
    },
    "S3": {
      "BucketName": "vaultnotary-files",
      "FileKeyPrefix": "files/",
      "PresignedUrlExpirationHours": 24
    },
    "Kms": {
      "AsymmetricKeyId": "YOUR_ASYMMETRIC_KEY_ID",
      "SymmetricKeyId": "YOUR_SYMMETRIC_KEY_ID"
    }
  }
}
```

### Update Environment Variables for Docker

Create `.env` file in your project root:

```bash
# AWS Configuration
AWS_ACCESS_KEY=YOUR_ACCESS_KEY_ID
AWS_SECRET_KEY=YOUR_SECRET_ACCESS_KEY
AWS_REGION=us-east-1

# S3 Configuration  
S3_BUCKET_NAME=vaultnotary-files

# DynamoDB Configuration
DYNAMODB_CUSTOMERS_TABLE=VaultNotary-Customers
DYNAMODB_DOCUMENTS_TABLE=VaultNotary-Documents
DYNAMODB_PARTY_DOCUMENTS_TABLE=VaultNotary-PartyDocuments

# KMS Configuration
KMS_ASYMMETRIC_KEY_ID=YOUR_ASYMMETRIC_KEY_ID
KMS_SYMMETRIC_KEY_ID=YOUR_SYMMETRIC_KEY_ID

# RabbitMQ Configuration
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=password
```

### Update docker-compose.yml

```yaml
services:
  api:
    environment:
      - Aws__AccessKey=${AWS_ACCESS_KEY}
      - Aws__SecretKey=${AWS_SECRET_KEY}
      - Aws__Region=${AWS_REGION}
      - Aws__S3__BucketName=${S3_BUCKET_NAME}
      - Aws__DynamoDb__CustomersTableName=${DYNAMODB_CUSTOMERS_TABLE}
      - Aws__DynamoDb__DocumentsTableName=${DYNAMODB_DOCUMENTS_TABLE}
      - Aws__DynamoDb__PartyDocumentsTableName=${DYNAMODB_PARTY_DOCUMENTS_TABLE}
      - Aws__Kms__AsymmetricKeyId=${KMS_ASYMMETRIC_KEY_ID}
      - Aws__Kms__SymmetricKeyId=${KMS_SYMMETRIC_KEY_ID}

  background-jobs:
    environment:
      - Aws__AccessKey=${AWS_ACCESS_KEY}
      - Aws__SecretKey=${AWS_SECRET_KEY}
      - Aws__Region=${AWS_REGION}
      - Aws__S3__BucketName=${S3_BUCKET_NAME}
```

## 5. Security Best Practices

### Use IAM Roles for EC2/ECS (Recommended)

Instead of access keys, use IAM roles when running on AWS infrastructure:

1. Create IAM role with the same policies
2. Attach role to EC2 instance or ECS task
3. Remove AccessKey/SecretKey from configuration
4. AWS SDK will automatically use the role credentials

### Rotate Access Keys Regularly

1. Create second access key for user
2. Update application with new key
3. Test application
4. Delete old access key
5. Repeat every 90 days

### Use AWS Secrets Manager (Advanced)

Store sensitive configuration in AWS Secrets Manager:

```csharp
// Add to Program.cs
builder.Configuration.AddSecretsManager(region: RegionEndpoint.USEast1, secretName: "vaultnotary/config");
```

### Enable CloudTrail

Enable CloudTrail to audit all AWS API calls:
1. Go to CloudTrail → Create trail
2. Name: `vaultnotary-audit-trail`
3. Apply to all regions
4. Include management and data events

## 6. Testing the Setup

### Test S3 Access

```bash
aws s3 ls s3://vaultnotary-files --profile vaultnotary
```

### Test DynamoDB Access

```bash
aws dynamodb list-tables --profile vaultnotary
```

### Test Application

1. Start your application
2. Upload a file through the API
3. Check S3 bucket for the file
4. Check DynamoDB tables for records
5. Verify background job processes the file

## 7. Monitoring and Alerts

### CloudWatch Alarms

Set up alarms for:
- S3 bucket access errors
- DynamoDB throttling
- KMS key usage limits
- Application error rates

### Cost Monitoring

1. Set up billing alerts
2. Monitor S3 storage costs
3. Monitor DynamoDB read/write units
4. Track KMS key usage

## 8. Troubleshooting

### Common Issues

**Access Denied Errors:**
- Check IAM policy resource ARNs
- Verify user has correct policies attached
- Check region consistency

**DynamoDB Throttling:**
- Increase provisioned capacity
- Consider using auto-scaling
- Implement exponential backoff

**S3 Upload Failures:**
- Check bucket permissions
- Verify bucket exists in correct region
- Check file size limits

### Logs to Check

- Application logs in CloudWatch
- AWS CloudTrail for API calls
- VPC Flow Logs for network issues

## Next Steps

1. Implement the IAM setup as outlined
2. Test each service individually
3. Deploy your application
4. Monitor for any issues
5. Set up automated backups
6. Plan for disaster recovery

This setup provides a secure, scalable foundation for your VaultNotary application with proper AWS integration and security practices.