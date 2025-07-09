-- Migration: Simplify DocumentFile entity
-- Remove unnecessary columns and add content type validation

-- Remove columns that are no longer needed
ALTER TABLE document_files DROP COLUMN IF EXISTS FileName;
ALTER TABLE document_files DROP COLUMN IF EXISTS FileSize;
ALTER TABLE document_files DROP COLUMN IF EXISTS S3Bucket;

-- Add content type validation constraint
ALTER TABLE document_files ADD CONSTRAINT CK_DocumentFiles_ContentType 
CHECK (ContentType IN ('application/pdf', 'image/jpeg', 'image/png', 'image/gif'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS IX_DocumentFiles_ContentType ON document_files(ContentType);

-- Update any existing records to ensure they have valid content types
-- (This is a safety measure in case there are existing records)
UPDATE document_files 
SET ContentType = 'application/pdf' 
WHERE ContentType IS NULL OR ContentType = '';

-- Add comment to table
COMMENT ON TABLE document_files IS 'Stores file metadata for documents. Actual files are stored in S3.';
COMMENT ON COLUMN document_files.ContentType IS 'MIME type of the file. Only PDF and image types are allowed.';
COMMENT ON COLUMN document_files.S3Key IS 'S3 storage key in format: documents/{documentId}/{fileId}';