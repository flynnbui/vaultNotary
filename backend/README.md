# VaultNotary Backend API

A secure notary document management system built with .NET 8, implementing Clean Architecture patterns with AWS cloud integration and PostgreSQL database.

## 🏗️ Architecture

The backend follows Clean Architecture principles with clear separation of concerns:

```
VaultNotary.Backend/
├── src/
│   ├── VaultNotary.Domain/           # Core business entities and rules
│   │   ├── Entities/                # Core domain models
│   │   ├── Repositories/            # Repository interfaces
│   │   └── Services/                # Domain service interfaces
│   │
│   ├── VaultNotary.Application/     # Use cases and application logic
│   │   ├── DTOs/                    # Data transfer objects
│   │   ├── Services/                # Application services
│   │   └── Validators/              # Input validation
│   │
│   ├── VaultNotary.Infrastructure/  # External concerns implementation
│   │   ├── Data/                    # Database context
│   │   ├── Repositories/            # Repository implementations
│   │   ├── Services/                # External service implementations
│   │   └── Jobs/                    # Background job processing
│   │
│   └── VaultNotary.Web/             # API controllers and middleware
│       ├── Controllers/             # REST API endpoints
│       ├── Authorization/           # Auth0 integration
│       └── Middleware/              # Custom middleware
│
└── tests/                           # Comprehensive test suites
    ├── VaultNotary.UnitTests/       # Unit tests
    └── VaultNotary.IntegrationTests/ # Integration tests
```

## 🚀 Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/) (local or AWS RDS)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)
- AWS Account (for S3, KMS, and RDS)

### Local Development Setup

1. **Clone and navigate to backend:**
   ```bash
   git clone <repository-url>
   cd vaultNotary/backend
   ```

2. **Install dependencies:**
   ```bash
   dotnet restore
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Database setup:**
   ```bash
   # Apply migrations
   dotnet ef database update --project src/VaultNotary.Infrastructure --startup-project src/VaultNotary.Web
   ```

5. **Run the application:**
   ```bash
   dotnet run --project src/VaultNotary.Web
   ```

The API will be available at `https://localhost:5001` with Swagger documentation at `/swagger`.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ASPNETCORE_ENVIRONMENT` | Application environment | Yes | `Development` |
| `ConnectionStrings__DefaultConnection` | PostgreSQL connection string | Yes | - |
| `Aws__Region` | AWS region | Yes | `ap-southeast-1` |
| `Aws__AccessKey` | AWS access key (use IAM roles in production) | Yes* | - |
| `Aws__SecretKey` | AWS secret key (use IAM roles in production) | Yes* | - |
| `Aws__S3__BucketName` | S3 bucket for file storage | Yes | - |
| `Aws__Kms__SymmetricKeyId` | KMS key ID for encryption | Yes | - |
| `Auth0__Domain` | Auth0 domain | Yes | - |
| `Auth0__Audience` | Auth0 API identifier | Yes | - |

*Use IAM roles in production instead of access keys.

### Sample Configuration

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=vaultnotary;Username=postgres;Password=yourpassword"
  },
  "Aws": {
    "Region": "ap-southeast-1",
    "S3": {
      "BucketName": "your-s3-bucket",
      "PresignedUrlExpirationHours": 24
    },
    "Kms": {
      "SymmetricKeyId": "your-kms-key-id"
    }
  },
  "Auth0": {
    "Domain": "your-domain.auth0.com",
    "Audience": "https://your-api-identifier"
  }
}
```

## 📚 API Documentation

### Core Endpoints

#### Customers
- `GET /api/customers` - List customers with pagination
- `POST /api/customers` - Create new customer
- `GET /api/customers/{id}` - Get customer by ID
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

#### Documents
- `GET /api/documents` - List documents with filtering
- `POST /api/documents` - Create new document
- `GET /api/documents/{id}` - Get document details
- `PUT /api/documents/{id}` - Update document
- `DELETE /api/documents/{id}` - Delete document

#### File Operations
- `POST /api/upload` - Upload files with encryption
- `GET /api/download/{fileId}` - Download encrypted files
- `POST /api/upload/presigned-url` - Get presigned S3 URLs

#### Search
- `POST /api/search/customers` - Advanced customer search
- `POST /api/search/documents` - Document search with filters

### Authentication & Authorization

All endpoints require Auth0 JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

Required scopes:
- `read:documents` - View documents and customers
- `write:documents` - Create and modify documents and customers

## 🔒 Security Features

### File Security
- **Encryption at Rest**: All files encrypted using AWS KMS
- **Secure Storage**: Files stored in private S3 buckets
- **Hash Verification**: SHA-256 hashing for integrity checks
- **Access Control**: Presigned URLs with time-limited access

### Authentication
- **Auth0 Integration**: JWT-based authentication
- **Permission-based Authorization**: Granular access control
- **Rate Limiting**: API rate limiting middleware
- **CORS Protection**: Configured CORS policies

### Data Protection
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Parameterized queries via Entity Framework
- **XSS Protection**: Built-in ASP.NET Core protections

## 🗄️ Database Schema

### Key Entities

#### Customer
```sql
CREATE TABLE Customers (
    Id UUID PRIMARY KEY,
    FullName VARCHAR(255) NOT NULL,
    Gender INTEGER NOT NULL,
    Address TEXT NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(255),
    Type INTEGER NOT NULL, -- 0: Individual, 1: Organization
    DocumentId VARCHAR(50), -- CMND/CCCD
    PassportId VARCHAR(50),
    BusinessRegistrationNumber VARCHAR(50),
    BusinessName VARCHAR(255),
    CreatedAt TIMESTAMP NOT NULL,
    UpdatedAt TIMESTAMP NOT NULL
);
```

#### Document
```sql
CREATE TABLE Documents (
    Id UUID PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Type VARCHAR(100) NOT NULL,
    Status INTEGER NOT NULL,
    CreatedAt TIMESTAMP NOT NULL,
    UpdatedAt TIMESTAMP NOT NULL,
    NotaryDate TIMESTAMP,
    NotaryLocation VARCHAR(255),
    Hash VARCHAR(64),
    S3Key VARCHAR(500),
    OriginalFileName VARCHAR(255),
    ContentType VARCHAR(100),
    FileSizeBytes BIGINT
);
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
dotnet test

