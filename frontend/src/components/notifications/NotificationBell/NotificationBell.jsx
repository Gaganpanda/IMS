import { useDispatch, useSelector } from "react-redux";
import { toggleNotificationPopup } from "../../../redux/slices/notificationSlice";
import "./NotificationBell.css";

export default function NotificationBell() {
  const dispatch = useDispatch();
  const unreadCount = useSelector((s) => s.notifications.unreadCount);
  const showPopup   = useSelector((s) => s.notifications.showPopup);

  return (
    <button
      className={`notif-bell ${showPopup ? "notif-bell--active" : ""}`}
      onClick={() => dispatch(toggleNotificationPopup())}
      aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
    >
      <svg className="notif-bell__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="notif-bell__badge">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
