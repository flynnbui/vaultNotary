import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { DocumentType, DialogMode } from '../types/document.types';
import useDocumentApiService from '../services/documentApiService';

interface UseDocumentOperationsProps {
  onEdit?: (document: DocumentType, mode: DialogMode) => void;
  onView?: (document: DocumentType, mode: DialogMode) => void;
  onUpload?: (document: DocumentType, mode: DialogMode) => void;
  onRefresh?: () => void;
}

export const useDocumentOperations = ({
  onEdit,
  onView,
  onUpload,
  onRefresh
}: UseDocumentOperationsProps) => {
  const [loading, setLoading] = useState(false);
  const { deleteDocument, getDocumentWithPopulatedParties, getOptimizedDocumentData } = useDocumentApiService();

  const handleEditDocument = useCallback(async (document: DocumentType) => {
    try {
      setLoading(true);
      
      // For edit mode, we need parties data but can load files on-demand
      const documentData = await getOptimizedDocumentData(document.id, { 
        includeParties: true, 
        includeFiles: false 
      });
      
      if (!documentData) {
        throw new Error('Không thể tải thông tin hồ sơ');
      }
      
      // Create a compatible document object for the existing interface
      const compatibleDocument = {
        ...documentData.document,
        partyDocumentLinks: documentData.parties
      };
      
      onEdit?.(compatibleDocument, 'edit');
    } catch (error) {
      toast.error("Có lỗi khi tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [getOptimizedDocumentData, onEdit]);

  const handleViewDocument = useCallback(async (document: DocumentType) => {
    try {
      setLoading(true);
      
      // For view mode, show document immediately and load parties/files on-demand
      const documentData = await getOptimizedDocumentData(document.id, { 
        includeParties: true, 
        includeFiles: true 
      });
      
      if (!documentData) {
        throw new Error('Không thể tải thông tin hồ sơ');
      }
      
      // Create a compatible document object for the existing interface
      const compatibleDocument = {
        ...documentData.document,
        partyDocumentLinks: documentData.parties,
        files: documentData.files
      };
      
      onView?.(compatibleDocument, 'view');
    } catch (error) {
      toast.error("Có lỗi khi tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [getOptimizedDocumentData, onView]);

  const handleUploadDocument = useCallback((document: DocumentType) => {
    onUpload?.(document, 'upload');
  }, [onUpload]);

  const handleDeleteDocument = useCallback(async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hồ sơ này?")) {
      return;
    }

    try {
      setLoading(true);
      const success = await deleteDocument(id);
      
      if (success) {
        toast.success("Đã xóa hồ sơ thành công!");
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [deleteDocument, onRefresh]);

  const handleCopyDocument = useCallback(async (document: DocumentType) => {
    try {
      // For copying, we'll trigger create mode and let the form handle the data copying
      toast.success("Đã sao chép hồ sơ. Vui lòng chỉnh sửa thông tin cần thiết.");
      onEdit?.(document, 'create');
    } catch (error) {
      toast.error("Có lỗi khi sao chép hồ sơ");
    }
  }, [onEdit]);

  return {
    handleEditDocument,
    handleViewDocument,
    handleUploadDocument,
    handleDeleteDocument,
    handleCopyDocument,
    loading
  };
};