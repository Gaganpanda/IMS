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
      {/* Sparkline placeholder */}
      <div className="stats-card__sparkline">
  <svg viewBox="0 0 140 32" preserveAspectRatio="none">
    <polyline
      className="stats-card__sparkline-line"
      points="
      0,20
      8,26
      16,17
      24,25
      32,14
      40,23
      48,15
      56,27
      64,12
      72,24
      80,16
      88,26
      96,13
      104,22
      112,14
      120,25
      128,16
      136,22"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>
    </div>
  );
}
