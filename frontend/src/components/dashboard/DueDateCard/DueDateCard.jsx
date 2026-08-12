import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formatDate, daysUntil } from "../../../utils/formatDate";
import "./DueDateCard.css";

function urgencyClass(days) {
  if (days == null) return "due-date-card__badge--neutral";
  if (days < 0)  return "due-date-card__badge--overdue";
  if (days <= 7) return "due-date-card__badge--urgent";
  if (days <= 30) return "due-date-card__badge--soon";
  return "due-date-card__badge--normal";
}

function relativeLabel(days) {
  if (days == null) return "";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `In ${days} days`;
}

const TYPE_ICON = { dev: "🛠️", tot: "📄" };

export default function DueDateCard({ onViewAll }) {
  const { upcomingDueDates } = useSelector((s) => s.dashboard);
  const navigate = useNavigate();

  const openItem = (item) => {
    if (item?.id != null) navigate(`/items/${item.id}`);
  };

  return (
    <div className="due-date-card card">
      <div className="due-date-card__header">
        <h3 className="due-date-card__title">Upcoming Due Dates</h3>
        {onViewAll && (
          <button className="due-date-card__view-all" onClick={onViewAll}>
            View All
          </button>
        )}
      </div>

      <div className="due-date-card__list">
        {upcomingDueDates.length === 0 ? (
          <p className="due-date-card__empty">No upcoming due dates.</p>
        ) : (
          upcomingDueDates.slice(0, 10).map((item) => {
            const days = daysUntil(item.dueDate);
            return (
              <div
                key={`${item.type || "dev"}-${item.id}-${item.dueDate}`}
                className="due-date-card__item due-date-card__item--clickable"
                role="button"
                tabIndex={0}
                onClick={() => openItem(item)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openItem(item); } }}
              >
                <div className={`due-date-card__icon due-date-card__icon--${item.type || "dev"}`}>
                  {TYPE_ICON[item.type] || "📋"}
                </div>
                <div className="due-date-card__body">
                  <span className="due-date-card__name">{item.name}</span>
                  <span className="due-date-card__label">{item.label}</span>
                </div>
                <div className="due-date-card__right">
                  <span className={`due-date-card__badge ${urgencyClass(days)}`}>
                    {formatDate(item.dueDate)}
                  </span>
                  <span className="due-date-card__relative">{relativeLabel(days)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
