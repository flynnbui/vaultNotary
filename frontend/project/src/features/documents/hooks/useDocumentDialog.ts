import { useState, useCallback } from 'react';
import { DocumentType, DialogMode, FileItem } from '../types/document.types';
import { useDocumentOperations } from './useDocumentOperations';
import { useDocumentFiles } from './useDocumentFiles';

export interface UseDocumentDialogReturn {
  // Dialog state
  isOpen: boolean;
  dialogMode: DialogMode;
  editingDocument?: DocumentType;
  
  // File operations
  attachedFiles: FileItem[];
  
  // Dialog handlers
  handleCreate: () => void;
  handleEdit: (document: DocumentType) => void;
  handleView: (document: DocumentType) => void;
  handleUpload: (document: DocumentType) => void;
  handleDialogChange: (open: boolean) => void;
  handleSuccess: () => void;
  handleCancel: () => void;
  handleModeChange: (mode: DialogMode) => void;
  
  // File handlers
  handleFilesChange: (files: FileItem[]) => void;
  handleFileUpload: (fileList: FileList) => void;
  handleFileDownload: (file: FileItem) => void;
  handleFilePreview: (file: FileItem) => void;
  handleFileDelete: (file: FileItem) => void;
  
  // Loading states
  loading: boolean;
}

interface UseDocumentDialogProps {
  onRefresh?: () => void;
}

export const useDocumentDialog = ({ onRefresh }: UseDocumentDialogProps = {}): UseDocumentDialogReturn => {
  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingDocument, setEditingDocument] = useState<DocumentType | undefined>();

  // Document operations
  const {
    handleEditDocument,
    handleViewDocument,
    handleUploadDocument,
    loading: operationsLoading,
  } = useDocumentOperations({
    onEdit: (document, mode) => {
      setEditingDocument(document);
      setDialogMode(mode);
      setIsOpen(true);
    },
    onView: (document, mode) => {
      setEditingDocument(document);
      setDialogMode(mode);
      setIsOpen(true);
    },
    onUpload: (document, mode) => {
      setEditingDocument(document);
      setDialogMode(mode);
      setIsOpen(true);
    },
    onRefresh,
  });

  // File operations
  const {
    attachedFiles,
    handleFileUpload,
    handleFileDownload,
    handleFilePreview,
    handleFileDelete,
    setAttachedFiles,
  } = useDocumentFiles({
    editingDocument,
    dialogMode,
  });

  // Dialog handlers
  const handleCreate = useCallback(() => {
    setDialogMode("create");
    setEditingDocument(undefined);
    setIsOpen(true);
  }, []);

  const handleEdit = useCallback((document: DocumentType) => {
    handleEditDocument(document);
  }, [handleEditDocument]);

  const handleView = useCallback((document: DocumentType) => {
    handleViewDocument(document);
  }, [handleViewDocument]);

  const handleUpload = useCallback((document: DocumentType) => {
    handleUploadDocument(document);
  }, [handleUploadDocument]);

  const handleDialogChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const handleSuccess = useCallback(() => {
    setEditingDocument(undefined);
    onRefresh?.();
  }, [onRefresh]);

  const handleCancel = useCallback(() => {
    setEditingDocument(undefined);
    setAttachedFiles([]);
  }, [setAttachedFiles]);

  const handleModeChange = useCallback((mode: DialogMode) => {
    setDialogMode(mode);
  }, []);

  const handleFilesChange = useCallback((files: FileItem[]) => {
    setAttachedFiles(files);
  }, [setAttachedFiles]);

  return {
    // Dialog state
    isOpen,
    dialogMode,
    editingDocument,
    
    // File operations
    attachedFiles,
    
    // Dialog handlers
    handleCreate,
    handleEdit,
    handleView,
    handleUpload,
    handleDialogChange,
    handleSuccess,
    handleCancel,
    handleModeChange,
    
    // File handlers
    handleFilesChange,
    handleFileUpload,
    handleFileDownload,
    handleFilePreview,
    handleFileDelete,
    
    // Loading states
    loading: operationsLoading,
  };
};