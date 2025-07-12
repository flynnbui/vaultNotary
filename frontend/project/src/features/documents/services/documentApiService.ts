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
        console.log('🚀 updateDocument API call starting...');
        console.log('🚀 Document ID:', id);
        console.log('🚀 Document data to send:', documentData);
        console.log('🚀 Making PUT request to:', `/Documents/${id}`);
        
        const response = await callApi("put", `/Documents/${id}`, documentData as unknown as Record<string, unknown>);
        
        console.log('✅ API response received:', response);
        console.log('✅ Response data:', response?.data);
        console.log('✅ Response status:', response?.status);
        
        return response?.data;
      } catch (error) {
        console.error('❌ Error in updateDocument API call:', error);
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
        console.log("🔍 Getting document by ID:", id);
        const response = await callApi("get", `/Documents/${id}`);
        console.log("✅ Document response:", response?.data);
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
        console.log("🔍 Getting files for document:", documentId);
        const documentWithFiles = await getDocumentById(documentId);
        
        const files = documentWithFiles?.files || [];
        console.log("✅ Found files:", files);
        
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
        console.log(`🔄 Getting presigned URL for file: ${fileId}`);
        const response = await callApi("get", `/Download/${fileId}/presigned?expirationHours=${expirationHours}`);
        
        const presignedData = response?.data;
        console.log("✅ Presigned response:", presignedData);
        
        if (presignedData?.url) {
          console.log("✅ Got presigned URL:", presignedData.url);
          console.log("⏰ Expires at:", presignedData.expiresAt);
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
        console.log("🔍 Getting document with populated parties:", id);
        const documentWithFiles = await getDocumentById(id);
        
        if (!documentWithFiles) {
          console.log("❌ Document not found");
          return undefined;
        }

        if (!documentWithFiles.partyDocumentLinks || documentWithFiles.partyDocumentLinks.length === 0) {
          console.log("✅ Document has no parties to populate");
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

        console.log("🔄 Fetching customer details for", documentWithFiles.partyDocumentLinks.length, "parties");
        
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
              console.error("❌ Error fetching customer:", partyLink.customerId, error);
              throw error;
            }
          })
        );

        console.log("✅ Successfully populated", populatedParties.length, "parties");
        
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