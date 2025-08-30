import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (or sessionStorage, or Zustand/Redux)
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.token = token; // send as `req.headers.token`
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
