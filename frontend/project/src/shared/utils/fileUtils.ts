import {
  DocumentFileFromApi,
  FileItem,
} from "@/src/features/documents/types/document.types";
import { DocumentFileDto } from "@/src/types/api.types";
import { FILE_VALIDATION_CONFIG } from "@/src/config/fileValidation";

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
  static transformApiFileToFileItemAuto(
    apiFile: DocumentFileFromApi
  ): FileItem {
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
   * Transform DocumentFileDto to FileItem format
   */
  static transformDocumentFileDtoToFileItem(
    apiFile: DocumentFileDto
  ): FileItem {
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
    return FILE_VALIDATION_CONFIG.allowedFileTypes.includes(file.type);
  }

  /**
   * Validate file size
   */
  static validateFileSize(
    file: File,
    maxSizeInMB: number = FILE_VALIDATION_CONFIG.maxFileSizeInMB
  ): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  /**
   * Comprehensive file validation
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!this.validateFileType(file)) {
      return {
        isValid: false,
        error: `File type not supported: ${file.type || "unknown"}`,
      };
    }

    if (!this.validateFileSize(file)) {
      return {
        isValid: false,
        error: `File too large: ${this.formatFileSize(file.size)} (max ${
          FILE_VALIDATION_CONFIG.maxFileSizeInMB
        }MB)`,
      };
    }

    return { isValid: true };
  }

  /**
   * Format file size to human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Get file type icon class
   */
  static getFileTypeIcon(contentType: string): string {
    const iconMap: Record<string, string> = {
      "application/pdf": "file-pdf",
      "application/msword": "file-word",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "file-word",
      "application/vnd.ms-excel": "file-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "file-excel",
      "image/jpeg": "file-image",
      "image/png": "file-image",
      "image/gif": "file-image",
      "image/bmp": "file-image",
      "image/svg+xml": "file-image",
      "image/webp": "file-image",
      "text/plain": "file-text",
      "text/csv": "file-csv",
      "application/zip": "file-archive",
      "application/x-rar-compressed": "file-archive",
      "application/x-7z-compressed": "file-archive",
    };

    return iconMap[contentType] || "file";
  }

  /**
   * Get file type display name
   */
  static getFileTypeDisplayName(contentType: string): string {
    return (
      FILE_VALIDATION_CONFIG.fileTypeDisplayNames[
        contentType as keyof typeof FILE_VALIDATION_CONFIG.fileTypeDisplayNames
      ] || "Unknown"
    );
  }
}
