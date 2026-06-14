/**
 * notificationApi.js
 * Low-level API calls for notifications.
 * Used by notificationSlice thunks.
 */
import axiosInstance from "../../services/axiosInstance";

const BASE = "/notifications";

export const notificationApi = {
  getAll:       ()   => axiosInstance.get(BASE),
  getUnreadCount: () => axiosInstance.get(`${BASE}/unread-count`),
  markAsRead:   (id) => axiosInstance.patch(`${BASE}/${id}/read`),
  markAllAsRead: ()  => axiosInstance.patch(`${BASE}/read-all`),
  deleteOne:    (id) => axiosInstance.delete(`${BASE}/${id}`),
  deleteAll:    ()   => axiosInstance.delete(`${BASE}/all`),
};
