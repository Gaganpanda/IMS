import "./EmptyState.css";

/**
 * EmptyState
 * Props:
 *  - title       : string
 *  - description : string (optional)
 *  - icon        : string emoji or ReactNode (optional)
 *  - action      : ReactNode — e.g. an "Add Item" button (optional)
 *  - compact     : boolean — smaller padding variant
 */
export default function EmptyState({
  title = "Nothing here yet",
  description,
  icon = "📭",
  action,
  compact = false,
}) {
  return (
    <div className={`empty-state${compact ? " empty-state--compact" : ""}`}>
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      {description && (
        <p className="empty-state__desc">{description}</p>
      )}
      {action && (
        <div className="empty-state__action">{action}</div>
      )}
    </div>
  );
}
