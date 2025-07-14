import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { DocumentType, DialogMode } from '../types/document.types';
import { useDocumentWithParties } from './useDocumentQueries';
import { useDeleteDocument } from './useDocumentMutations';

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
  const deleteDocumentMutation = useDeleteDocument();

  const handleEditDocument = useCallback(async (document: DocumentType) => {
    try {
      setLoading(true);
      
      // For edit mode, we can pass the document directly and let the form handle fetching
      // This allows React Query to handle caching and loading states
      onEdit?.(document, 'edit');
    } catch (error) {
      toast.error("Có lỗi khi tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [onEdit]);

  const handleViewDocument = useCallback(async (document: DocumentType) => {
    try {
      setLoading(true);
      
      // For view mode, we can pass the document directly and let the form handle fetching
      // This allows React Query to handle caching and loading states
      onView?.(document, 'view');
    } catch (error) {
      toast.error("Có lỗi khi tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [onView]);

  const handleUploadDocument = useCallback((document: DocumentType) => {
    onUpload?.(document, 'upload');
  }, [onUpload]);

  const handleDeleteDocument = useCallback(async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hồ sơ này?")) {
      return;
    }

    try {
      await deleteDocumentMutation.mutateAsync(id, {
        onSuccess: () => {
          toast.success("Đã xóa hồ sơ thành công!");
          onRefresh?.();
        },
        onError: (error) => {
          toast.error("Có lỗi xảy ra khi xóa hồ sơ");
        }
      });
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa hồ sơ");
    }
  }, [deleteDocumentMutation, onRefresh]);

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
    loading: loading || deleteDocumentMutation.isPending
  };
};