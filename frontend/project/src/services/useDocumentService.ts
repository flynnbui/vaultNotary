/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import useApi from "./useApi";
import { DocumentType, DocumentListType, CreateDocumentType, UpdateDocumentType } from "../types/document.type";
import { PaginatedResponse } from "../types/pagination.type";
import { DOCUMENTS, SEARCH } from "../lib/constants";

const useDocumentService = () => {
  const { callApi, loading } = useApi();

  const getPaginatedDocuments = useCallback(
    async (
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<DocumentListType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `${DOCUMENTS.PAGINATED}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  const getAllDocuments = useCallback(
    async (): Promise<DocumentListType[]> => {
      try {
        const response = await callApi("get", DOCUMENTS.DEFAULT);
        return response?.data || [];
      } catch (error) {
        console.error("Lỗi khi lấy tất cả tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  const getDocumentById = useCallback(
    async (id: string): Promise<DocumentType | undefined> => {
      try {
        const response = await callApi("get", `${DOCUMENTS.BY_ID}/${id}`);
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  const createDocument = useCallback(
    async (documentData: CreateDocumentType): Promise<string> => {
      try {
        const response = await callApi("post", DOCUMENTS.DEFAULT, documentData);
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tạo tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  const updateDocument = useCallback(
    async (id: string, documentData: UpdateDocumentType): Promise<void> => {
      try {
        await callApi("put", `${DOCUMENTS.BY_ID}/${id}`, documentData);
      } catch (error) {
        console.error("Lỗi khi cập nhật tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  const deleteDocument = useCallback(
    async (id: string): Promise<void> => {
      try {
        await callApi("delete", `${DOCUMENTS.BY_ID}/${id}`);
      } catch (error) {
        console.error("Lỗi khi xóa tài liệu:", error);
        throw error;
      }
    },
    [callApi]
  );

  const searchDocumentsByCustomer = useCallback(
    async (
      customerId: string,
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<DocumentListType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `${SEARCH.DOCUMENTS_BY_CUSTOMER}/${customerId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tìm kiếm tài liệu theo khách hàng:", error);
        throw error;
      }
    },
    [callApi]
  );

  const searchDocumentsByTransactionCode = useCallback(
    async (
      transactionCode: string,
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<DocumentListType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `${SEARCH.DOCUMENTS_BY_TRANSACTION}/${transactionCode}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tìm kiếm tài liệu theo mã giao dịch:", error);
        throw error;
      }
    },
    [callApi]
  );

  const searchDocumentsByPassport = useCallback(
    async (
      passportId: string,
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<DocumentListType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `${SEARCH.DOCUMENTS_BY_PASSPORT}/${passportId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tìm kiếm tài liệu theo passport:", error);
        throw error;
      }
    },
    [callApi]
  );

  const searchDocumentsByBusiness = useCallback(
    async (
      registrationNumber: string,
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<DocumentListType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `${SEARCH.DOCUMENTS_BY_BUSINESS}/${registrationNumber}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tìm kiếm tài liệu theo đăng ký kinh doanh:", error);
        throw error;
      }
    },
    [callApi]
  );

  const searchDocumentsByDateRange = useCallback(
    async (
      from: string,
      to: string,
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<DocumentListType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `${SEARCH.DOCUMENTS_BY_DATE_RANGE}?from=${from}&to=${to}&pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tìm kiếm tài liệu theo khoảng thời gian:", error);
        throw error;
      }
    },
    [callApi]
  );

  return {
    loading,
    getPaginatedDocuments,
    getAllDocuments,
    getDocumentById,
    createDocument,
    updateDocument,
    deleteDocument,
    searchDocumentsByCustomer,
    searchDocumentsByTransactionCode,
    searchDocumentsByPassport,
    searchDocumentsByBusiness,
    searchDocumentsByDateRange,
  };
};

export default useDocumentService;