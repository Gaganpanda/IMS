import { useDispatch, useSelector } from "react-redux";
import { toggleNotificationPopup } from "../../../redux/slices/notificationSlice";
import Icon from "../../common/Icon/Icon";
import "./NotificationBell.css";

export default function NotificationBell() {
  const dispatch = useDispatch();
  const unreadCount = useSelector((s) => s.notifications.unreadCount);
  const showPopup   = useSelector((s) => s.notifications.showPopup);

  return (
    <button
      className={`notif-bell press-scale ${showPopup ? "notif-bell--active" : ""}`}
      onClick={() => dispatch(toggleNotificationPopup())}
      aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
    >
      <Icon name="bell" size={20} className="notif-bell__icon" />
      {unreadCount > 0 && (
        <span className="notif-bell__badge">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
