// features/documents/services/documentUploadService.ts
import { useCallback } from "react";
import useApiWithLoading from "@/src/hooks/useApiWithLoading";

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

const useDocumentUploadService = () => {
  const { loading, callApi } = useApiWithLoading();

  const uploadDocumentFile = useCallback(
    async ({ documentId, file }: UploadPayload): Promise<UploadedFileResponse> => {
      try {

        const formData = new FormData();
        formData.append("DocumentId", documentId);
        formData.append("File", file);

        const res = await callApi<ApiUploadResponse>("post", "/Upload", formData);
        const apiResponse = res?.data!
        

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

export default useDocumentUploadService;