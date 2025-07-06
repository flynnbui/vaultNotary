# VaultNotary Mock Backend

A simple Express.js mock backend for VaultNotary frontend development and testing.

## Features

- **Customer Management**: CRUD operations for customers (individuals and organizations)
- **File Management**: Create, read, update, delete notary files
- **Search Functionality**: Search customers and files by various criteria
- **Document Upload**: Mock file upload with metadata storage
- **Statistics**: Basic analytics endpoints
- **CORS Enabled**: Ready for frontend integration

## Installation

```bash
npm install
```

## Usage

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3001 by default (configurable via PORT environment variable).

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Customers
- `GET /api/customers` - List all customers (with pagination and search)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/lookup/identity/:identity` - Find customer by ID number/phone/name
- `GET /api/customers/lookup/phone/:phone` - Find customer by phone number

### Files
- `GET /api/files` - List all files (with pagination and search)
- `GET /api/files/:id` - Get file by ID
- `POST /api/files` - Create new file
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file

### Search
- `POST /api/search` - Search customers and files
  ```json
  {
    "identity": "123456789",
    "fileNo": "GD001"
  }
  ```

### Documents
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/:id/download` - Download document

### Statistics
- `GET /api/statistics` - Get system statistics

## Data Models

### Customer
```json
{
  "id": "uuid",
  "fullName": "string",
  "customerType": "individual|organization",
  "idType": "CMND|CCCD|Passport",
  "idNumber": "string",
  "phone": "string",
  "email": "string",
  "dateOfBirth": "ISO date",
  "gender": "male|female|other",
  "permanentAddress": "string",
  "currentAddress": "string",
  "businessName": "string", // for organizations
  "businessRegistrationNumber": "string", // for organizations
  "isVip": "boolean",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### File
```json
{
  "id": "uuid",
  "maGiaoDich": "string",
  "tenGiaoDich": "string",
  "moTa": "string",
  "ngayTao": "ISO date",
  "thuKy": "string",
  "congChungVien": "string",
  "gioiThieu": "string",
  "loaiHoSo": "string",
  "phiHoSo": "number",
  "status": "draft|pending|completed|cancelled",
  "parties": {
    "A": ["customer_id"],
    "B": ["customer_id"],
    "C": ["customer_id"]
  },
  "attachments": [],
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## Sample Data

The server initializes with sample data including:
- 3 customers (2 individuals, 1 organization)
- 1 sample file with parties
- Mock attachments and documents

## Configuration

Environment variables:
- `PORT` - Server port (default: 3001)

## CORS

CORS is enabled for all origins to support frontend development. In production, you should configure specific allowed origins.

## File Uploads

File uploads are handled using multer with memory storage. In a real implementation, you would store files to disk or cloud storage.

## Frontend Integration

To connect your frontend to this mock backend:

1. Update your frontend API base URL to `http://localhost:3001/api`
2. Ensure the mock backend is running before starting your frontend
3. Use the provided endpoints for all CRUD operations

## Development Notes

- Data is stored in memory and will reset when the server restarts
- For persistent storage, consider adding a database or file-based storage
- Error handling includes basic validation and 404/500 responses
- All responses include appropriate HTTP status codes
- Pagination is implemented with `page` and `limit` query parameters