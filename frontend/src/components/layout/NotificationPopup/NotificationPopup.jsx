import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  closeNotificationPopup,
  markAllAsReadAsync,
  markAsReadAsync,
} from "../../../redux/slices/notificationSlice";
import { timeAgo } from "../../../utils/formatDate";
import "./NotificationPopup.css";

/* Icon map by notification type */
const TYPE_CONFIG = {
  item_added:       { bg: "#dcfce7", color: "#16a34a", icon: "✓" },
  status_changed:   { bg: "#ede9fe", color: "#7c3aed", icon: "⊙" },
  document_filled:  { bg: "#fff7ed", color: "#ea580c", icon: "≡" },
  ipr_changed:      { bg: "#fee2e2", color: "#dc2626", icon: "⛨" },
  document_upload:  { bg: "#dbeafe", color: "#2563eb", icon: "↑" },
  procurement:      { bg: "#fef9c3", color: "#ca8a04", icon: "🛒" },
  default:          { bg: "#f1f5f9", color: "#64748b", icon: "•" },
};

function NotificationIcon({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.default;
  return (
    <div
      className="notif-popup__item-icon"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.icon}
    </div>
  );
}

export default function NotificationPopup() {
  const dispatch = useDispatch();
  const panelRef = useRef(null);
  const showPopup = useSelector((s) => s.notifications?.showPopup ?? false);
  const { list = [], unreadCount = 0 } = useSelector((s) => s.notifications);

  const unread = list.filter((n) => !n.read);
  const read = list.filter((n) => n.read);

  /* Close on outside click */
  useEffect(() => {
    if (!showPopup) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        dispatch(closeNotificationPopup());
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPopup, dispatch]);

  if (!showPopup) return null;

  return (
    <div className="notif-popup__overlay">
      <div ref={panelRef} className="notif-popup">
        {/* Header */}
        <div className="notif-popup__header">
          <h2 className="notif-popup__title">Notifications</h2>
          <button
            className="notif-popup__close"
            onClick={() => dispatch(closeNotificationPopup())}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs row */}
        <div className="notif-popup__tabs">
          <div className="notif-popup__tabs-left">
            <button className="notif-popup__tab notif-popup__tab--active">
              All <span className="notif-popup__tab-count">{list.length}</span>
            </button>
            <button className="notif-popup__tab">
              Unread <span className="notif-popup__tab-count notif-popup__tab-count--blue">{unreadCount}</span>
            </button>
            <button className="notif-popup__tab">
              Read <span className="notif-popup__tab-count">{read.length}</span>
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              className="notif-popup__mark-all"
              onClick={() => dispatch(markAllAsReadAsync())}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="notif-popup__list">
          {list.length === 0 ? (
            <div className="notif-popup__empty">
              <div className="notif-popup__empty-icon">🔔</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            list.map((n) => (
              <div
                key={n.id}
                className={`notif-popup__item${!n.read ? " notif-popup__item--unread" : ""}`}
                onClick={() => !n.read && dispatch(markAsReadAsync(n.id))}
              >
                <NotificationIcon type={n.type} />
                <div className="notif-popup__item-body">
                  <div className="notif-popup__item-title">{n.title}</div>
                  <div className="notif-popup__item-msg">{n.message}</div>
                  <div className="notif-popup__item-time">{timeAgo(n.createdAt)}</div>
                </div>
                {!n.read && <span className="notif-popup__item-dot" />}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="notif-popup__footer">
          <Link
            to="/notifications"
            className="notif-popup__view-all"
            onClick={() => dispatch(closeNotificationPopup())}
          >
            View all notifications
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
