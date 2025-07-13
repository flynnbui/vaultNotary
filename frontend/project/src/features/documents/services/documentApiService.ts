import { useCallback } from "react";
import useApi from "@/src/services/useApi";
import { PaginatedResponse } from "@/src/types/pagination.type";
import { DocumentWithPopulatedParties, PopulatedPartyDocumentLinkType } from "@/src/types/document.type";
import useCustomerService from "@/src/services/useCustomerService";
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
  const { callApi, loading } = useApi();
  const { getCustomerById } = useCustomerService();

  const getPaginatedDocuments = useCallback(
    async (
      pageNumber = 1,
      pageSize = 10
    ): Promise<PagedResultDto<DocumentDto> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `/Documents/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`
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
        const response = await callApi("post", "/Documents", documentData as unknown as Record<string, unknown>);
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
        
        const response = await callApi("put", `/Documents/${id}`, documentData as unknown as Record<string, unknown>);
        
        // For update operations, the API returns 204 No Content on success
        // Return the updated document data or a success indicator
        if (response?.status === 204) {
          return { ...documentData, id } as DocumentDto;
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
        const response = await callApi("get", `/Documents/${id}`);
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
        const documentWithFiles = await getDocumentById(documentId);
        
        const files = documentWithFiles?.files || [];
        
        return files;
      } catch (error) {
        ErrorHandler.handleFileError(error, "fetch document files");
        return [];
      }
    },
    [getDocumentById]
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
    []
  );

  const getFilePresignedUrl = useCallback(
    async (fileId: string, expirationHours: number = 24): Promise<string> => {
      try {
        const response = await callApi("get", `/Download/${fileId}/presigned?expirationHours=${expirationHours}`);
        
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
        const response = await callApi(
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
    [getDocumentById, getCustomerById]
  );

  return {
    loading,
    getPaginatedDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
    getDocumentWithPopulatedParties,
    getDocumentFiles,
    deleteDocumentFile,
    getFileDownloadUrl,
    getFilePresignedUrl,
    searchDocuments,
  };
};

export default useDocumentApiService;