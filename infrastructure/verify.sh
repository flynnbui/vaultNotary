#!/bin/bash

# VaultNotary Infrastructure Verification Script
set -e

# Configuration
STACK_NAME="${1:-vaultnotary-prod}"
REGION="${2:-us-east-1}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 VaultNotary Infrastructure Verification${NC}"
echo "==========================================="
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"
echo ""

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# Get stack outputs
echo -e "${BLUE}📊 Getting stack outputs...${NC}"
S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

CUSTOMERS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`CustomersTableName`].OutputValue' \
    --output text)

DOCUMENTS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`DocumentsTableName`].OutputValue' \
    --output text)

SIGNING_KEY=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`SigningKMSKeyId`].OutputValue' \
    --output text)

APP_USER=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`AppUserName`].OutputValue' \
    --output text)

echo "S3 Bucket: $S3_BUCKET"
echo "Customers Table: $CUSTOMERS_TABLE"
echo "Documents Table: $DOCUMENTS_TABLE"
echo "Signing Key: $SIGNING_KEY"
echo "App User: $APP_USER"
echo ""

# Test 1: Stack Status
echo -e "${BLUE}1. Checking CloudFormation stack status...${NC}"
STACK_STATUS=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].StackStatus' \
    --output text)

if [ "$STACK_STATUS" = "CREATE_COMPLETE" ] || [ "$STACK_STATUS" = "UPDATE_COMPLETE" ]; then
    check_status "Stack is in good state: $STACK_STATUS"
else
    echo -e "${RED}❌ Stack is in unexpected state: $STACK_STATUS${NC}"
fi

# Test 2: S3 Bucket Access
echo -e "${BLUE}2. Testing S3 bucket access...${NC}"
aws s3 ls "s3://$S3_BUCKET" > /dev/null 2>&1
check_status "S3 bucket accessible"

# Test 3: DynamoDB Table Access
echo -e "${BLUE}3. Testing DynamoDB table access...${NC}"
aws dynamodb describe-table --table-name "$CUSTOMERS_TABLE" --region "$REGION" > /dev/null 2>&1
check_status "Customers table accessible"

aws dynamodb describe-table --table-name "$DOCUMENTS_TABLE" --region "$REGION" > /dev/null 2>&1
check_status "Documents table accessible"

# Test 4: KMS Key Access
echo -e "${BLUE}4. Testing KMS key access...${NC}"
aws kms describe-key --key-id "$SIGNING_KEY" --region "$REGION" > /dev/null 2>&1
check_status "KMS signing key accessible"

# Test 5: IAM User Exists
echo -e "${BLUE}5. Testing IAM user exists...${NC}"
aws iam get-user --user-name "$APP_USER" > /dev/null 2>&1
check_status "IAM application user exists"

# Test 6: Test File Upload (if access keys are configured)
echo -e "${BLUE}6. Testing file operations (requires access keys)...${NC}"
echo "test file content" > /tmp/test-file.txt

if aws s3 cp /tmp/test-file.txt "s3://$S3_BUCKET/test/" --region "$REGION" > /dev/null 2>&1; then
    check_status "File upload successful"
    
    # Test download
    if aws s3 cp "s3://$S3_BUCKET/test/test-file.txt" /tmp/downloaded-file.txt --region "$REGION" > /dev/null 2>&1; then
        check_status "File download successful"
        
        # Cleanup
        aws s3 rm "s3://$S3_BUCKET/test/test-file.txt" --region "$REGION" > /dev/null 2>&1
        rm -f /tmp/test-file.txt /tmp/downloaded-file.txt
    else
        echo -e "${YELLOW}⚠️  File download failed (check access keys)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  File upload failed (access keys may not be configured)${NC}"
fi

# Test 7: DynamoDB Write/Read (if access keys are configured)
echo -e "${BLUE}7. Testing DynamoDB operations (requires access keys)...${NC}"
if aws dynamodb put-item \
    --table-name "$CUSTOMERS_TABLE" \
    --item '{"Id":{"S":"test-verification-123"},"FullName":{"S":"Test Customer"}}' \
    --region "$REGION" > /dev/null 2>&1; then
    check_status "DynamoDB write successful"
    
    # Test read
    if aws dynamodb get-item \
        --table-name "$CUSTOMERS_TABLE" \
        --key '{"Id":{"S":"test-verification-123"}}' \
        --region "$REGION" > /dev/null 2>&1; then
        check_status "DynamoDB read successful"
        
        # Cleanup
        aws dynamodb delete-item \
            --table-name "$CUSTOMERS_TABLE" \
            --key '{"Id":{"S":"test-verification-123"}}' \
            --region "$REGION" > /dev/null 2>&1
    else
        echo -e "${YELLOW}⚠️  DynamoDB read failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  DynamoDB write failed (access keys may not be configured)${NC}"
fi

# Test 8: CloudWatch Log Groups
echo -e "${BLUE}8. Testing CloudWatch log groups...${NC}"
aws logs describe-log-groups \
    --log-group-name-prefix "/aws/vaultnotary" \
    --region "$REGION" > /dev/null 2>&1
check_status "CloudWatch log groups exist"

echo ""
echo -e "${BLUE}📋 Verification Summary:${NC}"
echo "================================"

# Count successful tests
TOTAL_CRITICAL_TESTS=5
echo "Critical infrastructure tests completed."
echo ""

if aws s3 ls "s3://$S3_BUCKET" > /dev/null 2>&1 && \
   aws dynamodb describe-table --table-name "$CUSTOMERS_TABLE" --region "$REGION" > /dev/null 2>&1 && \
   aws kms describe-key --key-id "$SIGNING_KEY" --region "$REGION" > /dev/null 2>&1; then
    echo -e "${GREEN}🎉 Core infrastructure is working correctly!${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Ensure access keys are created for IAM users"
    echo "2. Update your application configuration"
    echo "3. Deploy and test your VaultNotary application"
    echo "4. Monitor CloudWatch logs and metrics"
else
    echo -e "${RED}❌ Some critical tests failed. Check the output above.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "View stack outputs:"
echo "  aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs'"
echo ""
echo "Get configuration template:"
echo "  aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].Outputs[?OutputKey==\`ConfigurationTemplate\`].OutputValue' --output text"
echo ""
echo "Monitor stack events:"
echo "  aws cloudformation describe-stack-events --stack-name $STACK_NAME --region $REGION"