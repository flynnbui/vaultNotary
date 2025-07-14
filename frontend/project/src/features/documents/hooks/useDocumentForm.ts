import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import { fileSchema } from '@/src/lib/schemas';
import { FileFormData, DocumentType, DocumentWithPopulatedParties } from '../types/document.types';
import { DocumentFormService } from '../services/documentFormService';
import { useDocumentWithParties } from './useDocumentQueries';
import { useCreateDocument, useUpdateDocument } from './useDocumentMutations';

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
  // React Query hooks for data fetching and mutations
  const createDocumentMutation = useCreateDocument();
  const updateDocumentMutation = useUpdateDocument();
  
  // Fetch document with parties using React Query (only when needed)
  const { data: fetchedDocument } = useDocumentWithParties(editingDocument?.id || '');
  
  // Memoize default values to prevent infinite re-renders
  const defaultValues = useMemo(() => DocumentFormService.getDefaultFormValues(), []);
  
  const methods: UseFormReturn<FileFormData> = useForm<FileFormData>({
    resolver: zodResolver(fileSchema),
    defaultValues,
  });

  // Load document data when in edit/view mode
  useEffect(() => {
    if (editingDocument && (dialogMode === "edit" || dialogMode === "view")) {
      // Use already populated document if available, otherwise use fetched document
      const documentToUse = ('partyDocumentLinks' in editingDocument && editingDocument.partyDocumentLinks) 
        ? editingDocument 
        : fetchedDocument;
      
      if (documentToUse) {
        const formData = DocumentFormService.prepareFormDataForEdit(documentToUse);
        methods.reset(formData);
      }
    }
  }, [editingDocument, dialogMode, fetchedDocument, methods]);

  // Reset form to defaults when in create mode or no editing document
  useEffect(() => {
    if (!editingDocument || (dialogMode !== "edit" && dialogMode !== "view")) {
      methods.reset(defaultValues);
    }
  }, [editingDocument, dialogMode, defaultValues, methods]);

  const handleSubmit = useCallback(async (data: FileFormData) => {
    try {
      // Validate parties data manually to see detailed errors
      const partiesValidation = fileSchema.shape.parties.safeParse(data.parties);
      if (!partiesValidation.success) {
        throw new Error(`Validation failed: ${partiesValidation.error.errors.map(e => e.message).join(', ')}`);
      }
      
      // Prepare document data
      const documentData = DocumentFormService.prepareDocumentData(data);

      if (editingDocument) {
        // Update existing document using React Query mutation
        const updateData = { ...documentData, id: editingDocument.id };
        
        await updateDocumentMutation.mutateAsync(
          { id: editingDocument.id, documentData: updateData },
          {
            onSuccess: () => {
              toast.success("Hồ sơ đã được cập nhật thành công!");
              onSuccess?.();
            },
            onError: (error) => {
              toast.error(`Có lỗi xảy ra khi cập nhật hồ sơ: ${error.message}`);
            }
          }
        );
      } else {
        // Create new document using React Query mutation
        await createDocumentMutation.mutateAsync(documentData, {
          onSuccess: () => {
            toast.success("Hồ sơ đã được tạo thành công!");
            onSuccess?.();
          },
          onError: (error) => {
            toast.error(`Có lỗi xảy ra khi tạo hồ sơ: ${error.message}`);
          }
        });
      }

    } catch (error) {
      toast.error((error instanceof Error && error.message) ? `Có lỗi xảy ra khi lưu hồ sơ: ${error.message}` : "Có lỗi xảy ra khi lưu hồ sơ");
    }
  }, [editingDocument, createDocumentMutation, updateDocumentMutation, onSuccess]);

  const resetForm = useCallback(() => {
    methods.reset(defaultValues);
  }, [defaultValues]);

  return {
    methods,
    handleSubmit: methods.handleSubmit(handleSubmit),
    resetForm,
    isSubmitting: methods.formState.isSubmitting || createDocumentMutation.isPending || updateDocumentMutation.isPending,
    errors: methods.formState.errors
  };
};