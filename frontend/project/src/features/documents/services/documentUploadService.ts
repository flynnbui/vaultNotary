// features/documents/services/documentUploadService.ts
import { useCallback, useRef, useEffect } from "react";
import useApiWithLoading from "@/src/hooks/useApiWithLoading";
import api from "@/src/config/api";

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
  onProgress?: (progress: number) => void;
}

interface UploadOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

const useDocumentUploadService = () => {
  const { loading, callApi } = useApiWithLoading();
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const uploadDocumentFile = useCallback(
    async ({ documentId, file, onProgress }: UploadPayload): Promise<UploadedFileResponse> => {
      try {
        const formData = new FormData();
        formData.append("DocumentId", documentId);
        formData.append("File", file);

        // If progress callback is provided, use direct axios call with progress tracking
        if (onProgress) {
          const controller = new AbortController();
          const uploadId = `${documentId}-${file.name}-${Date.now()}`;
          abortControllers.current.set(uploadId, controller);

          try {
            const response = await api.post<ApiUploadResponse>("/Upload", formData, {
              signal: controller.signal,
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  onProgress(progress);
                }
              },
            });

            abortControllers.current.delete(uploadId);
            const apiResponse = response.data;

            const transformedResponse: UploadedFileResponse = {
              id: apiResponse.id,
              name: file.name,
              size: file.size,
              type: apiResponse.contentType,
              uploadDate: apiResponse.createdAt,
              url: `/api/Download/${apiResponse.id}`,
            };

            return transformedResponse;
          } catch (error) {
            abortControllers.current.delete(uploadId);
            throw error;
          }
        } else {
          // Use the existing callApi for backward compatibility
          const res = await callApi<ApiUploadResponse>("post", "/Upload", formData);
          const apiResponse = res?.data!;

          const transformedResponse: UploadedFileResponse = {
            id: apiResponse.id,
            name: file.name,
            size: file.size,
            type: apiResponse.contentType,
            uploadDate: apiResponse.createdAt,
            url: `/api/Download/${apiResponse.id}`,
          };

          return transformedResponse;
        }
      } catch (error: any) {
        // Enhanced error handling with status codes
        if (error.name === 'AbortError') {
          throw new Error('Upload cancelled');
        }
        
        // Check for HTTP status codes
        if (error.response?.status) {
          switch (error.response.status) {
            case 413:
              throw new Error('File too large - please select a smaller file');
            case 415:
              throw new Error('File type not supported');
            case 400:
              throw new Error('Invalid file or document ID');
            case 401:
              throw new Error('Authentication required');
            case 403:
              throw new Error('Permission denied');
            case 500:
              throw new Error('Server error - please try again later');
            default:
              throw new Error(`Upload failed (${error.response.status})`);
          }
        }
        
        // Check for timeout
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error('Upload timeout - please try again');
        }
        
        throw error;
      }
    },
    [callApi]
  );

  const cancelUpload = useCallback((uploadId: string) => {
    const controller = abortControllers.current.get(uploadId);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(uploadId);
    }
  }, []);

  const cancelAllUploads = useCallback(() => {
    abortControllers.current.forEach((controller) => {
      controller.abort();
    });
    abortControllers.current.clear();
  }, []);

  // Cleanup all uploads when component unmounts
  useEffect(() => {
    return () => {
      cancelAllUploads();
    };
  }, [cancelAllUploads]);

  return {
    uploadDocumentFile,
    loading,
    cancelUpload,
    cancelAllUploads,
  };
};

export default useDocumentUploadService;