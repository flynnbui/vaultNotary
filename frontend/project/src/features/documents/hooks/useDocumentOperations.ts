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
  const { deleteDocument, getDocumentWithPopulatedParties } = useDocumentApiService();

  const handleEditDocument = useCallback(async (document: DocumentType) => {
    try {
      setLoading(true);
      
      const populatedDocument = await getDocumentWithPopulatedParties(document.id);
      if (!populatedDocument) {
        throw new Error('Không thể tải thông tin hồ sơ');
      }
      onEdit?.(populatedDocument, 'edit');
    } catch (error) {
      toast.error("Có lỗi khi tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [getDocumentWithPopulatedParties, onEdit]);

  const handleViewDocument = useCallback(async (document: DocumentType) => {
    try {
      setLoading(true);
      
      const populatedDocument = await getDocumentWithPopulatedParties(document.id);
      if (!populatedDocument) {
        throw new Error('Không thể tải thông tin hồ sơ');
      }
      onView?.(populatedDocument, 'view');
    } catch (error) {
      toast.error("Có lỗi khi tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [getDocumentWithPopulatedParties, onView]);

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
      console.error("Error deleting document:", error);
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
      console.error("Error copying document:", error);
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