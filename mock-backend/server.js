const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mock data storage
let customers = [];
let files = [];
let documents = [];

// Mock data initialization
const initializeMockData = () => {
  // Sample customers
  customers = [
    {
      id: uuidv4(),
      fullName: 'Nguyễn Văn An',
      customerType: 'individual',
      idType: 'CMND',
      idNumber: '123456789',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      permanentAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      currentAddress: '456 Lê Lợi, Quận 3, TP.HCM',
      isVip: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      fullName: 'Trần Thị Bình',
      customerType: 'individual',
      idType: 'CCCD',
      idNumber: '987654321012',
      phone: '0907654321',
      email: 'tranthib@email.com',
      dateOfBirth: '1985-08-22',
      gender: 'female',
      permanentAddress: '789 Đồng Khởi, Quận 1, TP.HCM',
      currentAddress: '789 Đồng Khởi, Quận 1, TP.HCM',
      isVip: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      fullName: 'Công ty TNHH ABC',
      customerType: 'organization',
      businessName: 'Công ty TNHH ABC',
      businessRegistrationNumber: 'MST001234567',
      phone: '0283456789',
      email: 'info@abc.com',
      permanentAddress: '101 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      isVip: false,
      createdAt: new Date().toISOString()
    }
  ];

  // Sample files
  files = [
    {
      id: uuidv4(),
      maGiaoDich: 'GD001',
      tenGiaoDich: 'Hợp đồng mua bán nhà đất',
      moTa: 'Hợp đồng mua bán căn hộ chung cư tại quận 1',
      ngayTao: new Date().toISOString(),
      thuKy: 'Nguyễn Thị Hoa',
      congChungVien: 'Luật sư Phan Văn Minh',
      gioiThieu: 'Công ty Bất động sản XYZ',
      loaiHoSo: 'hop-dong-mua-ban',
      phiHoSo: 2000000,
      status: 'draft',
      parties: {
        A: [customers[0].id],
        B: [customers[1].id],
        C: []
      },
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
};

// Initialize mock data
initializeMockData();

// Helper functions
const findCustomerById = (id) => customers.find(c => c.id === id);
const findCustomerByIdentity = (identity) => {
  return customers.find(c => 
    c.idNumber === identity || 
    c.phone === identity || 
    c.fullName.toLowerCase().includes(identity.toLowerCase()) ||
    c.businessRegistrationNumber === identity
  );
};

// Customer endpoints
app.get('/api/customers', (req, res) => {
  const { search, type, page = 1, limit = 10 } = req.query;
  
  let filteredCustomers = [...customers];
  
  if (search) {
    filteredCustomers = customers.filter(customer => 
      customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      customer.idNumber.includes(search) ||
      customer.phone.includes(search) ||
      (customer.email && customer.email.toLowerCase().includes(search.toLowerCase())) ||
      (customer.businessName && customer.businessName.toLowerCase().includes(search.toLowerCase())) ||
      (customer.businessRegistrationNumber && customer.businessRegistrationNumber.includes(search))
    );
  }
  
  if (type && type !== 'all') {
    filteredCustomers = filteredCustomers.filter(customer => customer.customerType === type);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
  
  res.json({
    customers: paginatedCustomers,
    total: filteredCustomers.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredCustomers.length / limit)
  });
});

app.get('/api/customers/:id', (req, res) => {
  const customer = findCustomerById(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

app.post('/api/customers', (req, res) => {
  const customerData = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  customers.push(customerData);
  res.status(201).json(customerData);
});

app.put('/api/customers/:id', (req, res) => {
  const customerIndex = customers.findIndex(c => c.id === req.params.id);
  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  customers[customerIndex] = {
    ...customers[customerIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(customers[customerIndex]);
});

app.delete('/api/customers/:id', (req, res) => {
  const customerIndex = customers.findIndex(c => c.id === req.params.id);
  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  
  customers.splice(customerIndex, 1);
  res.status(204).send();
});

// Customer lookup endpoints
app.get('/api/customers/lookup/identity/:identity', (req, res) => {
  const customer = findCustomerByIdentity(req.params.identity);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

app.get('/api/customers/lookup/phone/:phone', (req, res) => {
  const customer = customers.find(c => c.phone === req.params.phone);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// File endpoints
app.get('/api/files', (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  
  let filteredFiles = [...files];
  
  if (search) {
    filteredFiles = files.filter(file => 
      file.maGiaoDich.toLowerCase().includes(search.toLowerCase()) ||
      file.tenGiaoDich.toLowerCase().includes(search.toLowerCase()) ||
      (file.moTa && file.moTa.toLowerCase().includes(search.toLowerCase()))
    );
  }
  
  if (status && status !== 'all') {
    filteredFiles = filteredFiles.filter(file => file.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);
  
  // Enrich files with customer data
  const enrichedFiles = paginatedFiles.map(file => ({
    ...file,
    parties: {
      A: file.parties.A.map(id => findCustomerById(id)).filter(Boolean),
      B: file.parties.B.map(id => findCustomerById(id)).filter(Boolean),
      C: file.parties.C.map(id => findCustomerById(id)).filter(Boolean)
    }
  }));
  
  res.json({
    files: enrichedFiles,
    total: filteredFiles.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredFiles.length / limit)
  });
});

app.get('/api/files/:id', (req, res) => {
  const file = files.find(f => f.id === req.params.id);
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Enrich with customer data
  const enrichedFile = {
    ...file,
    parties: {
      A: file.parties.A.map(id => findCustomerById(id)).filter(Boolean),
      B: file.parties.B.map(id => findCustomerById(id)).filter(Boolean),
      C: file.parties.C.map(id => findCustomerById(id)).filter(Boolean)
    }
  };
  
  res.json(enrichedFile);
});

app.post('/api/files', (req, res) => {
  const fileData = {
    id: uuidv4(),
    ...req.body,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  files.push(fileData);
  res.status(201).json(fileData);
});

app.put('/api/files/:id', (req, res) => {
  const fileIndex = files.findIndex(f => f.id === req.params.id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  files[fileIndex] = {
    ...files[fileIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(files[fileIndex]);
});

app.delete('/api/files/:id', (req, res) => {
  const fileIndex = files.findIndex(f => f.id === req.params.id);
  if (fileIndex === -1) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  files.splice(fileIndex, 1);
  res.status(204).send();
});

// Search endpoint
app.post('/api/search', (req, res) => {
  const { identity, fileNo } = req.body;
  
  const results = {
    customers: [],
    files: []
  };
  
  if (identity) {
    // Search customers by identity
    results.customers = customers.filter(customer => 
      customer.idNumber.includes(identity) ||
      customer.phone.includes(identity) ||
      customer.fullName.toLowerCase().includes(identity.toLowerCase()) ||
      (customer.businessRegistrationNumber && customer.businessRegistrationNumber.includes(identity))
    );
  }
  
  if (fileNo) {
    // Search files by file number/transaction code
    results.files = files.filter(file => 
      file.maGiaoDich.toLowerCase().includes(fileNo.toLowerCase()) ||
      file.tenGiaoDich.toLowerCase().includes(fileNo.toLowerCase())
    ).map(file => ({
      ...file,
      parties: {
        A: file.parties.A.map(id => findCustomerById(id)).filter(Boolean),
        B: file.parties.B.map(id => findCustomerById(id)).filter(Boolean),
        C: file.parties.C.map(id => findCustomerById(id)).filter(Boolean)
      }
    }));
  }
  
  res.json(results);
});

// Document upload endpoint
app.post('/api/documents/upload', upload.array('files'), (req, res) => {
  const { fileId, attachmentName } = req.body;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const uploadedFiles = req.files.map(file => ({
    id: uuidv4(),
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    uploadedAt: new Date().toISOString(),
    fileId: fileId,
    attachmentName: attachmentName
  }));
  
  documents.push(...uploadedFiles);
  
  res.json({
    message: 'Files uploaded successfully',
    files: uploadedFiles
  });
});

// Document download endpoint
app.get('/api/documents/:id/download', (req, res) => {
  const document = documents.find(d => d.id === req.params.id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
  
  // In a real implementation, this would serve the actual file
  res.json({
    message: 'File download would start here',
    document: document
  });
});

// Statistics endpoint
app.get('/api/statistics', (req, res) => {
  const stats = {
    totalCustomers: customers.length,
    totalFiles: files.length,
    totalDocuments: documents.length,
    filesByStatus: {
      draft: files.filter(f => f.status === 'draft').length,
      pending: files.filter(f => f.status === 'pending').length,
      completed: files.filter(f => f.status === 'completed').length,
      cancelled: files.filter(f => f.status === 'cancelled').length
    },
    customersByType: {
      individual: customers.filter(c => c.customerType === 'individual').length,
      organization: customers.filter(c => c.customerType === 'organization').length
    },
    vipCustomers: customers.filter(c => c.isVip).length
  };
  
  res.json(stats);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock VaultNotary Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
  console.log(`📁 Files API: http://localhost:${PORT}/api/files`);
  console.log(`🔍 Search API: http://localhost:${PORT}/api/search`);
  console.log(`📈 Statistics: http://localhost:${PORT}/api/statistics`);
});