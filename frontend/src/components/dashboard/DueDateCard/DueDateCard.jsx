import { useSelector } from "react-redux";
import { formatDate, daysUntil } from "../../../utils/formatDate";
import "./DueDateCard.css";

function urgencyClass(days) {
  if (days == null) return "due-date-card__badge--neutral";
  if (days < 0)  return "due-date-card__badge--overdue";
  if (days <= 7) return "due-date-card__badge--urgent";
  if (days <= 30) return "due-date-card__badge--soon";
  return "due-date-card__badge--normal";
}

export default function DueDateCard({ onViewAll }) {
  const { upcomingDueDates } = useSelector((s) => s.dashboard);

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
          upcomingDueDates.slice(0, 5).map((item) => {
            const days = daysUntil(item.dueDate);
            return (
              <div key={item.id} className="due-date-card__item">
                <div className="due-date-card__icon">📋</div>
                <div className="due-date-card__body">
                  <span className="due-date-card__name">{item.name}</span>
                  <span className="due-date-card__label">{item.label}</span>
                </div>
                <span className={`due-date-card__badge ${urgencyClass(days)}`}>
                  {formatDate(item.dueDate)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
