-- VaultNotary PostgreSQL Database Schema
-- Initial migration from DynamoDB to PostgreSQL

-- Documents table (metadata only)
CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    created_date TIMESTAMP NOT NULL,
    secretary VARCHAR(255) NOT NULL,
    notary_public VARCHAR(255) NOT NULL,
    transaction_code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    document_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Files table (file metadata + S3 references)
CREATE TABLE document_files (
    id VARCHAR(50) PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    type VARCHAR(20) NOT NULL, -- Individual/Business
    document_id VARCHAR(50), -- National ID
    passport_id VARCHAR(50),
    business_registration_number VARCHAR(100),
    business_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Party-Document relationships
CREATE TABLE party_document_links (
    document_id VARCHAR(50) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    party_role VARCHAR(20) NOT NULL, -- PartyA/PartyB/Witness/Notary
    signature_status VARCHAR(20) NOT NULL, -- Pending/Signed/Rejected
    notary_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (document_id, customer_id)
);

-- Indexes for search performance
CREATE INDEX idx_documents_transaction_code ON documents(transaction_code);
CREATE INDEX idx_documents_notary_public ON documents(notary_public);
CREATE INDEX idx_documents_secretary ON documents(secretary);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_created_date ON documents(created_date);

CREATE INDEX idx_files_document_id ON document_files(document_id);
CREATE INDEX idx_files_s3_key ON document_files(s3_key);

CREATE INDEX idx_customers_full_name ON customers(full_name);
CREATE INDEX idx_customers_document_id ON customers(document_id);
CREATE INDEX idx_customers_passport_id ON customers(passport_id);
CREATE INDEX idx_customers_business_reg ON customers(business_registration_number);

CREATE INDEX idx_party_links_customer_id ON party_document_links(customer_id);
CREATE INDEX idx_party_links_notary_date ON party_document_links(notary_date);
CREATE INDEX idx_party_links_party_role ON party_document_links(party_role);

-- Insert some sample data for testing
INSERT INTO customers (id, full_name, address, phone, email, type, document_id, created_at, updated_at) VALUES
('customer-1', 'John Doe', '123 Main St, Anytown, USA', '+1-555-0123', 'john.doe@example.com', 'Individual', 'ID123456789', NOW(), NOW()),
('customer-2', 'Jane Smith', '456 Oak Ave, Somewhere, USA', '+1-555-0124', 'jane.smith@example.com', 'Individual', 'ID987654321', NOW(), NOW()),
('customer-3', 'ABC Corporation', '789 Business Blvd, Corporate City, USA', '+1-555-0125', 'contact@abccorp.com', 'Business', NULL, NOW(), NOW());

UPDATE customers SET business_registration_number = 'BRN123456789', business_name = 'ABC Corporation' WHERE id = 'customer-3';

INSERT INTO documents (id, created_date, secretary, notary_public, transaction_code, description, document_type, created_at, updated_at) VALUES
('doc-1', '2024-01-15 10:00:00', 'Mary Johnson', 'Robert Wilson', 'TXN-2024-001', 'Property Purchase Agreement', 'Real Estate Contract', NOW(), NOW()),
('doc-2', '2024-01-16 14:30:00', 'Mary Johnson', 'Robert Wilson', 'TXN-2024-002', 'Business Partnership Agreement', 'Partnership Contract', NOW(), NOW());

INSERT INTO party_document_links (document_id, customer_id, party_role, signature_status, notary_date, created_at, updated_at) VALUES
('doc-1', 'customer-1', 'PartyA', 'Signed', '2024-01-15 10:30:00', NOW(), NOW()),
('doc-1', 'customer-2', 'PartyB', 'Signed', '2024-01-15 10:35:00', NOW(), NOW()),
('doc-2', 'customer-1', 'PartyA', 'Signed', '2024-01-16 15:00:00', NOW(), NOW()),
('doc-2', 'customer-3', 'PartyB', 'Pending', '2024-01-16 15:00:00', NOW(), NOW());

-- Sample file records
INSERT INTO document_files (id, document_id, file_name, file_size, content_type, s3_key, s3_bucket, created_at, updated_at) VALUES
('file-1', 'doc-1', 'property-agreement.pdf', 245760, 'application/pdf', 'files/doc-1/property-agreement.pdf', 'vaultnotary-files-prod', NOW(), NOW()),
('file-2', 'doc-2', 'partnership-agreement.pdf', 189440, 'application/pdf', 'files/doc-2/partnership-agreement.pdf', 'vaultnotary-files-prod', NOW(), NOW());

-- Create a view for easy document queries with related data
CREATE VIEW documents_with_details AS
SELECT 
    d.id,
    d.created_date,
    d.secretary,
    d.notary_public,
    d.transaction_code,
    d.description,
    d.document_type,
    d.created_at,
    d.updated_at,
    COUNT(f.id) as file_count,
    COUNT(pdl.customer_id) as party_count,
    STRING_AGG(DISTINCT c.full_name, ', ') as party_names
FROM documents d
LEFT JOIN document_files f ON d.id = f.document_id
LEFT JOIN party_document_links pdl ON d.id = pdl.document_id
LEFT JOIN customers c ON pdl.customer_id = c.id
GROUP BY d.id, d.created_date, d.secretary, d.notary_public, d.transaction_code, d.description, d.document_type, d.created_at, d.updated_at;