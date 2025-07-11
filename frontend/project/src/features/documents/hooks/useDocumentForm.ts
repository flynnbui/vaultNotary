import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

import { fileSchema } from '@/src/lib/schemas';
import { FileFormData, DocumentType, DocumentWithPopulatedParties } from '../types/document.types';
import { DocumentFormService } from '../services/documentFormService';
import useDocumentApiService from '../services/documentApiService';

interface UseDocumentFormProps {
  editingDocument?: DocumentType | DocumentWithPopulatedParties;
  dialogMode: 'create' | 'edit' | 'view' | 'upload';
  onSuccess?: () => void;
}

export const useDocumentForm = ({ 
  editingDocument, 
  dialogMode, 
  onSuccess 
}: UseDocumentFormProps) => {
  const { createDocument, updateDocument, getDocumentWithPopulatedParties } = useDocumentApiService();
  
  const methods: UseFormReturn<FileFormData> = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues: DocumentFormService.getDefaultFormValues(),
  });

  // Reset form when editing document changes
  useEffect(() => {
    if (editingDocument && (dialogMode === "edit" || dialogMode === "view")) {
      loadDocumentData(editingDocument);
    } else {
      methods.reset(DocumentFormService.getDefaultFormValues());
    }
  }, [editingDocument, dialogMode, methods]);

  const loadDocumentData = useCallback(async (document: DocumentType | DocumentWithPopulatedParties) => {
    try {
      // If document doesn't have populated parties, fetch them
      let documentWithParties = document;
      if (!('partyDocumentLinks' in document) || !document.partyDocumentLinks) {
        const fetchedDocument = await getDocumentWithPopulatedParties(document.id);
        if (!fetchedDocument) {
          throw new Error('Không thể tải thông tin hồ sơ');
        }
        documentWithParties = fetchedDocument;
      }

      const formData = DocumentFormService.prepareFormDataForEdit(documentWithParties);
      methods.reset(formData);

      // Force update parties after a short delay to ensure form is ready
      setTimeout(() => {
        methods.setValue("parties.A", formData.parties.A, { shouldValidate: true });
        methods.setValue("parties.B", formData.parties.B, { shouldValidate: true });
        methods.setValue("parties.C", formData.parties.C, { shouldValidate: true });
      }, 200);

    } catch (error) {
      console.error("Error loading document data:", error);
      toast.error("Có lỗi khi tải thông tin hồ sơ");
    }
  }, [getDocumentWithPopulatedParties, methods]);

  const handleSubmit = useCallback(async (data: FileFormData) => {
    try {
      // Validate form data
      const validation = DocumentFormService.validateFormData(data);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      // Prepare document data
      const documentData = DocumentFormService.prepareDocumentData(data);

      if (editingDocument) {
        // Update existing document
        const updateData = { ...documentData, id: editingDocument.id };
        const updatedDocument = await updateDocument(editingDocument.id, updateData);
        if (updatedDocument) {
          toast.success("Hồ sơ đã được cập nhật thành công!");
          onSuccess?.();
        }
      } else {
        // Create new document
        const newDocument = await createDocument(documentData);
        if (newDocument) {
          toast.success("Hồ sơ đã được tạo thành công!");
          onSuccess?.();
        }
      }

    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại.");
    }
  }, [editingDocument, createDocument, updateDocument, onSuccess]);

  const resetForm = useCallback(() => {
    methods.reset(DocumentFormService.getDefaultFormValues());
  }, [methods]);

  return {
    methods,
    handleSubmit: methods.handleSubmit(handleSubmit),
    resetForm,
    isSubmitting: methods.formState.isSubmitting,
    errors: methods.formState.errors
  };
};