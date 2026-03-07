import axios from "axios";
import { TokenStorage } from "./token-storage";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://code-camp-hackathon-be.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;
