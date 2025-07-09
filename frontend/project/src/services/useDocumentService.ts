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
    async (id: string): Promise<DocumentType | undefined> => {
      try {
        const response = await callApi("get", `/Documents/${id}`);
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tài liệu:", error);
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
    searchDocuments,
  };
};

export default useDocumentService;