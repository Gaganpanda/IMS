import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotificationsAsync,
  markAsReadAsync,
  markAllAsReadAsync,
  deleteNotificationAsync,
  deleteAllNotificationsAsync,
} from "../redux/slices/notificationSlice";

/**
 * useNotifications — manages notifications with auto-polling
 * @param {boolean} poll - enable 60-second polling (default true)
 */
export function useNotifications(poll = true) {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotificationsAsync());
    if (!poll) return;
    const id = setInterval(() => dispatch(fetchNotificationsAsync()), 60_000);
    return () => clearInterval(id);
  }, [dispatch, poll]);

  return {
    notifications: list,
    unreadCount,
    loading,
    markAsRead:    (id) => dispatch(markAsReadAsync(id)),
    markAllAsRead: ()   => dispatch(markAllAsReadAsync()),
    deleteOne:     (id) => dispatch(deleteNotificationAsync(id)),
    deleteAll:     ()   => dispatch(deleteAllNotificationsAsync()),
  };
}
