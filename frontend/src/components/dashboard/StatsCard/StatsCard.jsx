import "./StatsCard.css";

/**
 * StatsCard
 * Props:
 *  - title    : string
 *  - value    : number | string
 *  - subtitle : string  (e.g. "63.7% of total")
 *  - icon     : ReactNode
 *  - color    : "blue" | "green" | "orange" | "purple" | "red" | "teal"
 *  - trend    : number  (optional sparkline placeholder)
 */
export default function StatsCard({ title, value, subtitle, icon, color = "blue" }) {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__top">
        <div className="stats-card__icon">{icon}</div>
        <div className="stats-card__info">
          <span className="stats-card__title">{title}</span>
          <span className="stats-card__value">{value ?? "—"}</span>
          {subtitle && <span className="stats-card__subtitle">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}
