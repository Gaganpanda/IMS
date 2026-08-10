import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotificationsAsync,
  markAllAsReadAsync,
  markAsReadAsync,
  deleteNotificationAsync,
  deleteAllNotificationsAsync,
} from "../../redux/slices/notificationSlice";
import ConfirmPopup from "../../components/common/ConfirmPopup/ConfirmPopup";
import { timeAgo } from "../../utils/formatDate";
import "./Notifications.css";

/* ── Icon set (matches the app-wide stroke-icon style) ── */
const Icons = {
  bell: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  bellRing: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <path d="M2 8c0-2.2.7-4.1 2-5.5M22 8c0-2.2-.7-4.1-2-5.5" />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  checkCirc: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 10 11 15 8 12" />
    </svg>
  ),
  circle: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  ),
  file: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  ),
  shield: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  upload: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 3v12" />
      <polyline points="7 8 12 3 17 8" />
      <path d="M5 21h14" />
    </svg>
  ),
  cart: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  flask: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3" />
    </svg>
  ),
  info: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  trash: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  layers: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
};

const TYPE_CONFIG = {
  item_added: { color: "green", icon: "checkCirc", label: "Item Added" },
  status_changed: { color: "purple", icon: "layers", label: "Status Changed" },
  document_filled: { color: "orange", icon: "file", label: "Document Filled" },
  ipr_changed: { color: "red", icon: "shield", label: "IPR Changed" },
  document_upload: {
    color: "blue",
    icon: "upload",
    label: "Document Uploaded",
  },
  procurement: { color: "gold", icon: "cart", label: "Procurement" },
  trial_update: { color: "teal", icon: "flask", label: "Trial Update" },
  general: { color: "grey", icon: "info", label: "General" },
  default: { color: "grey", icon: "bell", label: "Notification" },
};

function NotifIcon({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.default;
  return (
    <div className={`notif-page__icon notif-page__icon--${cfg.color}`}>
      {Icons[cfg.icon]}
    </div>
  );
}

function StatPill({ icon, label, value, tone = "default", active, onClick }) {
  return (
    <button
      type="button"
      className={`notif-page__stat notif-page__stat--${tone}${active ? " notif-page__stat--active" : ""}`}
      onClick={onClick}>
      <span className="notif-page__stat-icon">{icon}</span>
      <span className="notif-page__stat-text">
        <span className="notif-page__stat-value">{value}</span>
        <span className="notif-page__stat-label">{label}</span>
      </span>
    </button>
  );
}

export default function Notifications() {
  const dispatch = useDispatch();
  const { list, unreadCount, loading } = useSelector((s) => s.notifications);
  const [tab, setTab] = useState("all");
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchNotificationsAsync());
  }, [dispatch]);

  const readCount = list.filter((n) => n.read).length;
  const filtered =
    tab === "unread"
      ? list.filter((n) => !n.read)
      : tab === "read"
        ? list.filter((n) => n.read)
        : list;

  const handleDeleteAll = async () => {
    setDeleting(true);
    await dispatch(deleteAllNotificationsAsync());
    setDeleting(false);
    setShowDeleteAll(false);
  };

  return (
    <div className="notif-page animate-fade-in-up">
      {/* Page header */}
      <div className="notif-page__top">
        <div className="notif-page__heading-group">
          <div
            className={`notif-page__heading-icon ${
              unreadCount > 0 ? "notif-page__heading-icon--active" : ""
            }`}>
            {Icons.bellRing}
          </div>
          <div>
            <h1 className="notif-page__heading">Activity Center</h1>

            <p className="notif-page__subheading">
              Track item, ToT, IPR, documentation and trial activity.
            </p>
          </div>
        </div>
        <div className="notif-page__header-actions">
          {unreadCount > 0 && (
            <button
              className="notif-page__btn notif-page__btn--secondary"
              onClick={() => dispatch(markAllAsReadAsync())}>
              {Icons.check}
              Mark all as read
            </button>
          )}
          {list.length > 0 && (
            <button
              className="notif-page__btn notif-page__btn--danger"
              onClick={() => setShowDeleteAll(true)}>
              {Icons.trash}
              Delete all
            </button>
          )}
        </div>
      </div>

      {/* Summary stat bar (also acts as the filter) */}
      <div className="notif-page__stats">
        <StatPill
          icon={Icons.layers}
          label="Total"
          value={list.length}
          tone="default"
          active={tab === "all"}
          onClick={() => setTab("all")}
        />
        <StatPill
          icon={Icons.circle}
          label="Unread"
          value={unreadCount}
          tone="primary"
          active={tab === "unread"}
          onClick={() => setTab("unread")}
        />
        <StatPill
          icon={Icons.checkCirc}
          label="Read"
          value={readCount}
          tone="success"
          active={tab === "read"}
          onClick={() => setTab("read")}
        />
      </div>

      {/* Notification list */}
      <div className="notif-page__card">
        <div className="notif-page__card-head">
          <span>
            {tab === "all"
              ? "All notifications"
              : tab === "unread"
                ? "Unread notifications"
                : "Read notifications"}
          </span>
          <span className="notif-page__card-head-count">{filtered.length}</span>
        </div>

        {loading ? (
          <div className="notif-page__loading">
            <span className="notif-page__spinner" />
            Loading notifications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-page__empty">
            <div className="notif-page__empty-icon">{Icons.bell}</div>
            <p>No {tab !== "all" ? tab : ""} notifications</p>
            <span>You're all caught up — new activity will show up here.</span>
          </div>
        ) : (
          filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
            return (
              <div
                key={n.id}
                className={`notif-page__item${!n.read ? " notif-page__item--unread" : ""}`}
                onClick={() => !n.read && dispatch(markAsReadAsync(n.id))}>
                <span
                  className={`notif-page__item-bar notif-page__item-bar--${cfg.color}`}
                />
                <NotifIcon type={n.type} />
                <div className="notif-page__item-body">
                  <div className="notif-page__item-title-row">
                    <span className="notif-page__item-title">{n.title}</span>
                    <span
                      className={`notif-page__item-tag notif-page__item-tag--${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="notif-page__item-msg">{n.message}</div>
                </div>
                <div className="notif-page__item-right">
                  {!n.read && <span className="notif-page__unread-dot" />}
                  <span className="notif-page__item-time">
                    {timeAgo(n.createdAt)}
                  </span>
                  <button
                    className="notif-page__item-del"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(deleteNotificationAsync(n.id));
                    }}>
                    {Icons.trash}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filtered.length > 0 && (
        <div className="notif-page__footer-count">
          Showing {filtered.length} of {list.length} notifications
        </div>
      )}

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
