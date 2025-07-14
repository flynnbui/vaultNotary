# Backend Deployment Guide

This guide outlines the steps to deploy the backend Docker image to AWS ECS.

1.  **Build Docker Image:**
    Navigate to the project root and build the Docker image:
    ```bash
    docker build -t vaultnotary-backend -f backend/src/VaultNotary.Web/Dockerfile backend/src
    ```

2.  **Login to ECR:**
    Login to your AWS ECR registry (replace `ap-southeast-1` with your region and `119107229504.dkr.ecr.ap-southeast-1.amazonaws.com` with your ECR URI):
    ```bash
    aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 119107229504.dkr.ecr.ap-southeast-1.amazonaws.com
    ```

3.  **Tag and Push Image:**
    Tag the built image and push it to your ECR repository (replace `119107229504.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary` with your ECR repository URI):
    ```bash
    docker tag vaultnotary-backend:latest 119107229504.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary:latest
    docker push 119107229504.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary:latest
    ```

4.  **Register New ECS Task Definition:**
    Register a new task definition using the `ecs-task-definition.json` file:
    ```bash
    aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
    ```

5.  **Update ECS Service:**
    Update your ECS service to use the newly registered task definition (replace `vaultnotary-cluster` and `vaultnotary-service` with your cluster and service names):
    ```bash
    aws ecs update-service --cluster vaultnotary-cluster --service vaultnotary-service --task-definition vaultnotary --force-new-deployment
    ```