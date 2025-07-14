// File validation configuration
export const FILE_VALIDATION_CONFIG = {
  // Maximum file size in MB
  maxFileSizeInMB: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '10'),
  
  // Allowed file types
  allowedFileTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/webp',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ],
  
  // File type display names
  fileTypeDisplayNames: {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'image/jpeg': 'Image',
    'image/png': 'Image',
    'image/gif': 'Image',
    'image/bmp': 'Image',
    'image/svg+xml': 'Image',
    'image/webp': 'Image',
    'text/plain': 'Text',
    'text/csv': 'CSV',
    'application/zip': 'Archive',
    'application/x-rar-compressed': 'Archive',
    'application/x-7z-compressed': 'Archive'
  }
};