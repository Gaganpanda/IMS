import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  closeNotificationPopup,
  markAllAsReadAsync,
  markAsReadAsync,
} from "../../../redux/slices/notificationSlice";
import { timeAgo } from "../../../utils/formatDate";
import Icon from "../../common/Icon/Icon";
import "./NotificationPopup.css";

/* Icon map by notification type — kept in sync with NotificationItem's TYPE_CONFIG */
const TYPE_CONFIG = {
  item_added:       { bg: "var(--color-success-bg)", color: "var(--color-success)", icon: "checkCircle" },
  status_changed:   { bg: "var(--color-purple-bg)",  color: "var(--color-purple)",  icon: "refresh" },
  document_filled:  { bg: "var(--color-warning-bg)", color: "var(--color-warning)", icon: "file" },
  ipr_changed:      { bg: "var(--color-danger-bg)",  color: "var(--color-danger)",  icon: "shield" },
  document_upload:  { bg: "var(--color-info-bg)",    color: "var(--color-info)",    icon: "upload" },
  procurement:      { bg: "var(--color-warning-bg)", color: "var(--color-warning)", icon: "cart" },
  trial_update:     { bg: "var(--color-teal-bg)",    color: "var(--color-teal)",    icon: "flask" },
  feedback_overdue: { bg: "var(--color-danger-bg)",  color: "var(--color-danger)",  icon: "alertTriangle" },
  feedback_received:{ bg: "var(--color-success-bg)", color: "var(--color-success)", icon: "checkCircle" },
  sample_pending:   { bg: "var(--color-warning-bg)", color: "var(--color-warning)", icon: "alertCircle" },
  tot_validity:     { bg: "var(--color-info-bg)",    color: "var(--color-info)",    icon: "fileCheck" },
  dev_completion:   { bg: "var(--color-purple-bg)",  color: "var(--color-purple)",  icon: "clock" },
  default:          { bg: "var(--color-surface-alt)",color: "var(--color-text-muted)", icon: "bell" },
};

function NotificationIcon({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.default;
  return (
    <div
      className="notif-popup__item-icon"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon name={cfg.icon} size={15} strokeWidth={2.2} />
    </div>
  );
}

export default function NotificationPopup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [tab, setTab] = useState("all");
  const showPopup = useSelector((s) => s.notifications?.showPopup ?? false);
  const { list: allList = [], unreadCount = 0 } = useSelector((s) => s.notifications);
  // The quick-glance popup mirrors the default "All" tab on the full page —
  // archived items are tucked away there, not surfaced here.
  const list   = allList.filter((n) => !n.archived);
  const unread = list.filter((n) => !n.read);
  const read   = list.filter((n) =>  n.read);
  const displayed = tab === "unread" ? unread : tab === "read" ? read : list;

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

  const handleItemClick = (n) => {
    if (!n.read) dispatch(markAsReadAsync(n.id));
    if (!n.itemId) return;
    const params = new URLSearchParams();
    if (n.variantId) params.set("variant", n.variantId);
    if (n.type === "feedback_overdue" || n.type === "feedback_received" || n.type === "trial_update" || n.type === "sample_pending") {
      params.set("tab", "trials");
    } else if (n.type === "tot_validity") {
      params.set("tab", "tot");
    }
    const qs = params.toString();
    dispatch(closeNotificationPopup());
    navigate(`/items/${n.itemId}${qs ? `?${qs}` : ""}`);
  };

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
            <Icon name="close" size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs row */}
        <div className="notif-popup__tabs">
          <div className="notif-popup__tabs-left">
            <button
              className={`notif-popup__tab${tab === "all" ? " notif-popup__tab--active" : ""}`}
              onClick={() => setTab("all")}
            >
              All <span className="notif-popup__tab-count">{list.length}</span>
            </button>
            <button
              className={`notif-popup__tab${tab === "unread" ? " notif-popup__tab--active" : ""}`}
              onClick={() => setTab("unread")}
            >
              Unread <span className="notif-popup__tab-count notif-popup__tab-count--blue">{unreadCount}</span>
            </button>
            <button
              className={`notif-popup__tab${tab === "read" ? " notif-popup__tab--active" : ""}`}
              onClick={() => setTab("read")}
            >
              Read <span className="notif-popup__tab-count">{read.length}</span>
            </button>
          </div>
          {unreadCount > 0 && (
            <button className="notif-popup__mark-all" onClick={() => dispatch(markAllAsReadAsync())}>
              <Icon name="check" size={13} />
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="notif-popup__list">
          {displayed.length === 0 ? (
            <div className="notif-popup__empty">
              <div className="notif-popup__empty-icon">
                <Icon name="bell" size={22} strokeWidth={1.8} />
              </div>
              <p>No {tab !== "all" ? tab : ""} notifications</p>
              <span>You're all caught up.</span>
            </div>
          ) : (
            displayed.map((n) => (
              <div
                key={n.id}
                className={`notif-popup__item${!n.read ? " notif-popup__item--unread" : ""}`}
                onClick={() => handleItemClick(n)}
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
            <Icon name="forward" size={13} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </div>
  );
}