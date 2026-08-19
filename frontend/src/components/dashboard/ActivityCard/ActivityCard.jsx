import { useSelector } from "react-redux";
import { useState } from "react";
import { timeAgo } from "../../../utils/formatDate";
import Icon from "../../common/Icon/Icon";
import Modal from "../../common/Modal/Modal";
import "./ActivityCard.css";

/* Kept in sync with the Notifications page / NotificationPopup TYPE_CONFIG
   so the same activity type always reads with the same icon + color
   everywhere in the app. */
const TYPE_CONFIG = {
  item_added:      { tone: "green",  icon: "checkCircle" },
  status_changed:  { tone: "blue",   icon: "refresh" },
  document_filled: { tone: "orange", icon: "file" },
  ipr_changed:     { tone: "red",    icon: "shield" },
  document_upload: { tone: "purple", icon: "upload" },
  procurement:     { tone: "gold",   icon: "cart" },
  trial_update:    { tone: "teal",   icon: "flask" },
  default:         { tone: "grey",   icon: "info" },
};

function ActivityList({ items }) {
  if (items.length === 0) {
    return (
      <div className="activity-card__empty">
        <div className="activity-card__empty-icon">
          <Icon name="layers" size={20} strokeWidth={1.8} />
        </div>
        <p>No recent activity.</p>
      </div>
    );
  }
  return items.map((a, i) => {
    const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.default;
    const isLast = i === items.length - 1;
    return (
      <div key={i} className="activity-card__item">
        <div className="activity-card__rail">
          <span className={`activity-card__icon activity-card__icon--${cfg.tone}`}>
            <Icon name={cfg.icon} size={14} strokeWidth={2.2} />
          </span>
          {!isLast && <span className="activity-card__rail-line" />}
        </div>
        <div className="activity-card__body">
          <span className="activity-card__msg">{a.message}</span>
          <span className="activity-card__time">{timeAgo(a.createdAt)}</span>
        </div>
      </div>
    );
  });
}

export default function ActivityCard() {
  const { recentActivities } = useSelector((s) => s.dashboard);
  const [showAll, setShowAll] = useState(false);

  // Activities already arrive newest-first from the backend; a defensive
  // client sort keeps that guarantee even if the source order ever changes.
  const sorted = [...recentActivities].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  const visible = sorted.slice(0, 6);

  return (
    <div className="activity-card card">
      <div className="activity-card__header">
        <h3 className="activity-card__title">Recent Activities</h3>
        {sorted.length > 0 && (
          <button className="activity-card__view-all" onClick={() => setShowAll(true)}>
            View All
          </button>
        )}
      </div>

      <div className="activity-card__list">
        <ActivityList items={visible} />
      </div>

      {/* Decorative wave, same structure/technique as the dev-status donut
          chart's wave (Charts.jsx) — two tiles drawn side by side in a
          double-width viewBox, each layer wrapped in a <g>. CSS slides the
          group left by exactly one tile width and loops; since the tiles
          are identical, the loop point is invisible. Purely cosmetic. */}
            {/* Decorative wave — static, same structure as the original
          chart-card__wave in the dev-status chart. Purely cosmetic. */}
      <div className="activity-card__wave" aria-hidden="true">
        <svg viewBox="0 0 400 80" preserveAspectRatio="none" width="100%" height="100%">
          <path d="M0,40 C60,10 120,10 180,35 C240,60 300,60 360,30 C380,20 390,18 400,20 L400,80 L0,80 Z" fill="#22c55e" opacity="0.06" />
          <path d="M0,55 C70,30 130,55 200,45 C270,35 330,15 400,45 L400,80 L0,80 Z" fill="#4ade80"opacity="0.09" />
        </svg>
        
      </div>

      <Modal open={showAll} onClose={() => setShowAll(false)} title="Recent Activities" size="lg">
        <div className="activity-card__list activity-card__list--modal">
          <ActivityList items={sorted} />
        </div>
      </Modal>
    </div>
  );
}