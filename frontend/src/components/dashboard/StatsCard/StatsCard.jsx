import "./StatsCard.css";

/**
 * StatsCard
 * Props:
 *  - title    : string
 *  - value    : number | string
 *  - subtitle : string  (e.g. "63.7% of total")
 *  - icon     : ReactNode
 *  - color    : "blue" | "green" | "orange" | "purple" | "red" | "teal"
 *  - code     : string  (optional metric id shown top-right, e.g. "01")
 */
export default function StatsCard({ title, value, subtitle, icon, color = "blue", code }) {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <span className="stats-card__corner stats-card__corner--tl" />
      <span className="stats-card__corner stats-card__corner--br" />
      <span className="stats-card__watermark">{icon}</span>

      <div className="stats-card__top">
        <div className="stats-card__icon">{icon}</div>
        {code && <span className="stats-card__code">M-{code}</span>}
      </div>

      <div className="stats-card__info">
        <span className="stats-card__value">{value ?? "—"}</span>
        <span className="stats-card__title">{title}</span>
        {subtitle && <span className="stats-card__subtitle">{subtitle}</span>}
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