# Identity-Based Document Search Examples

## Overview

The VaultNotary system now includes a comprehensive **Customer Service** that manages parties (Ben A, Ben B, Ben C) and enables efficient search by Vietnamese identity documents. This document provides practical examples of how notarizers can find documents using identity numbers.

## Identity Document Types Supported

### 1. **CMND/CCCD (Can Cuoc Cong Dan)**
- **Format**: 9 digits (old) or 12 digits (new)
- **Example**: `123456789` or `001234567890`
- **Use Case**: Individual Vietnamese citizens

### 2. **Passport**
- **Format**: 8-9 alphanumeric characters
- **Example**: `AB1234567`
- **Use Case**: Vietnamese or foreign nationals

### 3. **Business Registration Number (So Dang Ky Cong Ty)**
- **Format**: 10-13 digits
- **Example**: `0123456789001`
- **Use Case**: Companies and organizations

## Practical Search Scenarios

### Scenario 1: Customer Comes to Check Their Documents

**Customer**: "Toi la Nguyen Van A, CMND 123456789. Toi muon xem lai cac tai lieu da cong chung."

**Notarizer Action**:
```bash
# Search by CMND number
GET /api/search/identity/123456789
```

**System Response**:
```json
{
  "customer": {
    "customerId": "cust_001",
    "fullName": "Nguyen Van A",
    "cmndNumber": "123456789",
    "phoneNumber": "0987654321",
    "address": "123 Nguyen Trai, Ha Noi"
  },
  "documents": [
    {
      "documentId": "doc_001",
      "fileName": "hop-dong-mua-ban-nha.pdf",
      "documentType": "hop-dong-mua-ban",
      "notaryDate": "2024-01-15",
      "partyRole": "A",
      "partyType": "seller",
      "otherParties": [
        {
          "fullName": "Tran Thi B",
          "cmndNumber": "987654321",
          "partyRole": "B",
          "partyType": "buyer"
        }
      ]
    },
    {
      "documentId": "doc_002", 
      "fileName": "giay-uy-quyen.pdf",
      "documentType": "uy-quyen",
      "notaryDate": "2024-02-10",
      "partyRole": "A",
      "partyType": "authorizer"
    }
  ]
}
```

### Scenario 2: Business Document Verification

**Customer**: "Cong ty chung toi co so dang ky 0123456789. Can kiem tra hop dong da ky."

**Notarizer Action**:
```bash
# Search by business registration number
GET /api/search/business/0123456789
```

**System Response**:
```json
{
  "business": {
    "customerId": "cust_002",
    "customerType": "organization",
    "organizationName": "Cong Ty TNHH ABC",
    "businessRegistrationNumber": "0123456789",
    "legalRepresentative": {
      "fullName": "Le Van C",
      "cmndNumber": "555666777",
      "position": "Giam Doc"
    }
  },
  "documents": [
    {
      "documentId": "doc_003",
      "fileName": "hop-dong-cung-cap.pdf",
      "documentType": "hop-dong-cung-cap",
      "notaryDate": "2024-03-01",
      "partyRole": "A",
      "partyType": "supplier",
      "contractValue": 500000000,
      "otherParties": [
        {
          "organizationName": "Cong Ty XYZ",
          "businessRegistrationNumber": "9876543210",
          "partyRole": "B",
          "partyType": "buyer"
        }
      ]
    }
  ]
}
```

### Scenario 3: Cross-Reference Investigation

**Authority Request**: "Can tim tat ca tai lieu lien quan den cac so CMND: 123456789, 987654321, 555666777"

**Notarizer Action**:
```bash
# Cross-reference search multiple identities
GET /api/search/cross-reference?ids=123456789,987654321,555666777
```

**System Response**:
```json
{
  "searchQuery": ["123456789", "987654321", "555666777"],
  "customers": [
    {
      "customerId": "cust_001",
      "fullName": "Nguyen Van A", 
      "cmndNumber": "123456789"
    },
    {
      "customerId": "cust_003",
      "fullName": "Tran Thi B",
      "cmndNumber": "987654321"
    },
    {
      "customerId": "cust_004", 
      "fullName": "Le Van C",
      "cmndNumber": "555666777"
    }
  ],
  "documents": [
    {
      "documentId": "doc_001",
      "fileName": "hop-dong-mua-ban-nha.pdf",
      "parties": [
        {"customerId": "cust_001", "partyRole": "A", "partyType": "seller"},
        {"customerId": "cust_003", "partyRole": "B", "partyType": "buyer"}
      ],
      "relationshipType": "transaction"
    },
    {
      "documentId": "doc_004",
      "fileName": "hop-dong-bao-lanh.pdf", 
      "parties": [
        {"customerId": "cust_001", "partyRole": "A", "partyType": "borrower"},
        {"customerId": "cust_004", "partyRole": "C", "partyType": "guarantor"}
      ],
      "relationshipType": "guarantee"
    }
  ],
  "relationships": [
    {
      "type": "business_transaction",
      "parties": ["Nguyen Van A", "Tran Thi B"],
      "documents": ["doc_001"],
      "description": "Mua ban nha dat"
    },
    {
      "type": "guarantee_relationship", 
      "parties": ["Nguyen Van A", "Le Van C"],
      "documents": ["doc_004"],
      "description": "Bao lanh vay von"
    }
  ]
}
```

### Scenario 4: Document Verification by Hash

**Customer**: "Toi can kiem tra tinh xac thuc cua file nay."

**Notarizer Action**:
```bash
# First, compute file hash
sha256sum uploaded-file.pdf
# Result: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3

# Then search by hash
GET /api/search/hash/a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
```

