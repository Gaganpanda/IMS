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

    // FIX: a failed /auth/login attempt (wrong password) also comes back as a
    // 401, and it used to fall into this same branch — so on top of the
    // correct inline "Invalid username or password" message under the field,
    // the user also got a misleading "Session expired. Please login again."
    // toast for a login they never had a session for in the first place. Only
    // treat a 401 as a stale/expired session when it's *not* the login call
    // itself.
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      toast.error("Session expired. Please login again.");
    } else if (status === 403) {
      toast.error("You don't have permission to perform this action.");
    } else if (status === 404) {
      toast.error("Resource not found.");
    } else if (status === 409) {
      // ITEM_STALE (concurrent-edit conflict) and HAS_DEPENDENCIES (blocked
      // delete) get dedicated inline UI at the call site (a conflict banner
      // / an "archive instead?" prompt) rather than a generic toast, so skip
      // the blanket toast here to avoid showing both.
      const code = error.response?.data?.code;
      if (code !== "ITEM_STALE" && code !== "HAS_DEPENDENCIES") {
        toast.error(message);
      }
    } else if (status === 400) {
      // Field-level validation errors come back as { data: { field: "msg" } } —
      // the thunk that made the call formats and shows those itself (it can
      // join multiple field messages into one toast; this interceptor only
      // has the single top-level message). A plain 400 with just a string
      // message has nothing more specific to show, so toast it here instead
      // of leaving it unhandled.
      const hasFieldErrors = error.response?.data?.data && typeof error.response.data.data === "object";
      if (!hasFieldErrors) toast.error(message);
    } else if (status) {
      // Anything else not already handled above (5xx, 429, etc.) — shown
      // once, here. Thunks no longer toast their own fallback message on
      // top of this: doing both used to show the same failure as two
      // stacked toasts (e.g. "An unexpected error occurred..." from the
      // backend's own message *and* a second "Server error. Please try
      // again later." from this interceptor).
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
