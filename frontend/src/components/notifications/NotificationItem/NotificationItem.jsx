import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { markAsReadAsync, deleteNotificationAsync } from "../../../redux/slices/notificationSlice";
import { timeAgo } from "../../../utils/formatDate";
import Icon from "../../common/Icon/Icon";
import "./NotificationItem.css";

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
  general:          { bg: "var(--color-surface-alt)",color: "var(--color-text-muted)", icon: "bell" },
  default:          { bg: "var(--color-surface-alt)",color: "var(--color-text-muted)", icon: "bell" },
};

export default function NotificationItem({ notification, showActions = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, type, title, message, read, createdAt, itemId, variantId } = notification;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.default;

  const handleClick = () => {
    if (!read) dispatch(markAsReadAsync(id));
    if (!itemId) return;
    // Deep-link straight to the exact item/trial record this notification is
    // about: the variant (if any) and the Trial Stakeholders tab.
    const params = new URLSearchParams();
    if (variantId) params.set("variant", variantId);
    if (type === "feedback_overdue" || type === "feedback_received" || type === "trial_update") {
      params.set("tab", "trials");
    }
    const qs = params.toString();
    navigate(`/items/${itemId}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div
      className={`notif-item ${!read ? "notif-item--unread" : ""}`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className="notif-item__icon"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        <Icon name={cfg.icon} size={16} strokeWidth={2.2} />
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
            className="notif-item__delete press-scale"
            onClick={(e) => { e.stopPropagation(); dispatch(deleteNotificationAsync(id)); }}
            title="Delete notification"
          >
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
