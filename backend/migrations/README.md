# VaultNotary Database Migrations

This directory contains SQL migration scripts for the VaultNotary database schema.

## Migration Files

### Core Schema Migrations

- **`01-init-database.sql`** - Initial database schema (legacy)
- **`02-simplify-document-files.sql`** - File schema simplification (legacy/outdated)
- **`03-complete-schema-migration.sql`** - Complete current schema (recommended)
- **`03-complete-schema-migration-rollback.sql`** - Rollback for migration 03

### Helper Scripts

- **`run-migration.sh`** - Automated migration runner with backup and validation
- **`README.md`** - This documentation file

## Database Schema Overview

The VaultNotary database consists of four main tables:

### 1. `documents`
Core document metadata and notarial transaction information.
- **Primary Key**: `id` (VARCHAR(50))
- **Unique Constraint**: `transaction_code`
- **Key Fields**: `secretary`, `notary_public`, `document_type`, `created_date`

### 2. `customers`
Customer/party information for individuals and businesses.
- **Primary Key**: `id` (VARCHAR(50))
- **Types**: Individual, Business
- **Key Fields**: `full_name`, `type`, `document_id`, `passport_id`

### 3. `document_files`
File metadata and S3 storage references.
- **Primary Key**: `id` (VARCHAR(50))
- **Foreign Key**: `document_id` → `documents(id)` (CASCADE DELETE)
- **Key Fields**: `file_name`, `file_size`, `content_type`, `s3_key`, `s3_bucket`

### 4. `party_document_links`
Many-to-many relationship between customers and documents.
- **Composite Primary Key**: `(document_id, customer_id)`
- **Foreign Keys**: 
  - `document_id` → `documents(id)` (CASCADE DELETE)
  - `customer_id` → `customers(id)` (RESTRICT DELETE)
- **Key Fields**: `party_role`, `signature_status`, `notary_date`

### 5. `documents_with_details` (VIEW)
Aggregated view showing documents with file counts, party counts, and party names.

## How to Run Migrations

### Option 1: Using the Migration Runner (Recommended)

```bash
# Navigate to migrations directory
cd backend/migrations

# Run the complete schema migration
./run-migration.sh 03-complete-schema-migration.sql

# Run with custom database URL
./run-migration.sh 03-complete-schema-migration.sql postgresql://user:pass@host:5432/dbname
```

### Option 2: Direct PostgreSQL

```bash
# Using psql directly
psql postgresql://postgres:password@localhost:5432/vaultnotary -f 03-complete-schema-migration.sql

# Using Docker
docker exec vaultnotary-postgres psql -U postgres -d vaultnotary -f /docker-entrypoint-initdb.d/03-complete-schema-migration.sql
```

### Option 3: Docker Compose (Auto-run)

Add migration files to the `docker-entrypoint-initdb.d` volume in docker-compose.yml:

```yaml
postgres:
  # ... other config
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - ./backend/migrations:/docker-entrypoint-initdb.d
```

## Migration Features

### Idempotent Design
All migrations use `CREATE TABLE IF NOT EXISTS` and conditional logic, making them safe to run multiple times.

### Automatic Backups
The migration runner creates timestamped backups before applying changes.

### Validation
- Database connectivity testing
- Table existence verification
- Record count reporting

### Constraints and Validation
- Content type validation for files (PDF, JPEG, PNG, GIF)
- Customer type validation (Individual, Business)  
- Party role validation (PartyA/0, PartyB/1, Witness/2, Notary/3)
- Signature status validation (Pending/0, Signed/1, Rejected/2)

### Performance Indexes
Comprehensive indexing for:
- Document searches (transaction_code, notary_public, secretary, document_type, created_date)
- File lookups (document_id, s3_key)
- Customer searches (full_name, document_id, passport_id, business_registration_number)
- Party relationships (customer_id, notary_date, party_role)

## Data Types and Enums

### Customer Types
- `Individual` or `0` - Individual person
- `Business` or `1` - Business entity

### Party Roles  
- `PartyA` or `0` - Primary party
- `PartyB` or `1` - Secondary party
- `Witness` or `2` - Witness to the transaction
- `Notary` or `3` - Notary public

### Signature Status
- `Pending` or `0` - Awaiting signature
- `Signed` or `1` - Successfully signed
- `Rejected` or `2` - Signature rejected

## Rollback Instructions

If you need to rollback a migration:

```bash
# Run the rollback script
psql postgresql://postgres:password@localhost:5432/vaultnotary -f 03-complete-schema-migration-rollback.sql

# Or restore from backup
psql postgresql://postgres:password@localhost:5432/vaultnotary < backup_YYYYMMDD_HHMMSS.sql
```

⚠️ **Warning**: Rollbacks may result in data loss. Always backup before running migrations in production.

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure PostgreSQL is running and accessible
2. **Permission denied**: Check database user permissions
3. **Table already exists**: Normal for idempotent migrations, safe to ignore
4. **Constraint violations**: May indicate data inconsistency, check existing data

### Useful Commands

```sql
-- Check migration status
SELECT * FROM information_schema.sql_features WHERE feature_id LIKE 'VAULTNOTARY%';

-- View table structures  
\d documents
\d customers
\d document_files
\d party_document_links

-- Check indexes
\di

-- View constraints
\d+ table_name
```

## Development Notes

- The migration system supports both string enum values and integer representations for API compatibility
- All timestamps use PostgreSQL's `TIMESTAMP` type with `NOW()` defaults
- Foreign key constraints ensure referential integrity
- Cascading deletes are used where appropriate (documents → files, documents → party links)
- Customer deletion is restricted if they have associated documents