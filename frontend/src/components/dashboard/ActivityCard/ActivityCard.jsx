import { useSelector } from "react-redux";
import { timeAgo } from "../../../utils/formatDate";
import "./ActivityCard.css";

const DOT_COLORS = {
  item_added:      "#22c55e",
  status_changed:  "#3b82f6",
  document_filled: "#f59e0b",
  ipr_changed:     "#ef4444",
  document_upload: "#8b5cf6",
  procurement:     "#14b8a6",
  default:         "#94a3b8",
};

export default function ActivityCard({ onViewAll }) {
  const { recentActivities } = useSelector((s) => s.dashboard);

  return (
    <div className="activity-card card">
      <div className="activity-card__header">
        <h3 className="activity-card__title">Recent Activities</h3>
        {onViewAll && (
          <button className="activity-card__view-all" onClick={onViewAll}>
            View All
          </button>
        )}
      </div>

      <div className="activity-card__list">
        {recentActivities.length === 0 ? (
          <p className="activity-card__empty">No recent activity.</p>
        ) : (
          recentActivities.slice(0, 8).map((a, i) => (
            <div key={i} className="activity-card__item">
              <span
                className="activity-card__dot"
                style={{ background: DOT_COLORS[a.type] || DOT_COLORS.default }}
              />
              <div className="activity-card__body">
                <span className="activity-card__msg">{a.message}</span>
                <span className="activity-card__time">{timeAgo(a.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
