import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

/* ── Request interceptor — attach JWT ── */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response interceptor — global error handling ── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    // Backend returns ApiResponse<T> — error message is in .error field
    const message = error.response?.data?.error
                 || error.response?.data?.message
                 || "Something went wrong";

    if (status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      toast.error("Session expired. Please login again.");
    } else if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (status === 404) {
      toast.error("Resource not found.");
    } else if (status === 409) {
      toast.error(message);
    } else if (status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (status && status !== 400) {
      // 400 validation errors shown per-form, not globally
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
