# Customer and Party Management Schema

## Overview

The notary system involves multiple parties (Ben A, Ben B, Ben C) with different types of identification documents. The system must efficiently link customers to notarized documents and enable search by identity numbers.

## Data Model Architecture

### 1. Customer Table (DynamoDB)

```json
{
  "tableName": "Customers",
  "primaryKey": {
    "PK": "customerId",
    "SK": "customerId"
  },
  "globalSecondaryIndexes": [
    {
      "name": "cmnd-index",
      "PK": "cmndNumber",
      "SK": "customerId"
    },
    {
      "name": "passport-index", 
      "PK": "passportNumber",
      "SK": "customerId"
    },
    {
      "name": "business-index",
      "PK": "businessRegistrationNumber",
      "SK": "customerId"
    },
    {
      "name": "phone-index",
      "PK": "phoneNumber",
      "SK": "customerId"
    }
  ]
}
```

**Sample Customer Record:**
```json
{
  "PK": "cust_123e4567-e89b-12d3-a456-426614174000",
  "SK": "cust_123e4567-e89b-12d3-a456-426614174000",
  "customerId": "cust_123e4567-e89b-12d3-a456-426614174000",
  "customerType": "individual",
  "fullName": "Nguyen Van A",
  "dateOfBirth": "1985-05-15",
  "gender": "male",
  "cmndNumber": "123456789",
  "cmndIssueDate": "2020-01-15",
  "cmndIssuePlace": "Ha Noi",
  "passportNumber": null,
  "businessRegistrationNumber": null,
  "phoneNumber": "0987654321",
  "email": "nguyenvana@example.com",
  "permanentAddress": "123 Nguyen Trai, Ha Noi",
  "currentAddress": "123 Nguyen Trai, Ha Noi",
  "isVip": false,
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Business Customer Record:**
```json
{
  "PK": "cust_456e7890-e89b-12d3-a456-426614174000",
  "SK": "cust_456e7890-e89b-12d3-a456-426614174000",
  "customerId": "cust_456e7890-e89b-12d3-a456-426614174000",
  "customerType": "organization",
  "fullName": "Le Thi B",
  "organizationName": "Cong Ty ABC",
  "businessRegistrationNumber": "0123456789",
  "businessIssueDate": "2020-03-20",
  "businessIssuePlace": "So Ke Hoach Dau Tu Ha Noi",
  "cmndNumber": "987654321",
  "phoneNumber": "0123456789",
  "email": "contact@abc.com",
  "permanentAddress": "456 Le Loi, Ha Noi",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 2. Documents Table (DynamoDB)

```json
{
  "tableName": "Documents",
  "primaryKey": {
    "PK": "documentId",
    "SK": "documentId"
  },
  "globalSecondaryIndexes": [
    {
      "name": "sha256-index",
      "PK": "sha256Hash",
      "SK": "documentId"
    },
    {
      "name": "notary-date-index",
      "PK": "notaryDate",
      "SK": "documentId"
    },
    {
      "name": "notary-public-index",
      "PK": "notaryPublicId",
      "SK": "notaryDate"
    }
  ]
}
```

**Sample Document Record:**
```json
{
  "PK": "doc_789a0123-e89b-12d3-a456-426614174000",
  "SK": "doc_789a0123-e89b-12d3-a456-426614174000",
  "documentId": "doc_789a0123-e89b-12d3-a456-426614174000",
  "fileName": "hop-dong-mua-ban-nha.pdf",
  "fileSize": 2048576,
  "contentType": "application/pdf",
  "sha256Hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "s3Key": "files/a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
  "documentType": "hop-dong-mua-ban",
  "documentCategory": "real-estate",
  "notaryDate": "2024-01-15",
  "notaryPublicId": "notary_001",
  "notaryPublicName": "Nguyen Van Cong Chung",
  "secretaryId": "secretary_001",
  "secretaryName": "Tran Thi Thu Ky",
  "fee": 500000,
  "status": "completed",
  "signature": "base64-encoded-signature-here",
  "signatureAlgorithm": "RSA-SHA256",
  "timestampToken": "base64-encoded-timestamp-token",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "metadata": {
    "propertyAddress": "789 Tran Hung Dao, Ha Noi",
    "propertyValue": 2000000000,
    "contractDate": "2024-01-15"
  }
}
```

### 3. Party-Document Links Table (DynamoDB)

```json
{
  "tableName": "PartyDocumentLinks",
  "primaryKey": {
    "PK": "documentId",
    "SK": "partyRole#customerId"
  },
  "globalSecondaryIndexes": [
    {
      "name": "customer-documents-index",
      "PK": "customerId",
      "SK": "documentId"
    },
    {
      "name": "party-role-index",
      "PK": "partyRole",
      "SK": "documentId"
    }
  ]
}
```

**Sample Party-Document Link Records:**
```json
[
  {
    "PK": "doc_789a0123-e89b-12d3-a456-426614174000",
    "SK": "A#cust_123e4567-e89b-12d3-a456-426614174000",
    "documentId": "doc_789a0123-e89b-12d3-a456-426614174000",
    "customerId": "cust_123e4567-e89b-12d3-a456-426614174000",
    "partyRole": "A",
    "partyType": "seller",
    "signatureStatus": "signed",
    "signatureDate": "2024-01-15T10:30:00Z",
    "notes": "Nguoi ban nha"
  },
  {
    "PK": "doc_789a0123-e89b-12d3-a456-426614174000",
    "SK": "B#cust_456e7890-e89b-12d3-a456-426614174000",
    "documentId": "doc_789a0123-e89b-12d3-a456-426614174000",
    "customerId": "cust_456e7890-e89b-12d3-a456-426614174000",
    "partyRole": "B",
    "partyType": "buyer",
    "signatureStatus": "signed",
    "signatureDate": "2024-01-15T10:35:00Z",
    "notes": "Nguoi mua nha"
  }
]
```

## API Endpoints

### Customer Service Endpoints

```typescript
// Create or update customer
POST /api/customers
{
  "customerType": "individual",
  "fullName": "Nguyen Van A",
  "cmndNumber": "123456789",
  "phoneNumber": "0987654321",
  "email": "nguyenvana@example.com",
  "permanentAddress": "123 Nguyen Trai, Ha Noi"
}

// Get customer by ID
GET /api/customers/{customerId}

// Search customer by identity document
GET /api/customers/search?cmnd=123456789
GET /api/customers/search?passport=AB1234567
GET /api/customers/search?business=0123456789
GET /api/customers/search?phone=0987654321

// Get all documents for a customer
GET /api/customers/{customerId}/documents

// Validate customer identity
POST /api/customers/validate
{
  "cmndNumber": "123456789",
  "fullName": "Nguyen Van A",
  "dateOfBirth": "1985-05-15"
}
```

### Document Service Endpoints

```typescript
// Create document with parties
POST /api/documents
{
  "fileName": "hop-dong-mua-ban.pdf",
  "documentType": "hop-dong-mua-ban",
  "parties": {
    "A": [
      {
        "customerId": "cust_123...",
        "partyType": "seller",
        "notes": "Nguoi ban"
      }
    ],
    "B": [
      {
        "customerId": "cust_456...",
        "partyType": "buyer",
        "notes": "Nguoi mua"
      }
    ]
  },
  "metadata": {
    "propertyAddress": "789 Tran Hung Dao",
    "propertyValue": 2000000000
  }
}

// Get document with parties
GET /api/documents/{documentId}?include=parties

// Update document parties
PUT /api/documents/{documentId}/parties
{
  "partyRole": "C",
  "customerId": "cust_789...",
  "partyType": "witness"
}

// Get documents by party
GET /api/documents/by-party/{customerId}
```

### Search Service Endpoints

```typescript
// Search by identity document number
GET /api/search/identity/{documentNumber}
// Returns: List of documents where this identity appears

// Search by multiple identity numbers
GET /api/search/cross-reference?ids=123456789,987654321
// Returns: Documents involving any of these identities

// Advanced search
GET /api/search/documents?
  partyName=Nguyen Van A&
  documentType=hop-dong-mua-ban&
  dateFrom=2024-01-01&
  dateTo=2024-12-31&
  notaryPublic=notary_001

// Search documents by business registration
GET /api/search/business/{businessRegistrationNumber}
```

## Search Implementation Examples

### 1. Search by CMND/CCCD Number

```typescript
async function searchByIdentityNumber(identityNumber: string) {
  // Step 1: Find customer by identity number
  const customer = await dynamodb.query({
    TableName: 'Customers',
    IndexName: 'cmnd-index',
    KeyConditionExpression: 'cmndNumber = :cmnd',
    ExpressionAttributeValues: {
      ':cmnd': identityNumber
    }
  });

  if (customer.Items.length === 0) {
    return { customer: null, documents: [] };
  }

  // Step 2: Find all documents for this customer
  const documents = await dynamodb.query({
    TableName: 'PartyDocumentLinks',
    IndexName: 'customer-documents-index',
    KeyConditionExpression: 'customerId = :customerId',
    ExpressionAttributeValues: {
      ':customerId': customer.Items[0].customerId
    }
  });

  // Step 3: Get full document details
  const documentDetails = await Promise.all(
    documents.Items.map(link => 
      dynamodb.get({
        TableName: 'Documents',
        Key: { PK: link.documentId, SK: link.documentId }
      })
    )
  );

  return {
    customer: customer.Items[0],
    documents: documentDetails.map(doc => doc.Item)
  };
}
```

### 2. Cross-Reference Search

```typescript
async function crossReferenceSearch(identityNumbers: string[]) {
  // Find all customers with these identity numbers
  const customerQueries = identityNumbers.map(id => ({
    TableName: 'Customers',
    IndexName: 'cmnd-index',
    KeyConditionExpression: 'cmndNumber = :cmnd',
    ExpressionAttributeValues: { ':cmnd': id }
  }));

  const customers = await Promise.all(
    customerQueries.map(query => dynamodb.query(query))
  );

  const customerIds = customers
    .flatMap(result => result.Items)
    .map(customer => customer.customerId);

  // Find documents involving any of these customers
  const documentQueries = customerIds.map(customerId => ({
    TableName: 'PartyDocumentLinks',
    IndexName: 'customer-documents-index',
    KeyConditionExpression: 'customerId = :customerId',
    ExpressionAttributeValues: { ':customerId': customerId }
  }));

  const documentLinks = await Promise.all(
    documentQueries.map(query => dynamodb.query(query))
  );

  // Get unique document IDs
  const documentIds = [...new Set(
    documentLinks.flatMap(result => 
      result.Items.map(link => link.documentId)
    )
  )];

  // Get full document details
  const documents = await Promise.all(
    documentIds.map(documentId =>
      dynamodb.get({
        TableName: 'Documents',
        Key: { PK: documentId, SK: documentId }
      })
    )
  );

  return {
    customers: customers.flatMap(result => result.Items),
    documents: documents.map(doc => doc.Item),
    relationships: documentLinks.flatMap(result => result.Items)
  };
}
```

### 3. Business Registration Search

```typescript
async function searchByBusinessRegistration(businessRegNumber: string) {
  // Find business customer
  const business = await dynamodb.query({
    TableName: 'Customers',
    IndexName: 'business-index',
    KeyConditionExpression: 'businessRegistrationNumber = :businessReg',
    ExpressionAttributeValues: {
      ':businessReg': businessRegNumber
    }
  });

  if (business.Items.length === 0) {
    return { business: null, documents: [] };
  }

  // Find all documents for this business
  const documents = await dynamodb.query({
    TableName: 'PartyDocumentLinks',
    IndexName: 'customer-documents-index',
    KeyConditionExpression: 'customerId = :customerId',
    ExpressionAttributeValues: {
      ':customerId': business.Items[0].customerId
    }
  });

  // Get document details with other parties
  const documentDetails = await Promise.all(
    documents.Items.map(async (link) => {
      const doc = await dynamodb.get({
        TableName: 'Documents',
        Key: { PK: link.documentId, SK: link.documentId }
      });

      // Get all parties for this document
      const allParties = await dynamodb.query({
        TableName: 'PartyDocumentLinks',
        KeyConditionExpression: 'documentId = :documentId',
        ExpressionAttributeValues: {
          ':documentId': link.documentId
        }
      });

      return {
        document: doc.Item,
        parties: allParties.Items
      };
    })
  );

  return {
    business: business.Items[0],
    documents: documentDetails
  };
}
```

## Benefits of This Schema

1. **Efficient Identity Search**: Direct queries by any identity type (CMND, passport, business registration)
2. **Party Relationship Tracking**: Clear links between customers and documents with roles
3. **Cross-Reference Capability**: Find all documents involving multiple parties
4. **Flexible Party Roles**: Support for A, B, C parties with custom types
5. **Audit Trail**: Track signature status and dates for each party
6. **Business Support**: Handle both individual and business customers
7. **Scalable**: DynamoDB GSIs provide fast queries at scale

This schema enables the notary system to efficiently manage the complex relationships between customers, parties, and documents while supporting all the search patterns needed for Vietnamese notary operations.