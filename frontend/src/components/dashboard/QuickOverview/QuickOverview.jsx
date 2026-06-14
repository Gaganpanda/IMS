import { useSelector } from "react-redux";
import "./QuickOverview.css";

const OVERVIEW_ITEMS = [
  {
    key: "total",
    label: "Total Items",
    color: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },

  {
    key: "developed",
    label: "Developed",
    color: "green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12l3 3 5-5"/>
      </svg>
    ),
  },

  {
    key: "inProgress",
    label: "In Progress",
    color: "orange",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },

  {
    key: "underDevelopment",
    label: "Under Development",
    color: "yellow",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 1 1.4 1.4l-1 1 1.6 1.6 1-1a1 1 0 1 1 1.4 1.4l-1 1 1.9 1.9a2 2 0 0 1 0 2.8l-2.1 2.1a2 2 0 0 1-2.8 0l-1.9-1.9-1 1a1 1 0 1 1-1.4-1.4l1-1-1.6-1.6-1 1a1 1 0 1 1-1.4-1.4l1-1-1.9-1.9a2 2 0 0 1 0-2.8l2.1-2.1a2 2 0 0 1 2.8 0l1.9 1.9 1-1z"/>
      </svg>
    ),
  },

  {
    key: "notStarted",
    label: "Not Started",
    color: "red",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },

  {
    key: "totalDocuments",
    label: "Total Documents",
    color: "teal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
];

export default function QuickOverview() {
  const { stats } = useSelector((s) => s.dashboard);

  return (
    <div className="quick-overview">
      <h3 className="quick-overview__title">Quick Overview</h3>
      <div className="quick-overview__grid">
        {OVERVIEW_ITEMS.map(({ key, label, icon, color }) => (
          <div key={key} className={`quick-overview__item quick-overview__item--${color}`}>
            <div className="quick-overview__icon">{icon}</div>
            <div className="quick-overview__info">
              <span className="quick-overview__label">{label}</span>
              <span className="quick-overview__value">
                {stats?.[key] ?? "—"}
                {stats?.[`${key}Pct`] && (
                  <span className="quick-overview__pct"> ({stats[`${key}Pct`]}%)</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
