import axios from "axios";
import { getAccessToken } from '@auth0/nextjs-auth0';
import { ApiError } from '../shared/utils/errorHandler';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  async function (config) {
    try {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('❌ Token Error:', error);
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