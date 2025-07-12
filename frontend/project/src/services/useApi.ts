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
        console.log(`🌐 useApi: Making ${method.toUpperCase()} request to:`, url);
        console.log(`🌐 useApi: Request data:`, data);
        setIsLoading(true);
        
        const response = await api[method](url, data || undefined);
        
        console.log(`✅ useApi: ${method.toUpperCase()} response:`, response);
        console.log(`✅ useApi: Response status:`, response?.status);
        console.log(`✅ useApi: Response data:`, response?.data);
        
        if (message) console.log(message);
        return response;
      } catch (error: unknown) {
        console.error(`❌ useApi: Error in ${method.toUpperCase()} ${url}:`, error);
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
