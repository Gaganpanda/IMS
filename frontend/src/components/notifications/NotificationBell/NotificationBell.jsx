import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { toggleNotificationPopup } from "../../../redux/slices/notificationSlice";
import Icon from "../../common/Icon/Icon";
import "./NotificationBell.css";

export default function NotificationBell() {
  const dispatch = useDispatch();
  const unreadCount = useSelector((s) => s.notifications.unreadCount);
  const showPopup   = useSelector((s) => s.notifications.showPopup);

  // Physically "ring" the bell whenever unread count goes up — a fresh
  // notification just landed (via polling or a real-time push). We only
  // animate on an *increase* so opening the popup, marking things read, etc.
  // (which only ever lower the count) never re-trigger it.
  const [ringing, setRinging] = useState(false);
  const prevCount = useRef(unreadCount);
  const ringTimeout = useRef(null);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setRinging(true);
      clearTimeout(ringTimeout.current);
      ringTimeout.current = setTimeout(() => setRinging(false), 900);
    }
    prevCount.current = unreadCount;
    return () => clearTimeout(ringTimeout.current);
  }, [unreadCount]);

  return (
    <button
      className={`notif-bell press-scale ${showPopup ? "notif-bell--active" : ""} ${ringing ? "notif-bell--ring" : ""}`}
      onClick={() => dispatch(toggleNotificationPopup())}
      aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
    >
      <Icon name="bell" size={20} className="notif-bell__icon" />
      {unreadCount > 0 && (
        <span className={`notif-bell__badge ${ringing ? "notif-bell__badge--pop" : ""}`}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
