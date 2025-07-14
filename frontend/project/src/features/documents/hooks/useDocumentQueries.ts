import { useQuery, useQueryClient } from '@tanstack/react-query';
import useDocumentApiService from '../services/documentApiService';
import { DocumentWithPopulatedParties, DocumentWithFilesDto } from '@/src/types/document.type';
import { CustomerDto } from '@/src/types/api.types';

// Query key factory for consistent cache keys
export const documentQueryKeys = {
  all: ['documents'] as const,
  lists: () => [...documentQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...documentQueryKeys.lists(), filters] as const,
  details: () => [...documentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentQueryKeys.details(), id] as const,
  detailWithParties: (id: string) => [...documentQueryKeys.details(), id, { include: 'parties' }] as const,
  detailWithFiles: (id: string) => [...documentQueryKeys.details(), id, { include: 'files' }] as const,
  detailFull: (id: string) => [...documentQueryKeys.details(), id, { include: 'parties,files' }] as const,
  search: (term: string) => [...documentQueryKeys.all, 'search', term] as const,
};

// Customer query keys for cache seeding
export const customerQueryKeys = {
  all: ['customers'] as const,
  detail: (id: string) => [...customerQueryKeys.all, id] as const,
};

/**
 * Hook to fetch documents with pagination
 */
export const useDocuments = (pageNumber = 1, pageSize = 10) => {
  const { getPaginatedDocuments } = useDocumentApiService();
  
  return useQuery({
    queryKey: documentQueryKeys.list({ pageNumber, pageSize }),
    queryFn: () => getPaginatedDocuments(pageNumber, pageSize),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to fetch a single document by ID
 */
export const useDocument = (id: string) => {
  const { getDocumentById } = useDocumentApiService();
  
  return useQuery({
    queryKey: documentQueryKeys.detail(id),
    queryFn: () => getDocumentById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch document with populated parties - optimized with cache seeding
 */
export const useDocumentWithParties = (id: string) => {
  const { getDocumentWithParties } = useDocumentApiService();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: documentQueryKeys.detailWithParties(id),
    queryFn: () => getDocumentWithParties(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data: DocumentWithPopulatedParties | undefined) => {
      // Cache seeding: populate individual customer caches
      if (data?.partyDocumentLinks) {
        data.partyDocumentLinks.forEach((partyLink) => {
          if (partyLink.customer) {
            // Seed the customer cache with the customer data
            queryClient.setQueryData(
              customerQueryKeys.detail(partyLink.customerId),
              partyLink.customer
            );
          }
        });
      }
    },
  });
};

/**
 * Hook to fetch document with files
 */
export const useDocumentWithFiles = (id: string) => {
  const { getDocumentWithFiles } = useDocumentApiService();
  
  return useQuery({
    queryKey: documentQueryKeys.detailWithFiles(id),
    queryFn: () => getDocumentWithFiles(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch document with both parties and files - optimized with cache seeding
 */
export const useDocumentFull = (id: string) => {
  const { getDocumentFull } = useDocumentApiService();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: documentQueryKeys.detailFull(id),
    queryFn: () => getDocumentFull(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data: DocumentWithPopulatedParties | undefined) => {
      // Cache seeding: populate individual customer caches
      if (data?.partyDocumentLinks) {
        data.partyDocumentLinks.forEach((partyLink) => {
          if (partyLink.customer) {
            // Seed the customer cache with the customer data
            queryClient.setQueryData(
              customerQueryKeys.detail(partyLink.customerId),
              partyLink.customer
            );
          }
        });
      }
    },
  });
};

/**
 * Hook to search documents
 */
export const useDocumentSearch = (searchTerm: string, pageNumber = 1, pageSize = 10) => {
  const { searchDocuments } = useDocumentApiService();
  
  return useQuery({
    queryKey: documentQueryKeys.search(searchTerm + `_${pageNumber}_${pageSize}`),
    queryFn: () => searchDocuments(searchTerm, pageNumber, pageSize),
    enabled: !!searchTerm && searchTerm.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to get document files
 */
export const useDocumentFiles = (documentId: string) => {
  const { getDocumentFiles } = useDocumentApiService();
  
  return useQuery({
    queryKey: [...documentQueryKeys.detail(documentId), 'files'],
    queryFn: () => getDocumentFiles(documentId),
    enabled: !!documentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};