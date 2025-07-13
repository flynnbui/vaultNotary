import axios from "axios";
import { getAccessToken } from '@auth0/nextjs-auth0';
import { ApiError } from '../shared/utils/errorHandler';

// const SERVER = process.env.VITE_API_URL_SERVER;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

 
const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  async function (config) {
    try {
      const { accessToken } = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor to convert axios errors to ApiError
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // Convert axios errors to ApiError instances
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     error.response.statusText || 
                     error.message;
      const details = error.response.data;
      
      return Promise.reject(new ApiError(status, message, details));
    } else if (error.request) {
      // Network error
      return Promise.reject(new ApiError(0, "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.", { originalError: error }));
    } else {
      // Other error
      return Promise.reject(new ApiError(0, error.message || "Có lỗi không xác định xảy ra.", { originalError: error }));
    }
  }
);

export default api;