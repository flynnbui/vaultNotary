#!/bin/bash

# VaultNotary Core Infrastructure Deployment Script
set -e

# Configuration
STACK_NAME="${1:-vaultnotary-core}"
ENVIRONMENT="${2:-prod}"
REGION="${3:-ap-southeast-1}"
S3_BUCKET_NAME="${4:-vaultnotary-files}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 VaultNotary Core Infrastructure Deployment${NC}"
echo "============================================="
echo "Stack Name: $STACK_NAME"
echo "Environment: $ENVIRONMENT" 
echo "Region: $REGION"
echo "S3 Bucket Base Name: $S3_BUCKET_NAME"
echo ""

# Check AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ AWS CLI not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

# Get current AWS account ID for unique naming
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $ACCOUNT_ID"
echo ""

# Wait for any existing DynamoDB tables to be deleted
echo -e "${BLUE}🕐 Checking for existing DynamoDB tables...${NC}"
while aws dynamodb describe-table --table-name "VaultNotary-Customers-$ENVIRONMENT" --region "$REGION" >/dev/null 2>&1 || \
      aws dynamodb describe-table --table-name "VaultNotary-Documents-$ENVIRONMENT" --region "$REGION" >/dev/null 2>&1 || \
      aws dynamodb describe-table --table-name "VaultNotary-PartyDocuments-$ENVIRONMENT" --region "$REGION" >/dev/null 2>&1; do
    echo "Waiting for DynamoDB tables to be deleted..."
    sleep 10
done
echo "✅ No conflicting DynamoDB tables found"
echo ""

# Deploy CloudFormation stack
echo -e "${BLUE}📦 Deploying CloudFormation stack...${NC}"
aws cloudformation deploy \
    --template-file cloudformation/vaultnotary-core.yml \
    --stack-name "$STACK_NAME" \
    --parameter-overrides \
        Environment="$ENVIRONMENT" \
        S3BucketName="$S3_BUCKET_NAME" \
        DynamoDBBillingMode=PAY_PER_REQUEST \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$REGION" \
    --tags \
        Environment="$ENVIRONMENT" \
        Application=VaultNotary \
        ManagedBy=CloudFormation

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CloudFormation stack deployed successfully!${NC}"
else
    echo -e "${RED}❌ CloudFormation deployment failed!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Stack Outputs:${NC}"
aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

echo ""
echo -e "${YELLOW}⚠️  MANUAL STEPS REQUIRED:${NC}"
echo ""

# Get IAM usernames
APP_USER=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`AppUserName`].OutputValue' \
    --output text)

JOBS_USER=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`JobsUserName`].OutputValue' \
    --output text)

echo "1. Create access keys for IAM users:"
echo "   App User: $APP_USER"
echo "   Jobs User: $JOBS_USER"
echo ""
echo "   Run these commands:"
echo "   aws iam create-access-key --user-name $APP_USER"
echo "   aws iam create-access-key --user-name $JOBS_USER"
echo ""

echo "2. Get configuration template:"
echo "   aws cloudformation describe-stacks \\"
echo "     --stack-name $STACK_NAME \\"
echo "     --region $REGION \\"
echo "     --query 'Stacks[0].Outputs[?OutputKey==\`ConfigurationTemplate\`].OutputValue' \\"
echo "     --output text > config-template.json"
echo ""

echo "3. Update your appsettings.json with the values from config-template.json"
echo ""

echo "4. Run verification tests:"
echo "   ./verify.sh $STACK_NAME $REGION"
echo ""

echo -e "${GREEN}🎉 Core deployment completed! Follow the manual steps above to finish setup.${NC}"