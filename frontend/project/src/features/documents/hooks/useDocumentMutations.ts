import { useMutation, useQueryClient } from '@tanstack/react-query';
import useDocumentApiService from '../services/documentApiService';
import { documentQueryKeys } from './useDocumentQueries';
import { DocumentDto, CreateDocumentDto, UpdateDocumentDto } from '@/src/types/api.types';

/**
 * Hook to create a new document with optimistic updates
 */
export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  const { createDocument } = useDocumentApiService();

  return useMutation({
    mutationFn: (documentData: CreateDocumentDto) => createDocument(documentData),
    onMutate: async (newDocument) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: documentQueryKeys.lists() });

      // Snapshot the previous value
      const previousDocuments = queryClient.getQueryData(documentQueryKeys.lists());

      // Note: We can't optimistically update the list without knowing the ID
      // So we'll just invalidate the list queries after success

      return { previousDocuments };
    },
    onError: (err, newDocument, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousDocuments) {
        queryClient.setQueryData(documentQueryKeys.lists(), context.previousDocuments);
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch document lists
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
      
      // Set the created document in the detail cache
      if (data?.id) {
        queryClient.setQueryData(documentQueryKeys.detail(data.id), data);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
    },
  });
};

/**
 * Hook to update a document with optimistic updates
 */
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  const { updateDocument } = useDocumentApiService();

  return useMutation({
    mutationFn: ({ id, documentData }: { id: string; documentData: UpdateDocumentDto }) => 
      updateDocument(id, documentData),
    onMutate: async ({ id, documentData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: documentQueryKeys.detail(id) });

      // Snapshot the previous value
      const previousDocument = queryClient.getQueryData<DocumentDto>(documentQueryKeys.detail(id));

      // Optimistically update to the new value
      if (previousDocument) {
        queryClient.setQueryData(documentQueryKeys.detail(id), {
          ...previousDocument,
          ...documentData,
        });
      }

      return { previousDocument };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousDocument) {
        queryClient.setQueryData(documentQueryKeys.detail(id), context.previousDocument);
      }
    },
    onSuccess: (data, { id }) => {
      // Update the document detail cache with the response
      if (data) {
        queryClient.setQueryData(documentQueryKeys.detail(id), data);
      }
      
      // Invalidate document lists to show updated data
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
      
      // Invalidate all variations of this document (with parties, files, etc.)
      queryClient.invalidateQueries({ 
        queryKey: documentQueryKeys.details(),
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey.includes(id);
        }
      });
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.detail(id) });
    },
  });
};

/**
 * Hook to delete a document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { deleteDocument } = useDocumentApiService();

  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: documentQueryKeys.detail(id) });

      // Snapshot the previous value
      const previousDocument = queryClient.getQueryData(documentQueryKeys.detail(id));

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: documentQueryKeys.detail(id) });

      return { previousDocument };
    },
    onError: (err, id, context) => {
      // If the mutation fails, restore the document
      if (context?.previousDocument) {
        queryClient.setQueryData(documentQueryKeys.detail(id), context.previousDocument);
      }
    },
    onSuccess: (data, id) => {
      // Remove all variations of this document from cache
      queryClient.removeQueries({ 
        queryKey: documentQueryKeys.details(),
        predicate: (query) => {
          const queryKey = query.queryKey;
          return queryKey.includes(id);
        }
      });
      
      // Invalidate document lists
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
    },
    onSettled: (data, error, id) => {
      // Always refetch lists after error or success
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.lists() });
    },
  });
};

/**
 * Hook to delete a document file
 */
export const useDeleteDocumentFile = () => {
  const queryClient = useQueryClient();
  const { deleteDocumentFile } = useDocumentApiService();

  return useMutation({
    mutationFn: (fileId: string) => deleteDocumentFile(fileId),
    onSuccess: (data, fileId) => {
      // Invalidate all document queries to refresh file lists
      queryClient.invalidateQueries({ queryKey: documentQueryKeys.all });
    },
  });
};