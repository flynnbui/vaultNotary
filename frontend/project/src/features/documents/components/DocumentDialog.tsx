import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Edit } from 'lucide-react';

import { DialogMode, FileItem } from '../types/document.types';
import { FileMetaCard } from '@/src/components/forms/FileMetaCard';
import { PartiesAccordion } from '@/src/components/forms/PartiesAccordion';
import { FileListCard } from '@/src/components/forms/FileListCard';
import { useDocumentForm } from '../hooks/useDocumentForm';

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: DialogMode;
  editingDocument?: any;
  attachedFiles: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  onFileUpload?: (fileList: FileList) => void;
  onFileDownload?: (file: FileItem) => void;
  onFilePreview?: (file: FileItem) => void;
  onFileDelete?: (file: FileItem) => void;
  onCustomerDialogChange: (open: boolean) => void;
  onSuccess?: () => void;
  onCancel?: () => void;
  onModeChange?: (mode: DialogMode) => void;
}

export const DocumentDialog: React.FC<DocumentDialogProps> = ({
  open,
  onOpenChange,
  mode,
  editingDocument,
  attachedFiles,
  onFilesChange,
  onFileUpload,
  onFileDownload,
  onFilePreview,
  onFileDelete,
  onCustomerDialogChange,
  onSuccess,
  onCancel,
  onModeChange,
}) => {
  const { methods, handleSubmit, isSubmitting } = useDocumentForm({
    editingDocument,
    dialogMode: mode,
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
    },
  });

  const getDialogTitle = () => {
    switch (mode) {
      case "create":
        return "Tạo hồ sơ mới";
      case "edit":
        return "Chỉnh sửa hồ sơ";
      case "view":
        return "Xem chi tiết hồ sơ";
      case "upload":
        return "Thêm tài liệu";
      default:
        return "Hồ sơ";
    }
  };

  const handleCancel = () => {
    if (mode === "view") {
      onOpenChange(false);
      return;
    }

    if (confirm("Bạn có chắc chắn muốn hủy? Tất cả dữ liệu sẽ bị mất.")) {
      methods.reset();
      onCancel?.();
      onOpenChange(false);
    }
  };

  const renderReadOnlyContent = () => (
    <FormProvider {...methods}>
      <div className="space-y-6 mt-6">
        <FileMetaCard readOnly={true} />
        
        <PartiesAccordion
          readOnly={true}
          onCustomerDialogChange={onCustomerDialogChange}
        />
        
        <FileListCard
          readOnly={true}
          files={attachedFiles}
          onFilesChange={onFilesChange}
          onFileDownload={onFileDownload}
          onFilePreview={onFilePreview}
          title="File đính kèm"
        />
        
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          <Button
            type="button"
            onClick={() => onModeChange?.("edit")}
            className="bg-[#800020] hover:bg-[#722F37] text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh sửa
          </Button>
        </div>
      </div>
    </FormProvider>
  );

  const renderUploadContent = () => (
    <FormProvider {...methods}>
      <div className="space-y-6 mt-6">
        <FileListCard
          allowUpload={true}
          files={attachedFiles}
          onFilesChange={onFilesChange}
          onFileUpload={onFileUpload}
          onFileDownload={onFileDownload}
          onFilePreview={onFilePreview}
          onFileDelete={onFileDelete}
          readOnly={false}
        />
        
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-[#800020] hover:bg-[#722F37] text-white"
          >
            Hoàn thành
          </Button>
        </div>
      </div>
    </FormProvider>
  );

  const renderFormContent = () => (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <FileMetaCard readOnly={false} />
    
        <PartiesAccordion
          readOnly={false}
          onCustomerDialogChange={onCustomerDialogChange}
        />
        
        {mode !== "create" && (
          <FileListCard
            readOnly={false}
            files={attachedFiles}
            onFilesChange={onFilesChange}
            onFileDownload={onFileDownload}
            onFilePreview={onFilePreview}
            onFileDelete={onFileDelete}
            title="File đính kèm"
          />
        )}
        
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="bg-[#800020] hover:bg-[#722F37] text-white px-8"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Đang lưu..."
              : editingDocument
              ? "Cập nhật hồ sơ"
              : "Lưu hồ sơ"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );

  const renderContent = () => {
    switch (mode) {
      case "view":
        return renderReadOnlyContent();
      case "upload":
        return renderUploadContent();
      default:
        return renderFormContent();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};