import { useSelector } from "react-redux";
import NotificationItem from "../NotificationItem/NotificationItem";
import EmptyState from "../../common/EmptyState/EmptyState";
import Loader from "../../common/Loader/Loader";
import "./NotificationList.css";

export default function NotificationList({ showActions = false }) {
  const { list, loading } = useSelector((s) => s.notifications);

  if (loading) return <Loader variant="page" text="Loading notifications..." />;

  if (list.length === 0) {
    return (
      <EmptyState
        icon="🔔"
        title="No notifications"
        description="You're all caught up! New activity will appear here."
      />
    );
  }

  return (
    <div className="notif-list">
      {list.map((n) => (
        <NotificationItem key={n.id} notification={n} showActions={showActions} />
      ))}
    </div>
  );
}
