/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import useApi from "./useApi";
import {
  CustomerType,
  CreateCustomerType,
  UpdateCustomerType,
  CustomerFilterOptions,
} from "../types/customer.type";
import { PaginatedResponse } from "../types/pagination.type";
import { CUSTOMER, SEARCH } from "../lib/constants";

const useCustomerService = () => {
  const { callApi, loading } = useApi();

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

        const response = await callApi("get", url);
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khách hàng:", error);
        throw error;
      }
    },
    [callApi]
  );

  const getAllCustomers = useCallback(async (): Promise<CustomerType[]> => {
    try {
      const response = await callApi("get", CUSTOMER.DEFAULT);
      return response?.data || [];
    } catch (error) {
      console.error("Lỗi khi lấy tất cả khách hàng:", error);
      throw error;
    }
  }, [callApi]);

  const getCustomerById = useCallback(
    async (id: string): Promise<CustomerType | undefined> => {
      try {
        const response = await callApi("get", `${CUSTOMER.BY_ID}/${id}`);
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi lấy thông tin khách hàng:", error);
        throw error;
      }
    },
    [callApi]
  );

  const createCustomer = useCallback(
    async (customerData: CreateCustomerType): Promise<string> => {
      console.log("Hello");
      try {
        const response = await callApi("post", CUSTOMER.DEFAULT, customerData);
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tạo khách hàng:", error);
        throw error;
      }
    },
    [callApi]
  );

  const updateCustomer = useCallback(
    async (id: string, customerData: UpdateCustomerType): Promise<void> => {
      try {
        await callApi("put", `${CUSTOMER.BY_ID}/${id}`, customerData);
      } catch (error) {
        console.error("Lỗi khi cập nhật khách hàng:", error);
        throw error;
      }
    },
    [callApi]
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<void> => {
      try {
        await callApi("delete", `${CUSTOMER.BY_ID}/${id}`);
      } catch (error) {
        console.error("Lỗi khi xóa khách hàng:", error);
        throw error;
      }
    },
    [callApi]
  );

  const searchCustomers = useCallback(
    async (
      identity: string,
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<CustomerType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `${SEARCH.CUSTOMERS}?identity=${encodeURIComponent(
            identity
          )}&pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi tìm kiếm khách hàng:", error);
        throw error;
      }
    },
    [callApi]
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
        console.error("Lỗi khi lấy tài liệu của khách hàng:", error);
        throw error;
      }
    },
    [callApi]
  );

  const bulkDeleteCustomers = useCallback(
    async (customerIds: string[]): Promise<void> => {
      try {
        await Promise.all(customerIds.map((id) => deleteCustomer(id)));
      } catch (error) {
        console.error("Lỗi khi xóa hàng loạt khách hàng:", error);
        throw error;
      }
    },
    [deleteCustomer]
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

export default useCustomerService;
