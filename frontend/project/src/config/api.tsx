import axios from "axios";
// import { refreshAuthToken } from "../utils/authUtils";

// const SERVER = process.env.VITE_API_URL_SERVER;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

console.log(" Base URL:", BASE_URL); 
const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true; // Prevent infinite retry loop

//       try {
//         const newToken = await refreshAuthToken();
//         axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         console.error("Refresh token failed:", refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default api;