import { useCallback } from "react";
import useApiWithLoading from "@/src/hooks/useApiWithLoading";
import { PaginatedResponse } from "@/src/types/pagination.type";
import { DocumentWithPopulatedParties, PopulatedPartyDocumentLinkType } from "@/src/types/document.type";
import useCustomerApiService from "@/src/features/customers/services/customerApiService";
import { 
  DocumentDto,
  DocumentWithFilesDto,
  DocumentFileDto,
  CreateDocumentDto,
  UpdateDocumentDto,
  PagedResultDto
} from '@/src/types/api.types';
import { ErrorHandler } from '@/src/shared/utils/errorHandler';


// Note: Party validation is now handled by the form schema validation
// This function is kept for backward compatibility but should not be used for new code

/**
 * Document API service with proper typing
 */
const useDocumentApiService = () => {
  const { loading, callApi } = useApiWithLoading();
  const { getCustomerById } = useCustomerApiService();

  const getPaginatedDocuments = useCallback(
    async (
      pageNumber = 1,
      pageSize = 10,
      searchTerm?: string
    ): Promise<PagedResultDto<DocumentDto> | undefined> => {
      try {
        const params = new URLSearchParams({
          pageNumber: pageNumber.toString(),
          pageSize: pageSize.toString(),
          ...(searchTerm && { searchTerm })
        });
        
        const response = await callApi<PagedResultDto<DocumentDto>>(
          "get",
          `/Documents/paginated?${params.toString()}`
        );
        return response?.data;
      } catch (error) {
        ErrorHandler.handleDocumentError(error, "fetch paginated documents");
        throw error;
      }
    },
    [callApi]
  );

  const createDocument = useCallback(
    async (documentData: CreateDocumentDto): Promise<DocumentDto | undefined> => {
      try {
        const response = await callApi<DocumentDto>("post", "/Documents", documentData);
        return response?.data;
      } catch (error) {
        ErrorHandler.handleDocumentError(error, "create document");
        throw error;
      }
    },
    [callApi]
  );

  const updateDocument = useCallback(
    async (
      id: string,
      documentData: UpdateDocumentDto
    ): Promise<DocumentDto | undefined> => {
      try {
        
        const response = await callApi<DocumentDto>("put", `/Documents/${id}`, documentData);
        
        // For update operations, the API returns 204 No Content on success
        // Return undefined for 204 status as the document was updated successfully
        if (response?.status === 204) {
          return undefined;
        }
        
        return response?.data;
      } catch (error) {
        ErrorHandler.handleDocumentError(error, "update document");
        throw error;
      }
    },
    [callApi]
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await callApi("delete", `/Documents/${id}`);
        return true;
      } catch (error) {
        ErrorHandler.handleDocumentError(error, "delete document");
        throw error;
      }
    },
    [callApi]
  );

  const getDocumentById = useCallback(
    async (id: string): Promise<DocumentWithFilesDto | undefined> => {
      try {
        const response = await callApi<DocumentWithFilesDto>("get", `/Documents/${id}`);
        return response?.data;
      } catch (error) {
        ErrorHandler.handleDocumentError(error, "fetch document by ID");
        throw error;
      }
    },
    [callApi]
  );

  const getDocumentFiles = useCallback(
    async (documentId: string): Promise<DocumentFileDto[]> => {
      try {
        const response = await callApi<DocumentFileDto[]>("get", `/Documents/${documentId}/files`);
        return response?.data || [];
      } catch (error) {
        ErrorHandler.handleFileError(error, "fetch document files");
        return [];
      }
    },
    [callApi]
  );

  const getDocumentParties = useCallback(
    async (documentId: string): Promise<any[]> => {
      try {
        const response = await callApi<any[]>("get", `/search/party-links/document/${documentId}`);
        return response?.data || [];
      } catch (error) {
        ErrorHandler.handleDocumentError(error, "fetch document parties");
        return [];
      }
    },
    [callApi]
  );

  const deleteDocumentFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      try {
        await callApi("delete", `/Files/${fileId}`);
        return true;
      } catch (error) {
        ErrorHandler.handleFileError(error, "delete file");
        throw error;
      }
    },
    [callApi]
  );

  const getFileDownloadUrl = useCallback(
    (fileId: string): string => {
      return `/api/Download/${fileId}`;
    },
    [callApi]
  );

  const getFilePresignedUrl = useCallback(
    async (fileId: string, expirationHours: number = 24): Promise<string> => {
      try {
        const response = await callApi<{url: string}>("get", `/Download/${fileId}/presigned?expirationHours=${expirationHours}`);
        
        const presignedData = response?.data;
        
        if (presignedData?.url) {
          return presignedData.url;
        } else {
          console.warn("⚠️ No URL in presigned response");
          return "";
        }
      } catch (error) {
        ErrorHandler.handleFileError(error, "get presigned URL");
        throw error;
      }
    },
    [callApi]
  );

  const searchDocuments = useCallback(
    async (
      searchTerm: string,
      pageNumber = 1,
      pageSize = 10
    ): Promise<PagedResultDto<DocumentDto> | undefined> => {
      try {
        const response = await callApi<PagedResultDto<DocumentDto>>(
          "get",
          `/Documents/search?searchTerm=${encodeURIComponent(searchTerm)}&pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        ErrorHandler.handleDocumentError(error, "search documents");
        throw error;
      }
    },
    [callApi]
  );

  const getDocumentWithPopulatedParties = useCallback(
    async (id: string): Promise<DocumentWithPopulatedParties | undefined> => {
      try {
        const documentWithFiles = await getDocumentById(id);
        
        if (!documentWithFiles) {
          return undefined;
        }

        if (!documentWithFiles.partyDocumentLinks || documentWithFiles.partyDocumentLinks.length === 0) {
          const documentWithPopulatedParties: DocumentWithPopulatedParties = {
            id: documentWithFiles.id,
            createdDate: documentWithFiles.createdDate,
            secretary: documentWithFiles.secretary,
            notaryPublic: documentWithFiles.notaryPublic,
            transactionCode: documentWithFiles.transactionCode,
            description: documentWithFiles.description,
            documentType: documentWithFiles.documentType,
            createdAt: documentWithFiles.createdAt,
            updatedAt: documentWithFiles.updatedAt,
            partyDocumentLinks: []
          };
          return documentWithPopulatedParties;
        }

        
        const populatedParties = await Promise.all(
          documentWithFiles.partyDocumentLinks.map(async (partyLink): Promise<PopulatedPartyDocumentLinkType> => {
            try {
              const customer = await getCustomerById(partyLink.customerId);
              if (!customer) {
                console.warn("⚠️ Customer not found for ID:", partyLink.customerId);
                throw new Error(`Customer not found: ${partyLink.customerId}`);
              }
              return {
                ...partyLink,
                customer
              };
            } catch (error) {
              throw error;
            }
          })
        );

        
        const finalDocument: DocumentWithPopulatedParties = {
          id: documentWithFiles.id,
          createdDate: documentWithFiles.createdDate,
          secretary: documentWithFiles.secretary,
          notaryPublic: documentWithFiles.notaryPublic,
          transactionCode: documentWithFiles.transactionCode,
          description: documentWithFiles.description,
          documentType: documentWithFiles.documentType,
          createdAt: documentWithFiles.createdAt,
          updatedAt: documentWithFiles.updatedAt,
          partyDocumentLinks: populatedParties
        };
        
        return finalDocument;
      } catch (error) {
        ErrorHandler.handleDocumentError(error, "fetch document with populated parties");
        throw error;
      }
    },
    [getDocumentById, getCustomerById, callApi]
  );

  const getOptimizedDocumentData = useCallback(
    async (id: string, options: { includeFiles?: boolean; includeParties?: boolean } = {}) => {
      try {
        const { includeFiles = false, includeParties = false } = options;
        
        // Start with basic document info
        const document = await getDocumentById(id);
        if (!document) return null;

        const result = {
          document,
          files: [] as DocumentFileDto[],
          parties: [] as any[]
        };

        // Load additional data only if requested
        const requests = [];
        
        if (includeFiles) {
          requests.push(
            getDocumentFiles(id).then(files => { result.files = files; })
          );
        }
        
        if (includeParties) {
          requests.push(
            getDocumentParties(id).then(parties => { result.parties = parties; })
          );
        }

        // Execute all requests in parallel
        await Promise.all(requests);
        
        return result;
      } catch (error) {
        ErrorHandler.handleDocumentError(error, "fetch optimized document data");
        throw error;
      }
    },
    [getDocumentById, getDocumentFiles, getDocumentParties, callApi]
  );

  return {
    loading,
    getPaginatedDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
    getDocumentWithPopulatedParties,
    getOptimizedDocumentData,
    getDocumentFiles,
    getDocumentParties,
    deleteDocumentFile,
    getFileDownloadUrl,
    getFilePresignedUrl,
    searchDocuments,
  };
};

export default useDocumentApiService;