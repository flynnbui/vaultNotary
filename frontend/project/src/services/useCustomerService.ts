/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import useApi from "./useApi";
import { CustomerType } from "../types/customer.type";
import { PaginatedResponse } from "../types/pagination.type";
import { CUSTOMER } from "../lib/constants";

const useCustomerService = () => {
  const { callApi, loading } = useApi();

  const getPaginatedCustomers = useCallback(
    async (
      pageNumber = 1,
      pageSize = 10
    ): Promise<PaginatedResponse<CustomerType> | undefined> => {
      try {
        const response = await callApi(
          "get",
          `${CUSTOMER.PAGINATED}?pageNumber=${pageNumber}&pageSize=${pageSize}`
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khách hàng:", error);
        throw error;
      }
    },
    [callApi]
  );

  return {
    loading,
    getPaginatedCustomers,
  };
};

export default useCustomerService;
