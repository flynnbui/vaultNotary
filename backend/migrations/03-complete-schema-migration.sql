-- VaultNotary Complete Schema Migration
-- This migration creates the complete VaultNotary database schema
-- Generated: 2025-07-10
-- 
-- This script is idempotent and can be run multiple times safely
-- It will create the schema if it doesn't exist or update existing schema

-- =============================================================================
-- DOCUMENTS TABLE
-- =============================================================================
-- Core document metadata table
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(50) NOT NULL,
    created_date TIMESTAMP NOT NULL,
    secretary VARCHAR(255) NOT NULL,
    notary_public VARCHAR(255) NOT NULL,
    transaction_code VARCHAR(100) NOT NULL,
    description TEXT,
    document_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT documents_pkey PRIMARY KEY (id),
    CONSTRAINT documents_transaction_code_key UNIQUE (transaction_code)
);

-- =============================================================================
-- CUSTOMERS TABLE  
-- =============================================================================
-- Customer/Party information table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    type VARCHAR(20) NOT NULL, -- Individual/Business
    document_id VARCHAR(50), -- National ID/Document ID
    passport_id VARCHAR(50),
    business_registration_number VARCHAR(100),
    business_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT customers_pkey PRIMARY KEY (id)
);

-- =============================================================================
-- DOCUMENT FILES TABLE
-- =============================================================================
-- File metadata and S3 references for documents
CREATE TABLE IF NOT EXISTS document_files (
    id VARCHAR(50) NOT NULL,
    document_id VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    s3_key VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT document_files_pkey PRIMARY KEY (id),
    CONSTRAINT document_files_document_id_fkey 
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- =============================================================================
-- PARTY DOCUMENT LINKS TABLE
-- =============================================================================
-- Many-to-many relationship between customers and documents with roles
CREATE TABLE IF NOT EXISTS party_document_links (
    document_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    party_role VARCHAR(20) NOT NULL, -- PartyA/PartyB/Witness/Notary (0,1,2,3)
    signature_status VARCHAR(20) NOT NULL, -- Pending/Signed/Rejected (0,1,2)
    notary_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT party_document_links_pkey PRIMARY KEY (document_id, customer_id),
    CONSTRAINT party_document_links_document_id_fkey 
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT party_document_links_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Documents table indexes
CREATE INDEX IF NOT EXISTS idx_documents_transaction_code ON documents(transaction_code);
CREATE INDEX IF NOT EXISTS idx_documents_notary_public ON documents(notary_public);
CREATE INDEX IF NOT EXISTS idx_documents_secretary ON documents(secretary);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_date ON documents(created_date);

-- Document files table indexes
CREATE INDEX IF NOT EXISTS idx_files_document_id ON document_files(document_id);
CREATE INDEX IF NOT EXISTS idx_files_s3_key ON document_files(s3_key);

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_full_name ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_customers_document_id ON customers(document_id);
CREATE INDEX IF NOT EXISTS idx_customers_passport_id ON customers(passport_id);
CREATE INDEX IF NOT EXISTS idx_customers_business_reg ON customers(business_registration_number);

-- Party document links indexes
CREATE INDEX IF NOT EXISTS idx_party_links_customer_id ON party_document_links(customer_id);
CREATE INDEX IF NOT EXISTS idx_party_links_notary_date ON party_document_links(notary_date);
CREATE INDEX IF NOT EXISTS idx_party_links_party_role ON party_document_links(party_role);

-- =============================================================================
-- VIEWS FOR REPORTING
-- =============================================================================

-- Drop and recreate the view to ensure it's up to date
DROP VIEW IF EXISTS documents_with_details;

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

-- =============================================================================
-- DATA CONSTRAINTS AND VALIDATION
-- =============================================================================

-- Add content type validation for file uploads (if constraint doesn't exist)
DO $$
BEGIN
    -- Check if constraint exists before adding
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_document_files_content_type') THEN
        ALTER TABLE document_files ADD CONSTRAINT ck_document_files_content_type 
        CHECK (content_type IN ('application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/jpg'));
    END IF;
END $$;

-- Add customer type validation (if constraint doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_customers_type') THEN
        ALTER TABLE customers ADD CONSTRAINT ck_customers_type 
        CHECK (type IN ('Individual', 'Business'));
    END IF;
END $$;

-- Add party role validation (if constraint doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_party_document_links_party_role') THEN
        ALTER TABLE party_document_links ADD CONSTRAINT ck_party_document_links_party_role 
        CHECK (party_role IN ('PartyA', 'PartyB', 'Witness', 'Notary', '0', '1', '2', '3'));
    END IF;
END $$;

-- Add signature status validation (if constraint doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_party_document_links_signature_status') THEN
        ALTER TABLE party_document_links ADD CONSTRAINT ck_party_document_links_signature_status 
        CHECK (signature_status IN ('Pending', 'Signed', 'Rejected', '0', '1', '2'));
    END IF;
END $$;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE documents IS 'Core document metadata and information';
COMMENT ON TABLE customers IS 'Customer/party information for individuals and businesses';
COMMENT ON TABLE document_files IS 'File metadata for documents. Actual files stored in S3';
COMMENT ON TABLE party_document_links IS 'Many-to-many relationship between customers and documents with roles and signature status';

COMMENT ON COLUMN documents.transaction_code IS 'Unique identifier for the notarial transaction';
COMMENT ON COLUMN documents.created_date IS 'Date when the document was originally created';
COMMENT ON COLUMN documents.notary_public IS 'Name of the notary public who notarized the document';

COMMENT ON COLUMN customers.type IS 'Customer type: Individual or Business';
COMMENT ON COLUMN customers.document_id IS 'National ID or government-issued document ID';
COMMENT ON COLUMN customers.passport_id IS 'Passport number for identification';

COMMENT ON COLUMN document_files.content_type IS 'MIME type of the file. Only PDF and image types allowed';
COMMENT ON COLUMN document_files.s3_key IS 'S3 storage key in format: documents/{documentId}/{fileId}';
COMMENT ON COLUMN document_files.s3_bucket IS 'S3 bucket name where the file is stored';

COMMENT ON COLUMN party_document_links.party_role IS 'Role in document: PartyA(0), PartyB(1), Witness(2), Notary(3)';
COMMENT ON COLUMN party_document_links.signature_status IS 'Signature status: Pending(0), Signed(1), Rejected(2)';
COMMENT ON COLUMN party_document_links.notary_date IS 'Date when the party was notarized';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
INSERT INTO information_schema.sql_features (feature_id, feature_name, sub_feature_id, sub_feature_name, is_supported, comments)
VALUES ('VAULTNOTARY_MIGRATION_03', 'Complete Schema Migration', 'SCHEMA_V1', 'VaultNotary Schema Version 1.0', 'YES', 'Migration completed at ' || NOW())
ON CONFLICT DO NOTHING;

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'VaultNotary schema migration completed successfully at %', NOW();
END $$;