/**
 * authApi.js
 * Low-level API calls for authentication.
 * Used by authSlice thunks.
 */
import axiosInstance from "../../services/axiosInstance";

const BASE = "/auth";

export const authApi = {
  login:          (credentials) => axiosInstance.post(`${BASE}/login`, credentials),
  logout:         ()            => axiosInstance.post(`${BASE}/logout`),
  getCurrentUser: ()            => axiosInstance.get(`${BASE}/me`),
};
