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
      console.error("Error loading document data:", error);
      toast.error("Có lỗi khi tải thông tin hồ sơ");
    }
  }, [getDocumentWithPopulatedParties]);

  // Load document data when in edit/view mode
  useEffect(() => {
    console.log('🔄 Document Form: Load data effect triggered', { 
      editingDocument: !!editingDocument, 
      dialogMode,
      loadDocumentDataRef: loadDocumentData.toString().substring(0, 50) + '...'
    });
    
    if (editingDocument && (dialogMode === "edit" || dialogMode === "view")) {
      loadDocumentData(editingDocument);
    }
  }, [editingDocument, dialogMode, loadDocumentData]);

  // Reset form to defaults when in create mode or no editing document
  useEffect(() => {
    console.log('🔄 Document Form: Reset form effect triggered', { 
      editingDocument: !!editingDocument, 
      dialogMode,
      defaultValuesRef: Object.keys(defaultValues).join(',')
    });
    
    if (!editingDocument || (dialogMode !== "edit" && dialogMode !== "view")) {
      console.log('🔄 Document Form: Resetting form to defaults');
      methods.reset(defaultValues);
    }
  }, [editingDocument, dialogMode, defaultValues]);

  const handleSubmit = useCallback(async (data: FileFormData) => {
    console.log('🚀 Document form submitted with data:', data);
    console.log('🔍 Parties data:', {
      A: data.parties.A.length,
      B: data.parties.B.length,
      C: data.parties.C.length,
      AData: data.parties.A,
      BData: data.parties.B
    });
    
    // Debug each customer in the parties
    console.log('🧪 Debugging individual customers:');
    data.parties.A.forEach((customer, idx) => {
      console.log(`🧪 Party A Customer ${idx}:`, {
        id: customer.id,
        fullName: customer.fullName,
        type: customer.type,
        documentId: customer.documentId,
        passportId: customer.passportId,
        hasDocumentId: !!customer.documentId,
        hasPassportId: !!customer.passportId
      });
    });
    data.parties.B.forEach((customer, idx) => {
      console.log(`🧪 Party B Customer ${idx}:`, {
        id: customer.id,
        fullName: customer.fullName,
        type: customer.type,
        documentId: customer.documentId,
        passportId: customer.passportId,
        hasDocumentId: !!customer.documentId,
        hasPassportId: !!customer.passportId
      });
    });
    
    try {
      // Validate parties data manually to see detailed errors
      console.log('🔍 Manual parties validation...');
      const partiesValidation = fileSchema.shape.parties.safeParse(data.parties);
      if (!partiesValidation.success) {
        console.error('❌ Parties validation failed:', partiesValidation.error.errors);
        console.error('❌ Detailed validation errors:', partiesValidation.error.format());
        throw new Error(`Validation failed: ${partiesValidation.error.errors.map(e => e.message).join(', ')}`);
      }
      console.log('✅ Parties validation passed');
      
      console.log('✅ Form validation passed, preparing document data...');
      
      // Prepare document data
      const documentData = DocumentFormService.prepareDocumentData(data);
      console.log('📄 Prepared document data:', documentData);

      if (editingDocument) {
        // Update existing document
        console.log('🔄 Updating existing document:', editingDocument.id);
        console.log('🔄 Update data being sent:', documentData);
        const updateData = { ...documentData, id: editingDocument.id };
        console.log('🔄 Final update data with ID:', updateData);
        
        try {
          console.log('🚀 About to call updateDocument API...');
          const updatedDocument = await updateDocument(editingDocument.id, updateData);
          console.log('✅ updateDocument returned:', updatedDocument);
          console.log('✅ Type of returned value:', typeof updatedDocument);
          console.log('✅ Is truthy?', !!updatedDocument);
          
          if (updatedDocument) {
            toast.success("Hồ sơ đã được cập nhật thành công!");
            onSuccess?.();
          } else {
            console.warn('⚠️ updateDocument returned falsy value, but no error was thrown');
            toast.warning("Cập nhật có thể không thành công - vui lòng kiểm tra lại");
          }
        } catch (updateError) {
          console.error('❌ Error in updateDocument call:', updateError);
          throw updateError; // Re-throw to be caught by outer try/catch
        }
      } else {
        // Create new document
        console.log('➕ Creating new document...');
        const newDocument = await createDocument(documentData);
        console.log('✅ Document created:', newDocument);
        if (newDocument) {
          toast.success("Hồ sơ đã được tạo thành công!");
          onSuccess?.();
        }
      }

    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
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