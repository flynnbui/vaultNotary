● Document Service API Routes - Frontend Integration Guide

  📋 DocumentsController Routes (/api/documents)

  Core CRUD operations for document management

  1. Get Documents (with safety limit)

  GET /api/documents?limit=50
  Purpose: Get recent documents with safety paginationParameters:
  - limit (optional): Max documents to return (1-100, default: 50)

  Response: PaginatedResult<DocumentListDto>
  {
    "items": [
      {
        "id": "doc-123",
        "transactionCode": "TC001",
        "documentType": "Contract",
        "secretary": "John Doe",
        "notaryPublic": "Jane Smith",
        "createdDate": "2024-01-15T10:30:00Z",
        "description": "Sales contract"
      }
    ],
    "totalCount": 150,
    "pageNumber": 1,
    "pageSize": 50
  }

  Frontend Usage:
  // Get recent documents for dashboard
  const getRecentDocuments = async (limit = 20) => {
    const response = await api.get(`/api/documents?limit=${limit}`);
    return response.data;
  };

  ---
  2. Get Documents with Pagination & Search

  GET /api/documents/paginated?pageNumber=1&pageSize=10&searchTerm=contract
  Purpose: Main listing with search and paginationParameters:
  - pageNumber (optional): Page number (default: 1)
  - pageSize (optional): Items per page (1-100, default: 10)
  - searchTerm (optional): Search across multiple fields

  Frontend Usage:
  // Document listing page with search
  const getDocuments = async (page = 1, size = 10, search = '') => {
    const params = new URLSearchParams({
      pageNumber: page,
      pageSize: size,
      ...(search && { searchTerm: search })
    });

    const response = await api.get(`/api/documents/paginated?${params}`);
    return response.data;
  };

  // Usage in React
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ pageNumber: 1, totalCount: 0 });

  useEffect(() => {
    getDocuments(pagination.pageNumber, 10, searchTerm)
      .then(result => {
        setDocuments(result.items);
        setPagination(result);
      });
  }, [pagination.pageNumber, searchTerm]);

  ---
  3. Get Single Document (Full Details)

  GET /api/documents/{id}
  Purpose: Get complete document with parties and filesResponse: DocumentDto with all related data

  {
    "id": "doc-123",
    "transactionCode": "TC001",
    "documentType": "Contract",
    "secretary": "John Doe",
    "notaryPublic": "Jane Smith",
    "partyDocumentLinks": [
      {
        "customerId": "cust-456",
        "partyRole": "Buyer",
        "signatureStatus": "Signed"
      }
    ],
    "files": [
      {
        "id": "file-789",
        "fileName": "contract.pdf",
        "fileSize": 1024000,
        "contentType": "application/pdf"
      }
    ]
  }

  Frontend Usage:
  // Document detail page
  const getDocumentDetails = async (documentId) => {
    const response = await api.get(`/api/documents/${documentId}`);
    return response.data;
  };

  ---
  4. Get Document Files Only

  GET /api/documents/{id}/files
  Purpose: Get only files for a document (lighter than full details)

  Frontend Usage:
  // When you only need file list
  const getDocumentFiles = async (documentId) => {
    const response = await api.get(`/api/documents/${documentId}/files`);
    return response.data;
  };

  // File download component
  const FileList = ({ documentId }) => {
    const [files, setFiles] = useState([]);

    useEffect(() => {
      getDocumentFiles(documentId).then(setFiles);
    }, [documentId]);

    return (
      <div>
        {files.map(file => (
          <div key={file.id}>
            <span>{file.fileName}</span>
            <button onClick={() => downloadFile(file.id)}>Download</button>
          </div>
        ))}
      </div>
    );
  };

  ---
  🔍 SearchController Routes (/api/search)

  Optimized search operations with rate limiting and validation

  1. Search by Transaction Code

  GET /api/search/documents/transaction-code/{transactionCode}?pageNumber=1&pageSize=10
  Purpose: Find documents by exact transaction codeFeatures: Rate limited, full validation, error handling

  Frontend Usage:
  // Transaction code lookup
  const searchByTransactionCode = async (code, page = 1, size = 10) => {
    const response = await api.get(
      `/api/search/documents/transaction-code/${encodeURIComponent(code)}?pageNumber=${page}&pageSize=${size}`
    );
    return response.data;
  };

  // Quick search component
  const TransactionSearch = () => {
    const [code, setCode] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
      if (!code.trim()) return;

      setLoading(true);
      try {
        const result = await searchByTransactionCode(code);
        setResults(result);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <input 
          value={code} 
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter transaction code"
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    );
  };

  ---
  2. Search by Notary Public

  GET /api/search/documents/notary/{notaryPublic}?pageNumber=1&pageSize=10
  Purpose: Find all documents handled by specific notary

  Frontend Usage:
  // Notary performance dashboard
  const getNotaryDocuments = async (notaryName, page = 1) => {
    const response = await api.get(
      `/api/search/documents/notary/${encodeURIComponent(notaryName)}?pageNumber=${page}&pageSize=20`
    );
    return response.data;
  };

  ---
  3. Search by Secretary

  GET /api/search/documents/secretary/{secretary}?pageNumber=1&pageSize=10

  4. Search by Customer

  GET /api/search/documents/customer/{customerId}?pageNumber=1&pageSize=10

  5. Search by Business Registration

  GET /api/search/documents/business/{registrationNumber}?pageNumber=1&pageSize=10

  6. Search by Passport

  GET /api/search/documents/passport/{passportId}?pageNumber=1&pageSize=10

  ---
  7. Search by Date Range

  GET /api/search/documents/date-range?from=2024-01-01&to=2024-12-31&pageNumber=1&pageSize=10
  Purpose: Find documents within date range

  Frontend Usage:
  // Date range search
  const searchByDateRange = async (fromDate, toDate, page = 1) => {
    const params = new URLSearchParams({
      from: fromDate.toISOString().split('T')[0], // YYYY-MM-DD
      to: toDate.toISOString().split('T')[0],
      pageNumber: page,
      pageSize: 20
    });

    const response = await api.get(`/api/search/documents/date-range?${params}`);
    return response.data;
  };

  // Date picker component
  const DateRangeSearch = () => {
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
      if (!fromDate || !toDate) return;

      const data = await searchByDateRange(fromDate, toDate);
      setResults(data.items);
    };

    return (
      <div>
        <input 
          type="date" 
          value={fromDate?.toISOString().split('T')[0] || ''} 
          onChange={(e) => setFromDate(new Date(e.target.value))}
        />
        <input 
          type="date" 
          value={toDate?.toISOString().split('T')[0] || ''} 
          onChange={(e) => setToDate(new Date(e.target.value))}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
    );
  };

  ---
  8. Get Document Parties

  GET /api/search/party-links/document/{documentId}
  Purpose: Get all parties linked to a document

  Frontend Usage:
  // Document parties component
  const getDocumentParties = async (documentId) => {
    const response = await api.get(`/api/search/party-links/document/${documentId}`);
    return response.data;
  };

  const DocumentParties = ({ documentId }) => {
    const [parties, setParties] = useState([]);

    useEffect(() => {
      getDocumentParties(documentId).then(setParties);
    }, [documentId]);

    return (
      <div>
        <h3>Document Parties</h3>
        {parties.map(party => (
          <div key={party.customerId} className="party-item">
            <span>Customer: {party.customerId}</span>
            <span>Role: {party.partyRole}</span>
            <span>Status: {party.signatureStatus}</span>
            <span>Date: {new Date(party.notaryDate).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    );
  };

  ---
  9. Cross-Reference Search

  POST /api/search/documents/cross-reference
  Content-Type: application/json

  ["customer1", "customer2", "customer3"]
  Purpose: Find documents involving multiple customers (max 50)

  Frontend Usage:
  // Advanced search for shared documents
  const crossReferenceSearch = async (customerIds) => {
    if (customerIds.length > 50) {
      throw new Error('Maximum 50 customer IDs allowed');
    }

    const response = await api.post('/api/search/documents/cross-reference', customerIds);
    return response.data;
  };

  // Multi-customer document finder
  const CrossReferenceSearch = () => {
    const [customerIds, setCustomerIds] = useState(['']);
    const [results, setResults] = useState([]);

    const addCustomerId = () => {
      if (customerIds.length < 50) {
        setCustomerIds([...customerIds, '']);
      }
    };

    const updateCustomerId = (index, value) => {
      const updated = [...customerIds];
      updated[index] = value;
      setCustomerIds(updated);
    };

    const handleSearch = async () => {
      const validIds = customerIds.filter(id => id.trim());
      if (validIds.length < 2) return;

      const data = await crossReferenceSearch(validIds);
      setResults(data);
    };

    return (
      <div>
        <h3>Find Shared Documents</h3>
        {customerIds.map((id, index) => (
          <input
            key={index}
            value={id}
            onChange={(e) => updateCustomerId(index, e.target.value)}
            placeholder={`Customer ID ${index + 1}`}
          />
        ))}
        <button onClick={addCustomerId}>Add Customer</button>
        <button onClick={handleSearch}>Find Shared Documents</button>
      </div>
    );
  };

  ---
  🎯 Frontend Optimization Tips

  1. Efficient Data Fetching

  // Use appropriate endpoint for your needs
  const DocumentCard = ({ documentId, needsFullDetails = false }) => {
    if (needsFullDetails) {
      // Full document with parties and files
      return <FullDocumentView documentId={documentId} />;
    } else {
      // Just use paginated list data - no additional fetch needed
      return <SimpleDocumentCard documentId={documentId} />;
    }
  };

  2. Search Strategy

  // Use specific search endpoints instead of general search
  const searchDocuments = async (searchType, value) => {
    switch (searchType) {
      case 'transactionCode':
        return searchByTransactionCode(value);
      case 'notary':
        return searchByNotary(value);
      case 'customer':
        return searchByCustomer(value);
      default:
        // Fallback to general search
        return getDocuments(1, 10, value);
    }
  };

  3. Rate Limiting Handling

  // Handle rate limiting gracefully
  const apiCall = async (url, options = {}) => {
    try {
      const response = await api.get(url, options);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited - show user-friendly message
        throw new Error('Too many searches. Please wait a moment and try again.');
      }
      throw error;
    }
  };

  4. Performance Monitoring

  // Monitor API performance
  const withPerformanceTracking = (apiCall) => {
    return async (...args) => {
      const start = performance.now();
      try {
        const result = await apiCall(...args);
        const duration = performance.now() - start;
        console.log(`API call took ${duration.toFixed(2)}ms`);
        return result;
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    };
  };

  const trackedGetDocuments = withPerformanceTracking(getDocuments);