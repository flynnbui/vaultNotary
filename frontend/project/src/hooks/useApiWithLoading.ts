import { useCallback, useState } from "react";
import api from "@/src/config/api";
import { AxiosResponse } from "axios";

/**
 * Hook that wraps axios instance with loading state management
 * Provides same interface as old callApi but with better TypeScript support
 */
const useApiWithLoading = () => {
  const [loading, setLoading] = useState(false);

  const callApi = useCallback(
    async <T = any>(
      method: "get" | "post" | "put" | "delete" | "patch",
      url: string,
      data?: any
    ): Promise<AxiosResponse<T> | undefined> => {
      try {
        setLoading(true);
        
        const response = await api[method](url, data || undefined) as AxiosResponse<T>;
        
        return response;
      } catch (error: unknown) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, callApi };
};

export default useApiWithLoading;