// useApi.ts
import { useState, useCallback } from "react";
import api from "../config/api";


const useApi = () => {
  const [loading, setIsLoading] = useState(false);

  const callApi = useCallback(
    async (
      method: "get" | "post" | "put" | "delete" | "patch",
      url: string,
      data?: Record<string, unknown> | FormData | null,
      message?: string
    ) => {
      try {
        setIsLoading(true);
        
        const response = await api[method](url, data || undefined);
        
        
        return response;
      } catch (error: unknown) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { loading, callApi, setIsLoading };
};

export default useApi;
