import axiosInstance from "./axiosInstance";

const BASE = "/dashboard";

/* Single call returns all stats — cached in Redis on backend */
export const getDashboardStats = () =>
  axiosInstance.get(`${BASE}/stats`);

export const getUpcomingDueDates = () =>
  axiosInstance.get(`${BASE}/upcoming-due-dates`);

export const getMonthlyProgress = (year = new Date().getFullYear()) =>
  axiosInstance.get(`${BASE}/monthly-progress`, { params: { year } });

export const getTrialsOverview = () =>
  axiosInstance.get(`${BASE}/trials-overview`);

export const getDocumentationStats = () =>
  axiosInstance.get(`${BASE}/documentation-stats`);

export const getRecentActivities = (limit = 10) =>
  axiosInstance.get(`${BASE}/recent-activities`, { params: { limit } });
