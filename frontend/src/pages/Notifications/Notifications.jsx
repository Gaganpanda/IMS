import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotificationsAsync,
  markAllAsReadAsync,
  deleteAllNotificationsAsync,
} from "../../redux/slices/notificationSlice";
import NotificationList from "../../components/notifications/NotificationList/NotificationList";
import ConfirmPopup from "../../components/common/ConfirmPopup/ConfirmPopup";
import { useState } from "react";
import "./Notifications.css";

export default function Notifications() {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector((s) => s.notifications);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchNotificationsAsync());
  }, [dispatch]);

  const handleDeleteAll = async () => {
    setDeleting(true);
    await dispatch(deleteAllNotificationsAsync());
    setDeleting(false);
    setShowDeleteAll(false);
  };

  return (
    <div className="notif-page">
      {/* Header */}
      <div className="notif-page__header">
        {/* <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Stay updated with important alerts and activities.</p>
        </div> */}
        <div className="notif-page__actions">
          {unreadCount > 0 && (
            <button
              className="btn btn--secondary"
              onClick={() => dispatch(markAllAsReadAsync())}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark all as read
            </button>
          )}
          {list.length > 0 && (
            <button
              className="btn btn--secondary notif-page__delete-btn"
              onClick={() => setShowDeleteAll(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
              Delete all notifications
            </button>
          )}
        </div>
      </div>

      {/* Summary row */}
      {list.length > 0 && (
        <div className="notif-page__summary">
          <span className="notif-page__count">
            Showing 1 to {list.length} of {list.length} notifications
          </span>
          {unreadCount > 0 && (
            <span className="notif-page__unread-chip">{unreadCount} unread</span>
          )}
        </div>
      )}

      {/* List */}
      <div className="card notif-page__list-card">
        <NotificationList showActions />
      </div>

      {/* Delete all confirm */}
      <ConfirmPopup
        open={showDeleteAll}
        onClose={() => setShowDeleteAll(false)}
        onConfirm={handleDeleteAll}
        title="Delete All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        confirmLabel="Delete All"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
