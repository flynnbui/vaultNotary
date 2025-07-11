/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import useApi from "./useApi";
import { PaginatedResponse } from "../types/pagination.type";
import { DocumentType } from "../types/document.type";

interface CreateDocumentData {
  createdDate: string;
  secretary: string;
  notaryPublic: string;
  transactionCode: string;
  description: string;
  documentType: string;
}

interface UpdateDocumentData extends Partial<CreateDocumentData> {}

// Interface cho file từ API response
export interface DocumentFileFromApi {
  id: string;
  documentId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  s3Bucket: string;
  createdAt: string;
  updatedAt: string;
}

// Interface cho document với files
export interface DocumentWithFiles extends DocumentType {
  files: DocumentFileFromApi[];
}

const useDocumentService = () => {
  const { callApi, loading } = useApi();

  const getPaginatedDocuments = useCallback(
    async (
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<DocumentType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `/Documents/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  const createDocument = useCallback(
    async (documentData: CreateDocumentData): Promise<DocumentType | undefined> => {
      try {
        const response = await callApi("post", "/Documents", documentData);
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tạo tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  const updateDocument = useCallback(
    async (
      id: string,
      documentData: UpdateDocumentData
    ): Promise<DocumentType | undefined> => {
      try {
        const response = await callApi("put", `/Documents/${id}`, documentData);
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi cập nhật tài liệu:", error);
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
        console.error("Lỗi khi xóa tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  const getDocumentById = useCallback(
    async (id: string): Promise<DocumentWithFiles | undefined> => {
      try {
        console.log("🔍 Getting document by ID:", id);
        const response = await callApi("get", `/Documents/${id}`);
        console.log("✅ Document response:", response?.data);
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  // 🆕 NEW: Get files for a document using existing getDocumentById
  const getDocumentFiles = useCallback(
    async (documentId: string): Promise<DocumentFileFromApi[]> => {
      try {
        console.log("🔍 Getting files for document:", documentId);
        const documentWithFiles = await getDocumentById(documentId);
        
        const files = documentWithFiles?.files || [];
        console.log("✅ Found files:", files);
        
        return files;
      } catch (error) {
        console.error("❌ Error fetching document files:", error);
        return [];
      }
    },
    [getDocumentById]
  );

  // 🆕 NEW: Delete a specific file (you may need to add this API endpoint)
  const deleteDocumentFile = useCallback(
    async (fileId: string): Promise<boolean> => {
      try {
        await callApi("delete", `/Files/${fileId}`);
        return true;
      } catch (error) {
        console.error("Error deleting file:", error);
        throw error;
      }
    },
    [callApi]
  );

  // 🆕 NEW: Get download URL for a file (direct download)
  const getFileDownloadUrl = useCallback(
    (fileId: string): string => {
      // Sử dụng API download endpoint từ Swagger (không có presigned)
      return `/api/Download/${fileId}`;
    },
    []
  );

  // 🆕 NEW: Get presigned URL for file preview/download
  const getFilePresignedUrl = useCallback(
    async (fileId: string, expirationHours: number = 24): Promise<string> => {
      try {
        console.log(`🔄 Getting presigned URL for file: ${fileId}`);
        const response = await callApi("get", `/Download/${fileId}/presigned?expirationHours=${expirationHours}`);
        
        // Response format: { url: "...", expiresAt: "..." }
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
        console.error("❌ Error getting presigned URL:", error);
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
    ): Promise<PaginatedResponse<DocumentType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `/Documents/search?searchTerm=${encodeURIComponent(searchTerm)}&pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tìm kiếm tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  return {
    loading,
    getPaginatedDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
    getDocumentFiles,
    deleteDocumentFile,
    getFileDownloadUrl,
    getFilePresignedUrl,
    searchDocuments,
  };
};

export default useDocumentService;