# Run unit tests only
dotnet test tests/VaultNotary.UnitTests/

# Run integration tests only
dotnet test tests/VaultNotary.IntegrationTests/

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Test Categories

- **Unit Tests**: Domain logic, services, and utilities
- **Integration Tests**: API endpoints, database operations, AWS services
- **Performance Tests**: Load testing for critical endpoints

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t vaultnotary-backend -f src/VaultNotary.Web/Dockerfile .
```

### Run Container
```bash
docker run -p 5000:80 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection="your-connection-string" \
  vaultnotary-backend
```

### Docker Compose
```yaml
version: '3.8'
services:
  vaultnotary-api:
    build:
      context: .
      dockerfile: src/VaultNotary.Web/Dockerfile
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=${DATABASE_CONNECTION_STRING}
    depends_on:
      - postgres
```

## 🚀 Production Deployment

### AWS ECS Deployment

1. **Build and push image:**
   ```bash
   aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com
   docker build -t vaultnotary .
   docker tag vaultnotary:latest <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary:latest
   docker push <account-id>.dkr.ecr.ap-southeast-1.amazonaws.com/vaultnotary:latest
   ```

2. **Update ECS task definition with environment variables**

3. **Deploy using ECS service**

### Environment-Specific Considerations

#### Development
- Local PostgreSQL database
- AWS credentials via environment variables
- Detailed logging enabled
- Swagger UI enabled

#### Production
- AWS RDS PostgreSQL
- IAM roles for AWS access (no hardcoded keys)
- Structured logging to CloudWatch
- Performance monitoring enabled
- Health checks configured

## 📊 Monitoring & Observability

### Logging
- **Serilog**: Structured logging framework
- **Log Levels**: Information, Warning, Error, Debug
- **Sinks**: Console (dev), File (dev), CloudWatch (prod)

### Health Checks
- Database connectivity
- AWS services availability
- Auth0 configuration validation

### Metrics
- Request/response metrics
- Database query performance
- File operation statistics
- Authentication/authorization events

## 🔧 Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Check connection string format
# Ensure PostgreSQL is running
# Verify network connectivity
```

**AWS Service Errors:**
```bash
# Verify IAM permissions
# Check AWS region configuration
# Validate S3 bucket access
# Test KMS key permissions
```

**Authentication Issues:**
```bash
# Verify Auth0 domain and audience
# Check JWT token format
# Validate required scopes
```

## 📈 Performance Optimization

- **Database**: Indexed queries, connection pooling
- **Caching**: In-memory caching for frequently accessed data
- **API**: Response compression, rate limiting
- **File Operations**: Async file handling, chunked uploads

## 🔄 Backup & Recovery

- **Database**: Automated RDS backups
- **Files**: S3 versioning enabled
- **Configuration**: Infrastructure as Code (CloudFormation)
- **Secrets**: AWS Secrets Manager integration

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Check existing documentation in `/docs`
- Review integration tests for usage examples

---

**Built with ❤️ using .NET 8 and Clean Architecture principles**
