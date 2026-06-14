import axiosInstance from "./axiosInstance";

const BASE = "/notifications";

export const getAllNotifications = () =>
  axiosInstance.get(BASE);

export const getUnreadCount = () =>
  axiosInstance.get(`${BASE}/unread-count`);

export const markAsRead = (id) =>
  axiosInstance.patch(`${BASE}/${id}/read`);

export const markAllAsRead = () =>
  axiosInstance.patch(`${BASE}/read-all`);

export const deleteNotification = (id) =>
  axiosInstance.delete(`${BASE}/${id}`);

export const deleteAllNotifications = () =>
  axiosInstance.delete(`${BASE}/all`);
