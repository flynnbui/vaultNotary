// hooks/useUploadService.ts
import { useCallback } from "react";
import useApi from "./useApi";

// Định nghĩa kiểu dữ liệu trả về từ API thực tế (based on your response)
export interface ApiUploadResponse {
  id: string;
  documentId: string;
  contentType: string;
  createdAt: string;
  message: string;
}

// Định nghĩa kiểu dữ liệu sau khi transform cho UI
export interface UploadedFileResponse {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  url: string;
}

interface UploadPayload {
  documentId: string;
  file: File;
}

const useUploadService = () => {
  const { callApi, loading } = useApi();

  const uploadDocumentFile = useCallback(
    async ({ documentId, file }: UploadPayload): Promise<UploadedFileResponse> => {
      try {

        const formData = new FormData();
        formData.append("DocumentId", documentId);
        formData.append("File", file);

        const res = await callApi("post", "/Upload", formData);
        const apiResponse = res.data as ApiUploadResponse;
        

        const transformedResponse: UploadedFileResponse = {
          id: apiResponse.id,
          name: file.name, // Lấy từ file object gốc
          size: file.size, // Lấy từ file object gốc  
          type: apiResponse.contentType,
          uploadDate: apiResponse.createdAt,
          url: `/api/Download/${apiResponse.id}`, // Sử dụng đúng download endpoint
        };


        return transformedResponse;
      } catch (error) {
        throw error;
      }
    },
    [callApi]
  );

  return {
    uploadDocumentFile,
    loading,
  };
};

export default useUploadService;