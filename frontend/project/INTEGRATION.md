# Frontend-Backend Integration Guide

## Overview

The VaultNotary frontend is now integrated with a mock backend API for development and testing purposes.

## Backend Status

✅ **Mock backend is running on port 3001**

- Health check: http://localhost:3001/api/health
- API base URL: http://localhost:3001/api

## Changes Made

### 1. ✅ DatePicker Component Updated
- Replaced with new implementation using ChevronDownIcon
- Added label support and improved styling
- Updated all usage across CustomerDialog and CustomerSubForm

### 2. ✅ Modal and UI Improvements
- Increased modal size from `max-w-4xl` to `max-w-6xl` 
- Made "Thông tin các bên" (parties section) collapsible
- Removed "Tài liệu đính kèm" (attachments) section
- Removed "Soạn thảo hồ sơ" (draft) section

### 3. ✅ Form Field Updates
- Moved "Loại hồ sơ" to "Thông tin hồ sơ" section
- Removed unnecessary fields:
  - "Tên giao dịch" (transaction name)
  - "Phí hồ sơ" (file fee)
  - "Người giới thiệu" (referrer)
- Added transaction code ("Mã giao dịch") as required field
- Added description ("Mô tả") as optional field

### 4. ✅ API Integration
- Created `apiService` for backend communication
- Integrated customer lookup functionality
- Updated file creation to use API
- Updated customer management to use API
- Removed mock data from frontend components

### 5. ✅ Environment Configuration
- Added `.env.example` and `.env.local` files
- Configured API base URL: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

## Available API Endpoints

### Customers
- `GET /api/customers` - List customers with search and pagination
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/lookup/identity/:identity` - Lookup by ID/phone/name
- `GET /api/customers/lookup/phone/:phone` - Lookup by phone

### Files
- `GET /api/files` - List files with search and pagination
- `GET /api/files/:id` - Get file by ID  
- `POST /api/files` - Create new file
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file

### Search
- `POST /api/search` - Search customers and files

### Other
- `GET /api/statistics` - System statistics
- `GET /api/health` - Health check

## Running the Application

### Prerequisites
1. Mock backend is running on port 3001
2. Frontend environment variables are configured

### Development
```bash
# Frontend (port 3000)
npm run dev

# Backend is already running on port 3001
```

### Testing the Integration
1. Visit http://localhost:3000
2. Try creating a new file with customer information
3. Test customer lookup functionality
4. Verify data persistence through API calls

## Sample Data

The mock backend includes sample customers and files for testing:
- 3 customers (2 individuals, 1 organization)
- 1 sample notary file
- Various file types and statuses

## Next Steps

1. **Error Handling**: Add comprehensive error handling for API calls
2. **Loading States**: Implement loading indicators for better UX
3. **Validation**: Add client-side validation before API calls
4. **Caching**: Implement data caching for better performance
5. **Authentication**: Add user authentication and authorization
6. **Real Backend**: Replace mock backend with production API

## Troubleshooting

### Backend Not Accessible
```bash
# Check if backend is running
curl http://localhost:3001/api/health

# If not running, start it:
cd ../mock-backend
npm start
```

### CORS Issues
The mock backend has CORS enabled for all origins. In production, configure specific allowed origins.

### API Connection Issues
Check the `NEXT_PUBLIC_API_URL` environment variable in `.env.local`.