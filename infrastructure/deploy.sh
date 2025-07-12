#!/bin/bash

# VaultNotary Simplified Infrastructure Deployment Script
set -e

# Configuration
STACK_NAME="${1:-vaultnotary-simplified}"
ENVIRONMENT="${2:-dev}"
REGION="${3:-ap-southeast-1}"
S3_BUCKET_NAME="${4:-vaultnotary-files}"
DB_PASSWORD="${5:-}"
VPC_ID="${6:-}"
SUBNET_IDS="${7:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 VaultNotary Simplified Infrastructure Deployment${NC}"
echo "================================================="
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

# Check if database password is provided
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}❌ Database password is required. Please provide it as the 5th parameter.${NC}"
    echo "Usage: ./deploy-simplified.sh [stack-name] [environment] [region] [s3-bucket-name] [db-password] [vpc-id] [subnet-ids]"
    exit 1
fi

# Auto-detect VPC and subnets if not provided
if [ -z "$VPC_ID" ] || [ -z "$SUBNET_IDS" ]; then
    echo -e "${BLUE}🔍 Auto-detecting VPC and subnets...${NC}"
    
    # Get default VPC
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query 'Vpcs[0].VpcId' --output text --region "$REGION")
    
    if [ "$VPC_ID" == "None" ] || [ -z "$VPC_ID" ]; then
        echo -e "${RED}❌ No default VPC found. Please specify VPC ID and subnet IDs manually.${NC}"
        exit 1
    fi
    
    # Get subnets in the VPC (minimum 2 in different AZs)
    SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[].SubnetId' --output text --region "$REGION")
    SUBNET_ARRAY=($SUBNETS)
    
    if [ ${#SUBNET_ARRAY[@]} -lt 2 ]; then
        echo -e "${RED}❌ Need at least 2 subnets in different AZs for RDS. Found ${#SUBNET_ARRAY[@]} subnets.${NC}"
        exit 1
    fi
    
    # Use first two subnets
    SUBNET_IDS="${SUBNET_ARRAY[0]},${SUBNET_ARRAY[1]}"
fi

echo "Using VPC: $VPC_ID"
echo "Using Subnets: $SUBNET_IDS"
echo ""

# Deploy CloudFormation stack
echo -e "${BLUE}📦 Deploying CloudFormation stack...${NC}"
aws cloudformation deploy \
    --template-file /home/flynn/code/vaultNotary/infrastructure/cloudformation/vaultnotary-simplified.yml \
    --stack-name "$STACK_NAME" \
    --parameter-overrides \
        Environment="$ENVIRONMENT" \
        S3BucketName="$S3_BUCKET_NAME" \
        DatabasePassword="$DB_PASSWORD" \
        VpcId="$VPC_ID" \
        SubnetIds="$SUBNET_IDS" \
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

# Get IAM username
APP_USER=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`AppUserName`].OutputValue' \
    --output text)

echo "1. Create access keys for IAM user:"
echo "   App User: $APP_USER"
echo ""
echo "   Run this command:"
echo "   aws iam create-access-key --user-name $APP_USER"
echo ""

echo "2. Get configuration template:"
echo "   aws cloudformation describe-stacks \\"
echo "     --stack-name $STACK_NAME \\"
echo "     --region $REGION \\"
echo "     --query 'Stacks[0].Outputs[?OutputKey==\`ConfigurationTemplate\`].OutputValue' \\"
echo "     --output text"
echo ""

echo "3. Update your appsettings.json with the values from the configuration template"
echo ""

echo "4. Run database migrations on the PostgreSQL database"
echo ""

echo -e "${GREEN}🎉 Simplified deployment completed! Follow the manual steps above to finish setup.${NC}"