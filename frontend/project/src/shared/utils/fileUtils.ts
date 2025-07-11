import { DocumentFileFromApi, FileItem } from '@/src/features/documents/types/document.types';

export class FileUtils {
  /**
   * Transform API file response to FileItem format
   */
  static transformApiFileToFileItem(
    apiFile: DocumentFileFromApi,
    fileName: string,
    fileSize: number
  ): FileItem {
    return {
      id: apiFile.id,
      name: fileName,
      size: fileSize,
      type: apiFile.contentType,
      uploadDate: apiFile.createdAt,
      url: `/api/files/download/${apiFile.id}`,
    };
  }

  /**
   * Transform API file response using file data from API
   */
  static transformApiFileToFileItemAuto(apiFile: DocumentFileFromApi): FileItem {
    return {
      id: apiFile.id,
      name: apiFile.fileName,
      size: apiFile.fileSize,
      type: apiFile.contentType,
      uploadDate: apiFile.createdAt,
      url: `/api/files/download/${apiFile.id}`,
    };
  }

  /**
   * Validate file type
   */
  static validateFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    return allowedTypes.includes(file.type);
  }

  /**
   * Format file size to human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type icon class
   */
  static getFileTypeIcon(contentType: string): string {
    const iconMap: Record<string, string> = {
      'application/pdf': 'file-pdf',
      'application/msword': 'file-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word',
      'image/jpeg': 'file-image',
      'image/png': 'file-image',
      'image/gif': 'file-image',
      'text/plain': 'file-text'
    };
    
    return iconMap[contentType] || 'file';
  }
}