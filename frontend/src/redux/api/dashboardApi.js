/**
 * dashboardApi.js
 * Low-level API calls for dashboard.
 * Used by dashboardSlice thunks.
 */
import axiosInstance from "../../services/axiosInstance";

const BASE = "/dashboard";

export const dashboardApi = {
  getStats:          ()     => axiosInstance.get(`${BASE}/stats`),
  getUpcomingDates:  ()     => axiosInstance.get(`${BASE}/upcoming-due-dates`),
  getMonthlyProgress:(year) => axiosInstance.get(`${BASE}/monthly-progress`, { params: { year } }),
};
