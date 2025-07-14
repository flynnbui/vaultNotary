import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { FileItem, DocumentType } from '../types/document.types';
import { FileUtils } from '@/src/shared/utils/fileUtils';
import useDocumentApiService from '../services/documentApiService';
import useDocumentUploadService from '../services/documentUploadService';

interface UseDocumentFilesProps {
  editingDocument?: DocumentType;
  dialogMode: 'create' | 'edit' | 'view' | 'upload';
}

export const useDocumentFiles = ({ editingDocument, dialogMode }: UseDocumentFilesProps) => {
  const [attachedFiles, setAttachedFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { getDocumentFiles, deleteDocumentFile, getFileDownloadUrl, getFilePresignedUrl } = useDocumentApiService();
  const { uploadDocumentFile } = useDocumentUploadService();

  const loadDocumentFiles = useCallback(async () => {
    if (!editingDocument || !['view', 'edit', 'upload'].includes(dialogMode)) {
      setAttachedFiles([]);
      return;
    }

    try {
      setLoading(true);      
      const files = await getDocumentFiles(editingDocument.id);
      const transformedFiles = files.map(apiFile => 
        FileUtils.transformApiFileToFileItemAuto(apiFile)
      );
      
      setAttachedFiles(transformedFiles);
    } catch (error) {
      setAttachedFiles([]);
      toast.error("Có lỗi khi tải danh sách file");
    } finally {
      setLoading(false);
    }
  }, [editingDocument, dialogMode, getDocumentFiles]);

  // Load files when document changes
  useEffect(() => {
    loadDocumentFiles();
  }, [editingDocument, dialogMode, loadDocumentFiles]);

  const handleFileUpload = useCallback(async (fileList: FileList) => {
    if (!editingDocument) {
      toast.error("Không tìm thấy ID hồ sơ để upload.");
      return;
    }

    const uploadedFiles: FileItem[] = [];
    setLoading(true);

    try {
      for (const file of Array.from(fileList)) {
        // Validate file 
        const validation = FileUtils.validateFile(file);
        if (!validation.isValid) {
          toast.error(`${file.name}: ${validation.error}`);
          continue;
        }

        try {
          const result = await uploadDocumentFile({
            documentId: editingDocument.id,
            file: file,
          });

          uploadedFiles.push({
            id: result.id,
            name: result.name,
            size: result.size,
            type: result.type,
            uploadDate: result.uploadDate,
            url: result.url,
          });
        } catch (err) {
          toast.error(`Upload thất bại: ${file.name}`);
        }
      }

      if (uploadedFiles.length > 0) {
        toast.success(`Đã upload ${uploadedFiles.length} file`);
        // Reload files from server to ensure consistency
        await loadDocumentFiles();
      }
    } finally {
      setLoading(false);
    }
  }, [editingDocument, uploadDocumentFile, loadDocumentFiles]);

  const handleFileDownload = useCallback(async (file: FileItem) => {
    try {
      setLoading(true);

      // Try presigned URL first
      try {
        const presignedUrl = await getFilePresignedUrl(file.id);
        if (presignedUrl) {
          const link = document.createElement("a");
          link.href = presignedUrl;
          link.download = file.name;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(`Đang tải xuống: ${file.name}`);
          return;
        }
      } catch (presignedError) {
        console.warn("Presigned URL failed, trying direct download:", presignedError);
      }

      // Fallback to direct download
      const directDownloadUrl = getFileDownloadUrl(file.id);
      const response = await fetch(directDownloadUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Đã tải xuống: ${file.name}`);
    } catch (error) {
      toast.error(`Không thể tải xuống file: ${file.name}`);
    } finally {
      setLoading(false);
    }
  }, [getFilePresignedUrl, getFileDownloadUrl]);

  const handleFilePreview = useCallback(async (file: FileItem) => {
    try {
      setLoading(true);
      toast.info("Đang tạo link xem trước...");

      const presignedUrl = await getFilePresignedUrl(file.id);
      if (presignedUrl) {
        window.open(presignedUrl, "_blank");
        toast.success("Đã mở file xem trước");
      } else {
        const downloadUrl = getFileDownloadUrl(file.id);
        window.open(downloadUrl, "_blank");
        toast.success("Đã mở file");
      }
    } catch (error) {
      toast.error(`Không thể xem trước file: ${file.name}`);
    } finally {
      setLoading(false);
    }
  }, [getFilePresignedUrl, getFileDownloadUrl]);

  const handleFileDelete = useCallback(async (file: FileItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa file "${file.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteDocumentFile(file.id);
      toast.success(`Đã xóa file: ${file.name}`);
      
      // Reload files from server
      await loadDocumentFiles();
    } catch (error) {
      toast.error(`Không thể xóa file: ${file.name}`);
    } finally {
      setLoading(false);
    }
  }, [deleteDocumentFile, loadDocumentFiles]);

  return {
    attachedFiles,
    loading,
    handleFileUpload,
    handleFileDownload,
    handleFilePreview,
    handleFileDelete,
    loadDocumentFiles,
    setAttachedFiles
  };
};