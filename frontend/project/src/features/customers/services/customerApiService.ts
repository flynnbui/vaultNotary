import { useCallback } from "react";
import useApiWithLoading from "@/src/hooks/useApiWithLoading";
import {
  CustomerType,
  CreateCustomerType,
  UpdateCustomerType,
  CustomerFilterOptions,
} from "@/src/types/customer.type";
import { CreateCustomerDto } from "@/src/types/api.types";
import { CUSTOMER, SEARCH } from "@/src/lib/constants";
import { PaginatedResponse } from "@/src/types/pagination.type";
import { ErrorHandler } from "@/src/shared/utils/errorHandler";

const useCustomerApiService = () => {
  const { loading, callApi } = useApiWithLoading();

  // Customer-specific error handler - memoized to prevent infinite re-renders
  const handleCustomerError = useCallback((error: unknown, operation: string) => {
    ErrorHandler.handleCustomerError(error, operation);
  }, []);

  const getPaginatedCustomers = useCallback(
    async (
      pageNumber = 1,
      pageSize = 10,
      filters?: CustomerFilterOptions
    ): Promise<PaginatedResponse<CustomerType> | undefined> => {
      try {
        let url = `${CUSTOMER.PAGINATED}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

        if (filters?.type) {
          url += `&type=${filters.type}`;
        }
        if (filters?.dateFrom) {
          url += `&dateFrom=${filters.dateFrom}`;
        }
        if (filters?.dateTo) {
          url += `&dateTo=${filters.dateTo}`;
        }

        const response = await callApi<PaginatedResponse<CustomerType>>("get", url);
        return response?.data;
      } catch (error) {
        handleCustomerError(error, "fetch paginated list");
        throw error;
      }
    },
    [callApi, handleCustomerError]
  );

  const getAllCustomers = useCallback(async (): Promise<CustomerType[]> => {
    try {
      const response = await callApi<CustomerType[]>("get", CUSTOMER.DEFAULT);
      return response?.data || [];
    } catch (error) {
      handleCustomerError(error, "fetch all customers");
      throw error;
    }
  }, [callApi, handleCustomerError]);

  const getCustomerById = useCallback(
    async (id: string): Promise<CustomerType | undefined> => {
      try {
        const response = await callApi<CustomerType>("get", `${CUSTOMER.BY_ID}/${id}`);
        return response?.data;
      } catch (error) {
        handleCustomerError(error, "fetch by ID");
        throw error;
      }
    },
    [callApi, handleCustomerError]
  );

  const createCustomer = useCallback(
    async (customerData: CreateCustomerType): Promise<string> => {
      try {
        const response = await callApi<string>("post", CUSTOMER.DEFAULT, customerData);
        return response?.data!;
      } catch (error) {
        handleCustomerError(error, "create");
        throw error;
      }
    },
    [callApi, handleCustomerError]
  );

  const updateCustomer = useCallback(
    async (id: string, customerData: UpdateCustomerType): Promise<void> => {
      try {
        await callApi("put", `${CUSTOMER.BY_ID}/${id}`, customerData);
      } catch (error) {
        handleCustomerError(error, "update");
        throw error;
      }
    },
    [callApi, handleCustomerError]
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<void> => {
      try {
        await callApi("delete", `${CUSTOMER.BY_ID}/${id}`);
      } catch (error) {
        handleCustomerError(error, "delete");
        // Don't re-throw after handling the error to prevent unhandled rejections
        return;
      }
    },
    [callApi, handleCustomerError]
  );

  const searchCustomers = useCallback(
    async (
      identity: string,
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<CustomerType> | undefined> => {
      try {
        const response = await callApi<PaginatedResponse<CustomerType>>(
          "get",
          `${SEARCH.CUSTOMERS}?identity=${encodeURIComponent(
            identity
          )}&pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        handleCustomerError(error, "search");
        throw error;
      }
    },
    [callApi, handleCustomerError]
  );

  const getCustomerDocuments = useCallback(
    async (customerId: string, pageNumber = 1, pageSize = 10): Promise<any> => {
      try {
        const response = await callApi(
          "get",
          `${SEARCH.DOCUMENTS_BY_CUSTOMER}/${customerId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        handleCustomerError(error, "fetch documents");
        throw error;
      }
    },
    [callApi, handleCustomerError]
  );

  const bulkDeleteCustomers = useCallback(
    async (customerIds: string[]): Promise<{ success: number; failed: number }> => {
      let successCount = 0;
      let failedCount = 0;
      
      // Process deletions sequentially to avoid overwhelming the server
      for (const id of customerIds) {
        try {
          await callApi("delete", `${CUSTOMER.BY_ID}/${id}`);
          successCount++;
        } catch (error) {
          failedCount++;
          handleCustomerError(error, "bulk delete");
        }
      }
      
      return { success: successCount, failed: failedCount };
    },
    [callApi, handleCustomerError]
  );

  return {
    loading,
    getPaginatedCustomers,
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomerDocuments,
    bulkDeleteCustomers,
  };
};

export default useCustomerApiService;