import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { formatDate, daysUntil } from "../../../utils/formatDate";
import Icon from "../../common/Icon/Icon";
import Modal from "../../common/Modal/Modal";
import "./DueDateCard.css";

function urgencyClass(days) {
  if (days == null) return "due-date-card__badge--neutral";
  if (days < 0)  return "due-date-card__badge--overdue";
  if (days <= 10) return "due-date-card__badge--urgent";
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

const TYPE_ICON = { dev: "tool", tot: "fileCheck" };

/* Single row — shared between the compact card list and the "View All"
   modal so both always look and behave identically. */
function DueDateRow({ item, onOpen }) {
  const days = daysUntil(item.dueDate);
  const urgency = urgencyClass(days).replace("due-date-card__badge--", "");
  const isFlashing = urgency === "overdue" || urgency === "urgent";
  return (
    <div
      className={`due-date-card__item due-date-card__item--clickable${isFlashing ? ` due-date-card__item--${urgency}` : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(item); } }}
    >
      <div className={`due-date-card__icon due-date-card__icon--${urgency} due-date-card__icon--${item.type || "dev"}`}>
        <Icon name={TYPE_ICON[item.type] || "clock"} size={16} strokeWidth={2.2} />
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
}

export default function DueDateCard() {
  const { upcomingDueDates } = useSelector((s) => s.dashboard);
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const openItem = (item) => {
    if (item?.id != null) navigate(`/items/${item.id}`);
  };

  // Backend already returns these sorted soonest/most-overdue first; sort
  // again defensively client-side so the urgency order always holds even
  // if the array is ever mutated or re-ordered upstream.
  const sorted = [...upcomingDueDates].sort((a, b) => {
    const da = daysUntil(a.dueDate);
    const db = daysUntil(b.dueDate);
    if (da == null) return 1;
    if (db == null) return -1;
    return da - db;
  });

  const flaggedCount = sorted.filter((item) => {
    const d = daysUntil(item.dueDate);
    return d != null && d <= 10;
  }).length;

  const visible = sorted.slice(0, 6);

  return (
    <div className="due-date-card card">
      <div className="due-date-card__header">
        <div className="due-date-card__title-row">
          <h3 className="due-date-card__title">Upcoming Due Dates</h3>
          {flaggedCount > 0 && (
            <span className="due-date-card__flag-count" title={`${flaggedCount} due within 10 days or overdue`}>
              {flaggedCount}
            </span>
          )}
        </div>
        {sorted.length > 0 && (
          <button className="due-date-card__view-all" onClick={() => setShowAll(true)}>
            View All
          </button>
        )}
      </div>

      <div className="due-date-card__list">
        {sorted.length === 0 ? (
          <p className="due-date-card__empty">No upcoming due dates.</p>
        ) : (
          visible.map((item) => (
            <DueDateRow key={`${item.type || "dev"}-${item.id}-${item.dueDate}`} item={item} onOpen={openItem} />
          ))
        )}
      </div>

      <Modal open={showAll} onClose={() => setShowAll(false)} title="Upcoming Due Dates" size="lg">
        <div className="due-date-card__list due-date-card__list--modal">
          {sorted.map((item) => (
            <DueDateRow key={`modal-${item.type || "dev"}-${item.id}-${item.dueDate}`} item={item} onOpen={openItem} />
          ))}
        </div>
      </Modal>
    </div>
  );
}
