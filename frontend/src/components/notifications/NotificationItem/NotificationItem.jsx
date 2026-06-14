import { useDispatch } from "react-redux";
import { markAsReadAsync, deleteNotificationAsync } from "../../../redux/slices/notificationSlice";
import { timeAgo } from "../../../utils/formatDate";
import "./NotificationItem.css";

const TYPE_CONFIG = {
  item_added:       { bg: "#dcfce7", color: "#16a34a", label: "✓" },
  status_changed:   { bg: "#ede9fe", color: "#7c3aed", label: "⊙" },
  document_filled:  { bg: "#fff7ed", color: "#ea580c", label: "≡" },
  ipr_changed:      { bg: "#fee2e2", color: "#dc2626", label: "⛨" },
  document_upload:  { bg: "#dbeafe", color: "#2563eb", label: "↑" },
  procurement:      { bg: "#fef9c3", color: "#ca8a04", label: "🛒" },
  default:          { bg: "#f1f5f9", color: "#64748b", label: "•" },
};

export default function NotificationItem({ notification, showActions = false }) {
  const dispatch = useDispatch();
  const { id, type, title, message, read, createdAt } = notification;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.default;

  return (
    <div
      className={`notif-item ${!read ? "notif-item--unread" : ""}`}
      onClick={() => !read && dispatch(markAsReadAsync(id))}
    >
      {/* Icon */}
      <div
        className="notif-item__icon"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {cfg.label}
      </div>

      {/* Content */}
      <div className="notif-item__content">
        <div className="notif-item__title">{title}</div>
        <div className="notif-item__msg">{message}</div>
        <div className="notif-item__time">{timeAgo(createdAt)}</div>
      </div>

      {/* Right side */}
      <div className="notif-item__right">
        {!read && <span className="notif-item__dot" />}
        {showActions && (
          <button
            className="notif-item__delete"
            onClick={(e) => { e.stopPropagation(); dispatch(deleteNotificationAsync(id)); }}
            title="Delete notification"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
