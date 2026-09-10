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
          <span className="activity-card__msg" title={a.message}>{a.message}</span>
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

      {/* Decorative wave — same technique + gradient/opacity recipe as the
          dev-status donut chart's wave (Charts.jsx .chart-card__wave), just
          tinted green instead of primary, so the two cards read as a
          matched pair instead of one being a faint, barely-visible smudge
          next to a bold one. */}
      <div className="activity-card__wave" aria-hidden="true">
        <svg viewBox="0 0 400 80" preserveAspectRatio="none" width="100%" height="100%">
          <defs>
            <linearGradient id="activityWaveGradBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="activityWaveGradFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.10" />
            </linearGradient>
          </defs>
          <path
            d="M0,40 C60,10 120,10 180,35 C240,60 300,60 360,30 C380,20 390,18 400,20 L400,80 L0,80 Z"
            fill="url(#activityWaveGradBack)"
          />
          <path
            d="M0,55 C70,30 130,55 200,45 C270,35 330,15 400,45 L400,80 L0,80 Z"
            fill="url(#activityWaveGradFront)"
          />
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