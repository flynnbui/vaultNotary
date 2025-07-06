# VaultNotary Backend

A .NET backend implementation following Clean Architecture principles for a document notarization and verification system.

## Architecture

This project implements Clean Architecture with the following layers:

### Domain Layer (`VaultNotary.Domain`)
- **Entities**: Core business entities (Customer, Document, PartyDocumentLink)
- **Repositories**: Repository interfaces for data access
- **Services**: Domain service interfaces (IHashService, ISignatureService)

### Application Layer (`VaultNotary.Application`)
- **DTOs**: Data Transfer Objects for API communication
- **Services**: Business logic services and their implementations
- **Use Cases**: Application-specific business logic

### Infrastructure Layer (`VaultNotary.Infrastructure`)
- **Repositories**: AWS DynamoDB and S3 implementations
- **Services**: AWS KMS signature service and hash service implementations
- **Configuration**: AWS service configurations

### Web API Layer (`VaultNotary.Web`)
- **Controllers**: REST API endpoints
- **Dependency Injection**: Service configuration and registration

## Features

### Customer Management
- Create, read, update, delete customers
- Support for individual and business customers
- Identity validation (Document ID, Passport, Business Registration)
- Duplicate detection

### Document Management
- Document metadata storage in DynamoDB
- File storage in AWS S3 with encryption
- Party-document linking and relationships
- Document categorization and type management

### File Operations
- Single file upload to S3
- Multipart upload for large files
- Presigned URL generation for downloads
- File integrity verification with SHA-256 hashing

### Search Capabilities
- Search customers by identity information
- Search documents by various criteria
- Cross-reference search across multiple parties
- Party-document relationship queries

### Digital Signatures & Verification
- Document hash computation (SHA-256)
- Digital signature creation using AWS KMS
- Signature verification
- Document integrity verification
- Public key retrieval

## AWS Services Used

- **DynamoDB**: NoSQL database for storing customer and document metadata
- **S3**: Object storage for document files with server-side encryption
- **KMS**: Key Management Service for digital signatures and encryption

## API Endpoints

### Customer Endpoints
- `GET /api/customers` - Get all customers
- `GET /api/customers/{id}` - Get customer by ID
- `GET /api/customers/search?identity={id}` - Search by identity
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer
- `POST /api/customers/validate` - Validate identity

### Document Endpoints
- `GET /api/documents` - Get all documents
- `GET /api/documents/{id}` - Get document by ID
- `POST /api/documents` - Create document
- `PUT /api/documents/{id}/parties` - Link party to document
- `DELETE /api/documents/{id}/parties/{customerId}` - Unlink party

### Upload Endpoints
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/initiate` - Initiate multipart upload
- `PUT /api/upload/{key}/part/{partNumber}` - Upload file part
- `POST /api/upload/{key}/complete` - Complete multipart upload

### Download Endpoints
- `GET /api/download/{fileId}` - Download file directly
- `GET /api/download/{fileId}/presigned` - Get presigned download URL

### Search Endpoints
- `GET /api/search/identity/{documentId}` - Search by document ID
- `GET /api/search/business/{registrationNumber}` - Search by business registration
- `GET /api/search/passport/{passportId}` - Search by passport
- `POST /api/search/cross-reference` - Cross-reference search

### Verification Endpoints
- `GET /api/verification/{fileId}` - Get verification info
- `POST /api/verification/{documentId}/sign` - Sign document hash
- `POST /api/verification/{documentId}/verify` - Verify signature
- `POST /api/verification/{documentId}/integrity` - Verify file integrity

## Configuration

Update `appsettings.json` with your AWS configuration:

```json
{
  "Aws": {
    "Region": "us-east-1",
    "AccessKey": "your-access-key",
    "SecretKey": "your-secret-key",
    "DynamoDb": {
      "CustomersTableName": "VaultNotary-Customers",
      "DocumentsTableName": "VaultNotary-Documents",
      "PartyDocumentsTableName": "VaultNotary-PartyDocuments"
    },
    "S3": {
      "BucketName": "your-bucket-name",
      "FileKeyPrefix": "files/",
      "PresignedUrlExpirationHours": 24
    },
    "Kms": {
      "AsymmetricKeyId": "your-asymmetric-key-id",
      "SymmetricKeyId": "your-symmetric-key-id"
    }
  }
}
```

## Running the Application

1. Install .NET 9.0 SDK
2. Configure AWS credentials and services
3. Update `appsettings.json` with your AWS configuration
4. Run the application:
   ```bash
   dotnet run --project src/VaultNotary.Web
   ```

## Security Features

- AWS KMS for encryption and digital signatures
- S3 server-side encryption for file storage
- JWT authentication support (ready for implementation)
- CORS configuration
- Input validation and error handling

## Database Schema

### Customers Table (DynamoDB)
- **PK**: customerId
- **SK**: customerId
- **GSI1**: documentId (CMND/CCCD)
- **GSI2**: passportId
- **GSI3**: businessRegistrationNumber

### Documents Table (DynamoDB)
- **PK**: documentId
- **SK**: documentId
- **GSI1**: sha256Hash
- **GSI2**: notaryDate

### Party-Document Links Table (DynamoDB)
- **PK**: documentId
- **SK**: partyRole#customerId
- **GSI1**: customerId#documentId
- **GSI2**: documentId#partyRole

## Technology Stack

- .NET 9.0
- ASP.NET Core Web API
- AWS SDK for .NET
- Clean Architecture
- Dependency Injection
- Repository Pattern