**System Response**:
```json
{
  "fileExists": true,
  "document": {
    "documentId": "doc_001",
    "fileName": "hop-dong-mua-ban-nha.pdf",
    "sha256Hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
    "notaryDate": "2024-01-15",
    "notaryPublic": "Nguyen Van Cong Chung",
    "isVerified": true,
    "signature": "valid",
    "parties": [
      {
        "fullName": "Nguyen Van A",
        "cmndNumber": "123456789",
        "partyRole": "A",
        "signatureStatus": "signed"
      },
      {
        "fullName": "Tran Thi B", 
        "cmndNumber": "987654321",
        "partyRole": "B",
        "signatureStatus": "signed"
      }
    ]
  }
}
```

## Advanced Search Features

### Time-Based Search

```bash
# Find all documents notarized in a date range
GET /api/search/documents?
  startDate=2024-01-01&
  endDate=2024-03-31&
  notaryPublic=notary_001

# Find documents by specific notary public
GET /api/search/documents?notaryPublic=Nguyen Van Cong Chung
```

### Document Type Search

```bash
# Find all real estate contracts
GET /api/search/documents?documentType=hop-dong-mua-ban

# Find all power of attorney documents
GET /api/search/documents?documentType=uy-quyen

# Find all inheritance documents  
GET /api/search/documents?documentType=thua-ke
```

### Party Role Search

```bash
# Find all documents where someone was Party A (seller/authorizer)
GET /api/search/documents?
  identity=123456789&
  partyRole=A

# Find all documents where someone was witness (Party C)
GET /api/search/documents?
  identity=123456789&
  partyRole=C
```

## Frontend Integration Examples

### React Component for Identity Search

```typescript
// IdentitySearchComponent.tsx
import { useState } from 'react';
import { searchByIdentity } from '@/services/searchService';

export function IdentitySearchComponent() {
  const [identity, setIdentity] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchResults = await searchByIdentity(identity);
      setResults(searchResults);
    } catch (error) {
      // Handle search error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="identity-search">
      <div className="search-input">
        <input
          type="text"
          placeholder="Nhap so CMND/CCCD, Passport, hoac So DKCT"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Dang tim...' : 'Tim kiem'}
        </button>
      </div>

      {results && (
        <div className="search-results">
          <h3>Thong tin khach hang</h3>
          <div className="customer-info">
            <p><strong>Ho ten:</strong> {results.customer.fullName}</p>
            <p><strong>CMND/CCCD:</strong> {results.customer.cmndNumber}</p>
            <p><strong>Dia chi:</strong> {results.customer.address}</p>
          </div>

          <h3>Tai lieu da cong chung ({results.documents.length})</h3>
          <div className="document-list">
            {results.documents.map(doc => (
              <div key={doc.documentId} className="document-item">
                <h4>{doc.fileName}</h4>
                <p>Loai: {doc.documentType}</p>
                <p>Ngay cong chung: {doc.notaryDate}</p>
                <p>Vai tro: Ben {doc.partyRole} ({doc.partyType})</p>
                
                {doc.otherParties && (
                  <div className="other-parties">
                    <strong>Cac ben lien quan:</strong>
                    {doc.otherParties.map(party => (
                      <span key={party.cmndNumber}>
                        {party.fullName} (Ben {party.partyRole})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Search Service Implementation

```typescript
// services/searchService.ts
class SearchService {
  async searchByIdentity(identity: string) {
    const response = await fetch(`/api/search/identity/${identity}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    return response.json();
  }

  async searchByBusiness(businessNumber: string) {
    const response = await fetch(`/api/search/business/${businessNumber}`);
    if (!response.ok) {
      throw new Error('Business search failed');
    }
    return response.json();
  }

  async crossReferenceSearch(identities: string[]) {
    const ids = identities.join(',');
    const response = await fetch(`/api/search/cross-reference?ids=${ids}`);
    if (!response.ok) {
      throw new Error('Cross-reference search failed');
    }
    return response.json();
  }

  async searchByHash(hash: string) {
    const response = await fetch(`/api/search/hash/${hash}`);
    if (!response.ok) {
      throw new Error('Hash search failed');
    }
    return response.json();
  }
}

export const searchService = new SearchService();
```

## Database Query Performance

### Optimized Queries with GSI

```typescript
// Fast identity lookup using GSI
const customerByCMND = await dynamodb.query({
  TableName: 'Customers',
  IndexName: 'cmnd-index',
  KeyConditionExpression: 'cmndNumber = :cmnd',
  ExpressionAttributeValues: { ':cmnd': '123456789' }
});

// Fast document lookup by party
const documentsByCustomer = await dynamodb.query({
  TableName: 'PartyDocumentLinks',
  IndexName: 'customer-documents-index',
  KeyConditionExpression: 'customerId = :customerId',
  ExpressionAttributeValues: { ':customerId': 'cust_001' }
});
```

### Cache Strategy

```typescript
// Redis cache for frequent searches
const cacheKey = `identity:${identityNumber}`;
let results = await redis.get(cacheKey);

if (!results) {
  results = await performDatabaseSearch(identityNumber);
  await redis.setex(cacheKey, 300, JSON.stringify(results)); // 5 min cache
}

return JSON.parse(results);
```

## Benefits of This Architecture

1. **Fast Identity Search**: Sub-second response times using DynamoDB GSI
2. **Comprehensive Coverage**: Supports all Vietnamese identity document types
3. **Cross-Reference Capability**: Find connections between parties
4. **Content Verification**: Hash-based document authenticity
5. **Audit Trail**: Complete history of all document interactions
6. **Scalable**: Handles millions of customers and documents
7. **User-Friendly**: Simple search interface for notarizers

This customer service integration makes the VaultNotary system fully capable of handling Vietnamese notary workflows with efficient identity-based document retrieval.