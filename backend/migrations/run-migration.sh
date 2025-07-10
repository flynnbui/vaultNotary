#!/bin/bash

# VaultNotary Database Migration Runner
# Usage: ./run-migration.sh [migration-file] [database-url]

set -e  # Exit on any error

# Configuration
DEFAULT_DB_URL="postgresql://postgres:password@localhost:5432/vaultnotary"
MIGRATIONS_DIR="$(dirname "$0")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    echo "Usage: $0 [migration-file] [database-url]"
    echo ""
    echo "Available migrations:"
    ls -1 "$MIGRATIONS_DIR"/*.sql | grep -v rollback | sed 's/.*\//  - /'
    echo ""
    echo "Examples:"
    echo "  $0 03-complete-schema-migration.sql"
    echo "  $0 03-complete-schema-migration.sql postgresql://user:pass@host:5432/dbname"
    echo ""
    echo "Default database URL: $DEFAULT_DB_URL"
}

# Parse arguments
MIGRATION_FILE="$1"
DATABASE_URL="${2:-$DEFAULT_DB_URL}"

if [ -z "$MIGRATION_FILE" ]; then
    show_usage
    exit 1
fi

# Validate migration file exists
MIGRATION_PATH="$MIGRATIONS_DIR/$MIGRATION_FILE"
if [ ! -f "$MIGRATION_PATH" ]; then
    log_error "Migration file not found: $MIGRATION_PATH"
    show_usage
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    log_error "psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Test database connection
log_info "Testing database connection..."
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    log_error "Cannot connect to database: $DATABASE_URL"
    log_error "Please check your connection string and ensure the database is running."
    exit 1
fi

log_success "Database connection successful"

# Create backup (if tables exist)
log_info "Creating backup before migration..."
BACKUP_FILE="$MIGRATIONS_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

# Check if any of our tables exist before trying to backup
if psql "$DATABASE_URL" -c "\dt" | grep -E "(documents|customers|document_files|party_document_links)" > /dev/null 2>&1; then
    if pg_dump "$DATABASE_URL" --data-only --inserts > "$BACKUP_FILE" 2>/dev/null; then
        log_success "Backup created: $BACKUP_FILE"
    else
        log_warning "Could not create backup, but proceeding with migration"
    fi
else
    log_info "No existing tables found, skipping backup"
fi

# Run migration
log_info "Running migration: $MIGRATION_FILE"
log_info "Database: $DATABASE_URL"

if psql "$DATABASE_URL" -f "$MIGRATION_PATH"; then
    log_success "Migration completed successfully!"
    
    # Show table status
    log_info "Current database tables:"
    psql "$DATABASE_URL" -c "\dt" 2>/dev/null || log_warning "Could not list tables"
    
    # Show record counts
    log_info "Record counts:"
    psql "$DATABASE_URL" -c "
        SELECT 
            'documents' as table_name, COUNT(*) as count FROM documents
        UNION ALL
        SELECT 
            'customers' as table_name, COUNT(*) as count FROM customers
        UNION ALL
        SELECT 
            'document_files' as table_name, COUNT(*) as count FROM document_files
        UNION ALL
        SELECT 
            'party_document_links' as table_name, COUNT(*) as count FROM party_document_links;
    " 2>/dev/null || log_warning "Could not get record counts"
    
else
    log_error "Migration failed!"
    
    if [ -f "$BACKUP_FILE" ]; then
        log_info "You can restore from backup using:"
        log_info "  psql $DATABASE_URL < $BACKUP_FILE"
    fi
    
    exit 1
fi

log_success "Migration process completed!"