-- VaultNotary Complete Schema Migration Rollback
-- This script safely rolls back the 03-complete-schema-migration.sql
-- 
-- WARNING: This will remove all data! Use with caution in production.
-- Make sure you have backups before running this script.

-- =============================================================================
-- ROLLBACK CONSTRAINTS
-- =============================================================================

-- Remove custom constraints (keep referential integrity for now)
ALTER TABLE document_files DROP CONSTRAINT IF EXISTS ck_document_files_content_type;
ALTER TABLE customers DROP CONSTRAINT IF EXISTS ck_customers_type;
ALTER TABLE party_document_links DROP CONSTRAINT IF EXISTS ck_party_document_links_party_role;
ALTER TABLE party_document_links DROP CONSTRAINT IF EXISTS ck_party_document_links_signature_status;

-- =============================================================================
-- ROLLBACK VIEWS
-- =============================================================================

DROP VIEW IF EXISTS documents_with_details;

-- =============================================================================
-- ROLLBACK INDEXES
-- =============================================================================

-- Drop performance indexes (primary keys and foreign keys will remain)
DROP INDEX IF EXISTS idx_documents_transaction_code;
DROP INDEX IF EXISTS idx_documents_notary_public;
DROP INDEX IF EXISTS idx_documents_secretary;
DROP INDEX IF EXISTS idx_documents_document_type;
DROP INDEX IF EXISTS idx_documents_created_date;

DROP INDEX IF EXISTS idx_files_document_id;
DROP INDEX IF EXISTS idx_files_s3_key;

DROP INDEX IF EXISTS idx_customers_full_name;
DROP INDEX IF EXISTS idx_customers_document_id;
DROP INDEX IF EXISTS idx_customers_passport_id;
DROP INDEX IF EXISTS idx_customers_business_reg;

DROP INDEX IF EXISTS idx_party_links_customer_id;
DROP INDEX IF EXISTS idx_party_links_notary_date;
DROP INDEX IF EXISTS idx_party_links_party_role;

-- =============================================================================
-- ROLLBACK TABLES (DANGEROUS - WILL DELETE ALL DATA)
-- =============================================================================

-- Uncomment the lines below ONLY if you want to completely remove all tables
-- WARNING: This will delete all your data!

-- DROP TABLE IF EXISTS party_document_links CASCADE;
-- DROP TABLE IF EXISTS document_files CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;
-- DROP TABLE IF EXISTS documents CASCADE;

-- =============================================================================
-- SAFE ROLLBACK ALTERNATIVE - PRESERVE DATA
-- =============================================================================

-- If you want to keep the data but just remove the migration tracking:
DELETE FROM information_schema.sql_features 
WHERE feature_id = 'VAULTNOTARY_MIGRATION_03';

-- Print rollback completion message
DO $$
BEGIN
    RAISE NOTICE 'VaultNotary schema migration rollback completed at %', NOW();
    RAISE NOTICE 'NOTE: Tables and data were preserved. Only constraints and indexes were removed.';
    RAISE NOTICE 'To completely remove tables, uncomment the DROP TABLE statements in the rollback script.';
END $$;