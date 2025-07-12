import axios from "axios";
import { getAccessToken } from '@auth0/nextjs-auth0';

// const SERVER = process.env.VITE_API_URL_SERVER;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

console.log(" Base URL:", BASE_URL); 
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
      console.error('Failed to get access token:', error);
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default api;