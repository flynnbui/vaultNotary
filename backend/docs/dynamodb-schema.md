# DynamoDB Schema Documentation

## Customers Table (`VaultNotary-Customers-prod`)

### Primary Key Structure
- Partition Key (PK): `string` - Customer ID
- Sort Key (SK): `string` - Customer ID (same as PK)

### Global Secondary Indexes (GSIs)

1. **GSI1 - Document ID Index**
   - Purpose: Look up customers by document ID
   - Partition Key (GSI1PK): `string` - Document ID
   - Projection Type: ALL

2. **GSI2 - Passport ID Index**
   - Purpose: Look up customers by passport ID
   - Partition Key (GSI2PK): `string` - Passport ID
   - Projection Type: ALL

3. **GSI3 - Business Registration Index**
   - Purpose: Look up customers by business registration number
   - Partition Key (GSI3PK): `string` - Business Registration Number
   - Projection Type: ALL

### Attributes

#### Required Attributes
- `PK`: string (Customer ID)
- `SK`: string (Customer ID)
- `FullName`: string
- `Address`: string
- `Type`: string (enum: "Individual" or "Business")
- `CreatedAt`: string (ISO 8601 datetime)
- `UpdatedAt`: string (ISO 8601 datetime)

#### Optional Attributes
- `Phone`: string
- `Email`: string
- `DocumentId`: string
- `GSI1PK`: string (same as DocumentId)
- `PassportId`: string
- `GSI2PK`: string (same as PassportId)
- `BusinessRegistrationNumber`: string
- `GSI3PK`: string (same as BusinessRegistrationNumber)
- `BusinessName`: string

### Example Items

#### Individual Customer
```json
{
  "PK": "123e4567-e89b-12d3-a456-426614174000",
  "SK": "123e4567-e89b-12d3-a456-426614174000",
  "FullName": "John Doe",
  "Address": "123 Main St",
  "Phone": "+1234567890",
  "Email": "john@example.com",
  "Type": "Individual",
  "DocumentId": "DOC123",
  "GSI1PK": "DOC123",
  "PassportId": "PASS123",
  "GSI2PK": "PASS123",
  "CreatedAt": "2025-07-07T16:12:58.5471176+00:00",
  "UpdatedAt": "2025-07-07T16:12:58.5471247+00:00"
}
```

#### Business Customer
```json
{
  "PK": "789e0123-e45b-67d8-a901-234567890000",
  "SK": "789e0123-e45b-67d8-a901-234567890000",
  "FullName": "Acme Corporation",
  "Address": "456 Business Ave",
  "Phone": "+9876543210",
  "Email": "contact@acme.com",
  "Type": "Business",
  "BusinessRegistrationNumber": "BRN789",
  "GSI3PK": "BRN789",
  "BusinessName": "Acme Corp",
  "CreatedAt": "2025-07-07T16:15:00.0000000+00:00",
  "UpdatedAt": "2025-07-07T16:15:00.0000000+00:00"
}
```

### Access Patterns

1. Get customer by ID:
   ```javascript
   Key = {
     PK: customerId,
     SK: customerId
   }
   ```

2. Get customer by document ID:
   ```javascript
   IndexName = "GSI1"
   KeyConditionExpression = "GSI1PK = :documentId"
   ```

3. Get customer by passport ID:
   ```javascript
   IndexName = "GSI2"
   KeyConditionExpression = "GSI2PK = :passportId"
   ```

4. Get customer by business registration number:
   ```javascript
   IndexName = "GSI3"
   KeyConditionExpression = "GSI3PK = :businessRegNumber"
   ```

5. Get all customers:
   ```javascript
   // Use Scan operation (note: should be used sparingly on large tables)
   ```

### Notes

1. All GSIs use `ProjectionType: ALL` to include all attributes in the index
2. The table uses on-demand (pay per request) billing mode
3. GSI keys are only present when their corresponding ID fields are set
4. Both PK and SK use the same value to enable simple key-value lookups
5. DateTime fields are stored in ISO 8601 format with timezone information 