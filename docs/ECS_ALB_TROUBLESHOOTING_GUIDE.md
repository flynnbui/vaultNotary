# ECS ALB Health Check Troubleshooting Guide

## Overview
This document outlines the issues encountered during ECS deployment with Application Load Balancer (ALB) health checks and their solutions. The main problem was ECS tasks continuously failing health checks and being killed by the orchestrator.

## Issues Encountered and Solutions

### 1. Missing Health Check Endpoint

**Issue**: 
- ELB target group was configured to check `/health` endpoint
- ASP.NET Core application didn't have a `/health` endpoint configured
- Health checks were timing out causing tasks to be marked unhealthy

**Symptoms**:
```
Target.Timeout - Request timed out
```

**Root Cause**:
The application was missing the health check endpoint that the load balancer was trying to reach.

**Solution**:
Added health check configuration to `Program.cs`:

```csharp
// Add health checks service
builder.Services.AddHealthChecks();

// Map health check endpoint
app.MapHealthChecks("/health");
```

**Files Modified**:
- `backend/src/VaultNotary.Web/Program.cs`

---

### 2. Incorrect Environment Configuration

**Issue**:
- Application was configured with `ASPNETCORE_ENVIRONMENT=Production`
- This caused authentication middleware to be active, blocking health check requests
- Conflicting environment variables in `.env` file

**Symptoms**:
- Health checks failing
- Application logs showing "Hosting environment: Production"

**Root Cause**:
Production environment requires authentication for all endpoints, including health checks.

**Solution**:
1. Updated `.env` file to use `ASPNETCORE_ENVIRONMENT=Test`
2. Updated ECS task definition to use `Test` environment
3. Removed duplicate environment variable declarations

**Files Modified**:
- `.env`
- `vaultnotary-task-definition.json`

---

### 3. Availability Zone Mismatch

**Issue**:
- ECS tasks were being scheduled in `ap-southeast-1a`
- ALB was only configured for `ap-southeast-1b` and `ap-southeast-1c`
- Tasks in incompatible AZs were marked as "unused"

**Symptoms**:
```json
{
  "State": "unused",
  "Reason": "Target.NotInUse", 
  "Description": "Target is in an Availability Zone that is not enabled for the load balancer"
}
```

**Root Cause**:
ECS service was configured with 3 subnets but ALB only operated in 2 availability zones.

**Solution**:
Manually stopped tasks running in incompatible AZs to force ECS to reschedule them in compatible zones.

**Command Used**:
```bash
aws ecs stop-task --cluster vaultnotary-cluster --task <task-id> --reason "Force restart in compatible AZ"
```

---

### 4. Security Group Ingress Rules Missing

**Issue**:
- ALB couldn't reach ECS tasks for health checks
- Security group didn't allow self-referencing traffic
- ALB and ECS tasks used the same security group but couldn't communicate

**Symptoms**:
- Health checks timing out
- Direct curl to task IP failing

**Root Cause**:
Security group lacked a rule allowing traffic from itself, preventing ALB-to-ECS communication.

**Solution**:
Added ingress rule allowing traffic from the security group to itself:

```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-0b9d5bfa3490a59f3 \
  --protocol tcp \
  --port 80 \
  --source-group sg-0b9d5bfa3490a59f3
```

---

### 5. Security Group Egress Rules Missing

**Issue**:
- ALB couldn't make outbound connections to ECS tasks
- Security group only allowed outbound PostgreSQL (5432) and HTTPS (443)
- No outbound HTTP (80) rule for health checks

**Symptoms**:
- Health checks still timing out after fixing ingress rules
- Application accessible via public IP but not through ALB

**Root Cause**:
ALB needs outbound HTTP access to perform health checks on ECS tasks.

**Solution**:
Added egress rule allowing outbound HTTP traffic:

```bash
aws ec2 authorize-security-group-egress \
  --group-id sg-0b9d5bfa3490a59f3 \
  --protocol tcp \
  --port 80 \
  --cidr 172.31.0.0/16
```

---

## Key Learnings

### 1. Health Check Requirements
- Always implement health check endpoints in applications
- Ensure health endpoints are accessible without authentication
- Match ALB health check path with application endpoint

### 2. Environment Configuration
- Use `Test` or `Development` environment for non-production deployments
- Avoid production settings that block health checks
- Keep environment variables consistent across deployment files

### 3. Network Security
- ALB and ECS tasks need bidirectional communication
- Security groups must allow:
  - **Ingress**: Traffic from ALB to ECS tasks
  - **Egress**: Traffic from ALB to ECS tasks
- Self-referencing security group rules are essential for ALB-ECS communication

### 4. Availability Zone Planning
- Ensure ALB and ECS subnets are in the same availability zones
- ALB requires at least 2 AZs for high availability
- ECS service subnet configuration should match ALB AZ coverage

### 5. Troubleshooting Steps
1. Check application logs for startup errors
2. Verify health endpoint accessibility
3. Confirm environment configuration
4. Validate security group rules (both ingress and egress)
5. Check availability zone alignment
6. Test connectivity from ALB perspective

## Health Check Configuration Summary

**Target Group Settings**:
- Health check path: `/health`
- Health check interval: 30 seconds
- Health check timeout: 5 seconds
- Healthy threshold: 5 consecutive successes
- Unhealthy threshold: 2 consecutive failures

**Application Configuration**:
```csharp
// In Program.cs
builder.Services.AddHealthChecks();
app.MapHealthChecks("/health");
```

**Security Group Rules Required**:
```bash
# Ingress: Allow ALB to reach ECS tasks
Type: HTTP, Port: 80, Source: sg-0b9d5bfa3490a59f3

# Egress: Allow ALB to make outbound requests
Type: HTTP, Port: 80, Destination: 172.31.0.0/16
```

## Final Result
After implementing all fixes:
- ✅ Health checks passing consistently
- ✅ ECS tasks remain stable
- ✅ ALB properly routes traffic to healthy targets
- ✅ Application accessible through ALB endpoint

## Prevention Checklist
- [ ] Health check endpoint implemented and tested
- [ ] Environment variables properly configured
- [ ] Security group allows bidirectional ALB-ECS communication
- [ ] ALB and ECS subnets in same availability zones
- [ ] Task definition uses correct environment settings
- [ ] Health check path matches application endpoint