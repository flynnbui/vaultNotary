import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo } from 'react';
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
  
  // Memoize default values to prevent infinite re-renders
  const defaultValues = useMemo(() => DocumentFormService.getDefaultFormValues(), []);
  
  const methods: UseFormReturn<FileFormData> = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues,
  });

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
      
      // Reset form with all data including parties
      methods.reset(formData);

    } catch (error) {
      toast.error("Có lỗi khi tải thông tin hồ sơ");
    }
  }, [getDocumentWithPopulatedParties]);

  // Load document data when in edit/view mode
  useEffect(() => {
    
    if (editingDocument && (dialogMode === "edit" || dialogMode === "view")) {
      loadDocumentData(editingDocument);
    }
  }, [editingDocument, dialogMode, loadDocumentData]);

  // Reset form to defaults when in create mode or no editing document
  useEffect(() => {
    
    if (!editingDocument || (dialogMode !== "edit" && dialogMode !== "view")) {
      methods.reset(defaultValues);
    }
  }, [editingDocument, dialogMode, defaultValues]);

  const handleSubmit = useCallback(async (data: FileFormData) => {
    
    // Debug each customer in the parties
    data.parties.A.forEach((customer, idx) => {
    });
    data.parties.B.forEach((customer, idx) => {
    });
    
    try {
      // Validate parties data manually to see detailed errors
      const partiesValidation = fileSchema.shape.parties.safeParse(data.parties);
      if (!partiesValidation.success) {
        throw new Error(`Validation failed: ${partiesValidation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      
      // Prepare document data
      const documentData = DocumentFormService.prepareDocumentData(data);

      if (editingDocument) {
        // Update existing document
        const updateData = { ...documentData, id: editingDocument.id };
        
        try {
          const updatedDocument = await updateDocument(editingDocument.id, updateData);
          if (updatedDocument) {
            toast.success("Hồ sơ đã được cập nhật thành công!");
            onSuccess?.();
          } else {
            toast.warning("Cập nhật có thể không thành công - vui lòng kiểm tra lại");
          }
        } catch (updateError) {
          throw updateError;
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
      toast.error((error instanceof Error && error.message) ? `Có lỗi xảy ra khi lưu hồ sơ: ${error.message}` : "Có lỗi xảy ra khi lưu hồ sơ");
    }
  }, [editingDocument, createDocument, updateDocument, onSuccess]);

  const resetForm = useCallback(() => {
    methods.reset(defaultValues);
  }, [defaultValues]);

  return {
    methods,
    handleSubmit: methods.handleSubmit(handleSubmit),
    resetForm,
    isSubmitting: methods.formState.isSubmitting,
    errors: methods.formState.errors
  };
};