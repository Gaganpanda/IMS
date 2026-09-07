import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  AreaChart,
  Area,
} from "recharts";
import { setFilters, setPage } from "../../../redux/slices/itemSlice";
import "./Charts.css";

/* ─── Shared: click a chart segment → Items page, pre-filtered ───
   Every clickable slice/bar across the dashboard funnels through this so
   the "go look at the underlying items" behavior is consistent everywhere:
   apply the filter patch (clearing anything not specified) and land on
   /items with page reset to the first page. */
function useGoToFilteredItems() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (filterPatch) => {
    dispatch(
      setFilters({
        search: "",
        category: "",
        developmentStatus: "",
        totStatus: "",
        iprStatus: "",
        trialsStatus: "",
        ...filterPatch,
      }),
    );
    dispatch(setPage(0));
    navigate("/items");
  };
}

/* ─── Monthly Item Growth Trend ───
   Cumulative running total of items added across the current year, built
   from the per-month counts the backend already returns. A cumulative line
   reads as a genuine "trend" at a glance — a bar-per-month view just shows
   noisy monthly volume, not whether the catalog is actually growing. */
export function MonthlyTrendChart({ data = [] }) {
  const total = data.reduce((s, d) => s + (d.count || 0), 0);

  let running = 0;
  const cumulative = data.map((d) => {
    running += d.count || 0;
    return { month: d.month, added: d.count || 0, total: running };
  });

  const bestMonth = data.reduce(
    (best, d) => (d.count > (best?.count || 0) ? d : best),
    null,
  );

  return (
    <div className="chart-card card chart-card--wide">
      <div className="chart-card__header">
        <h3 className="chart-card__title">
          Item Growth Trend — {new Date().getFullYear()}
        </h3>
        {total > 0 && (
          <div className="chart-card__trend-meta">
            <span className="chart-card__trend-stat">
              <strong>{total}</strong> items added this year
            </span>
            {bestMonth && bestMonth.count > 0 && (
              <span className="chart-card__trend-stat">
                Busiest: <strong>{bestMonth.month}</strong> ({bestMonth.count})
              </span>
            )}
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="chart-card__empty">
          <span className="chart-card__empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          <span className="chart-card__empty-text">
            No items added yet this year
          </span>
        </div>
      ) : (
        <div className="chart-card__chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={cumulative}
              margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.32}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border-light)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  fontSize: 12,
                  boxShadow: "var(--shadow-md)",
                }}
                formatter={(value, name) => [
                  value,
                  name === "total" ? "Cumulative total" : "Added this month",
                ]}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#trendFill)"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ─── Dev Status Pie ─── */
const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

/* Segment name -> the exact developmentStatus filter value on the Items
   page. "Under Development" / "Not Started" aren't offered in the filter
   dropdown's option list (only "Developed" / "In Progress" are proper
   dropdown choices today), but the underlying filter still matches on
   whatever string it's given, so the click still lands on the right set
   of items even though the select box itself won't show a matching label. */
const DEV_STATUS_FILTER = {
  Developed: "Developed",
  "In Progress": "In Progress",
  "Under Development": "Under Development",
  "Not Started": "Not Started",
};

export function DevStatusPieChart({ stats }) {
  const goToItems = useGoToFilteredItems();
  const data = [
    { name: "Developed", value: stats?.developed || 0 },
    { name: "In Progress", value: stats?.inProgress || 0 },
    { name: "Under Development", value: stats?.underDevelopment || 0 },
    { name: "Not Started", value: stats?.notStarted || 0 },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  const openStatus = (name) =>
    goToItems({ developmentStatus: DEV_STATUS_FILTER[name] });

  return (
    <div className="chart-card card chart-card--dev-status">
      <h3 className="chart-card__title">Items by Development Status</h3>
      <div className="chart-card__body chart-card__body--split">
        <div className="chart-card__donut-wrap chart-card__donut-wrap--dev">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="66%"
                outerRadius="100%"
                dataKey="value"
                paddingAngle={3}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                    cursor="pointer"
                    onClick={() => openStatus(d.name)}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [v, ""]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)",
                  fontSize: 12,
                  boxShadow: "var(--shadow-md)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-card__centre-label">
            <span className="chart-card__centre-val">{total}</span>
            <span className="chart-card__centre-sub">Total Items</span>
          </div>
        </div>
        <div className="chart-card__legend chart-card__legend--side">
          {data.map((d, i) => (
            <button
              key={d.name}
              className="chart-card__legend-item chart-card__legend-item--btn"
              onClick={() => openStatus(d.name)}
              title={`View ${d.name} items`}>
              <span
                className="chart-card__legend-dot"
                style={{ background: PIE_COLORS[i] }}
              />
              <span className="chart-card__legend-name">{d.name}</span>
              <span className="chart-card__legend-val">{d.value}</span>
              <span className="chart-card__legend-pct">
                ({total ? ((d.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Decorative wave filling the leftover space below the donut, like
          the reference design — purely cosmetic, no interaction. Two
          layered fills at real, legible opacity (not the near-invisible
          0.06/0.09 this used to ship at) plus a soft gradient so the wave
          actually reads as a wave instead of a faint grey smudge. */}
      <div className="chart-card__wave" aria-hidden="true">
        <svg
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          width="100%"
          height="100%">
          <defs>
            <linearGradient id="devWaveGradBack" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity="0.22"
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity="0.05"
              />
            </linearGradient>
            <linearGradient id="devWaveGradFront" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity="0.38"
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity="0.10"
              />
            </linearGradient>
          </defs>
          <path
            d="M0,40 C60,10 120,10 180,35 C240,60 300,60 360,30 C380,20 390,18 400,20 L400,80 L0,80 Z"
            fill="url(#devWaveGradBack)"
          />
          <path
            d="M0,55 C70,30 130,55 200,45 C270,35 330,15 400,45 L400,80 L0,80 Z"
            fill="url(#devWaveGradFront)"
          />
        </svg>
      </div>
    </div>
  );
}

/* ─── Trials Status Bar ─── */
const TRIAL_STATUS_COLORS = {
  "Not Started": "#64748b",
  "In Progress": "#3b82f6",
  Completed: "#22c55e",
  Pending: "#a855f7",
};

export function TrialsBarChart({ data = [] }) {
  const goToItems = useGoToFilteredItems();
  const openStatus = (status) => goToItems({ trialsStatus: status });

  return (
    <div className="chart-card card">
      <h3 className="chart-card__title">Trials Status Overview</h3>
      <div className="chart-card__chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="status"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
                fontSize: 12,
                boxShadow: "var(--shadow-md)",
              }}
              cursor={{ fill: "var(--color-surface-alt)" }}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
              cursor="pointer"
              onClick={(d) => openStatus(d.status)}>
              {data.map((d) => (
                <Cell
                  key={d.status}
                  fill={TRIAL_STATUS_COLORS[d.status] || "#94a3b8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── ToT Status Overview — TTD / TNF / TAC / CEC documents → LAToT Signed → Certified ───
   Styled as a labelled progress-track bar chart: each stage gets a full-
   width faint track behind its bar (so short values still read against the
   same scale), a value label printed at the bar's end, and a gradient fill
   per stage that visually separates "documents in motion" (blue family)
   from "signed" (purple) and "certified" (green) — the two milestones that
   actually matter get their own hue instead of blending into the ramp. */
const TOT_STATUS_COLORS = {
  TTD: "#0ea5e9",
  TNF: "#22c1dc",
  TAC: "#0284c7",
  CEC: "#075985",
  "LAToT Signed": "#8b5cf6",
  "ToT Certification": "#16a34a",
};

/* Every stage of the ToT pipeline (TTD/TNF/TAC/CEC/LAToT Signed/ToT
   Certification) is a document-level milestone — the Items page has no
   filter for these individually, so this chart intentionally stays
   read-only (unlike the other dashboard charts, which do drill into a
   matching Items filter). */
function TotBarLabel({ x, y, width, height, value }) {
  if (!value) return null;
  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fontSize={12}
      fontWeight={700}
      fill="var(--color-text-primary)">
      {value}
    </text>
  );
}

export function TotStatusChart({ data = [] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const certified =
    data.find((d) => d.status === "ToT Certification")?.count || 0;
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  // Pad the axis so the end-of-bar value label always has room to breathe,
  // and so a single dominant stage doesn't stretch edge-to-edge.
  const axisMax = Math.ceil(maxCount * 1.22 || 1);

  return (
    <div className="chart-card card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">ToT Status Overview</h3>
        {total > 0 && (
          <span className="chart-card__badge">
            {certified} of {total} certified
          </span>
        )}
      </div>
      {total === 0 ? (
        <div className="chart-card__empty">
          <span className="chart-card__empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </span>
          <span className="chart-card__empty-text">No ToT activity yet</span>
        </div>
      ) : (
        <>
          <div className="chart-card__chart-wrap chart-card__chart-wrap--tot">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                barCategoryGap="18%"
                margin={{ top: 4, right: 34, left: 8, bottom: 0 }}>
                <defs>
                  {data.map((d) => {
                    const c = TOT_STATUS_COLORS[d.status] || "#94a3b8";
                    return (
                      <linearGradient
                        key={d.status}
                        id={`totGrad-${d.status.replace(/\s+/g, "")}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0">
                        <stop offset="0%" stopColor={c} stopOpacity={0.75} />
                        <stop offset="100%" stopColor={c} stopOpacity={1} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <XAxis type="number" domain={[0, axisMax]} hide />
                <YAxis
                  type="category"
                  dataKey="status"
                  width={98}
                  tick={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    fill: "var(--color-text-secondary)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    fontSize: 12,
                    boxShadow: "var(--shadow-md)",
                  }}
                  cursor={{ fill: "var(--color-surface-alt)" }}
                  formatter={(v) => [v, "Records"]}
                />
                <Bar
                  dataKey="count"
                  radius={[7, 7, 7, 7]}
                  maxBarSize={34}
                  background={{ fill: "var(--color-surface-alt)", radius: 7 }}
                  isAnimationActive={false}>
                  {data.map((d) => (
                    <Cell
                      key={d.status}
                      fill={`url(#totGrad-${d.status.replace(/\s+/g, "")})`}
                    />
                  ))}
                  <LabelList dataKey="count" content={TotBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card__legend chart-card__legend--wrap chart-card__legend--grid">
            {data.map((d) => (
              <div key={d.status} className="chart-card__legend-item">
                <span
                  className="chart-card__legend-dot"
                  style={{
                    background: TOT_STATUS_COLORS[d.status] || "#94a3b8",
                  }}
                />
                <span className="chart-card__legend-name">{d.status}</span>
                <span className="chart-card__legend-val">{d.count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── IPR Overview — per-type filed → granted conversion ─── */
const IPR_TYPES = [
  {
    key: "patent",
    label: "Patent",
    filed: { name: "Patent Filed", field: "patentFiledCount" },
    granted: { name: "Patent Granted", field: "patentGrantedCount" },
  },
  {
    key: "trademark",
    label: "Trademark",
    filed: { name: "Trademark Filed", field: "trademarkFiledCount" },
    granted: { name: "Trademark Granted", field: "trademarkGrantedCount" },
  },
  {
    key: "design",
    label: "Design",
    filed: { name: "Design Filed", field: "designFiledCount" },
    granted: { name: "Design Granted", field: "designGrantedCount" },
  },
];

/* ─── IPR Overview ───
   Granted is always a subset of Filed — it's a "how much of what we filed
   actually came through" question, not two independent series. A grouped
   bar (the old design) puts Filed and Granted side by side as if they were
   unrelated quantities, which buries that containment relationship and
   wastes half the chart's width on two separate bar tracks per type.
   A per-type progress/bullet bar — a full-width track sized to Filed, with
   a Granted-colored fill drawn inside it — puts the part-of-whole relationship
   front and center: the fill's length *is* the conversion rate, readable in
   one glance per row, with the exact counts and % printed alongside for
   precision. This is the standard "target vs. actual" chart pattern for
   exactly this kind of nested-progress data. */
export function IprOverviewChart({ stats }) {
  const goToItems = useGoToFilteredItems();

  const data = IPR_TYPES.map((t) => {
    const filed = stats?.[t.filed.field] || 0;
    const granted = stats?.[t.granted.field] || 0;
    return {
      type: t.label,
      filed,
      granted,
      filedName: t.filed.name,
      grantedName: t.granted.name,
      pct: filed > 0 ? Math.min(100, Math.round((granted / filed) * 100)) : 0,
    };
  });

  const totalFiled = data.reduce((s, d) => s + d.filed, 0);
  const totalGranted = data.reduce((s, d) => s + d.granted, 0);
  const total = totalFiled + totalGranted;
  const overallPct = totalFiled > 0 ? Math.round((totalGranted / totalFiled) * 100) : 0;

  // The Items page's iprStatus filter recognizes exact labels like
  // "Patent Filed" / "Patent Granted" — these already match 1:1.
  const openIprStatus = (name) => goToItems({ iprStatus: name });

  return (
    <div className="chart-card card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">IPR Overview</h3>
        {total > 0 && (
          <span className="chart-card__badge">{overallPct}% granted overall</span>
        )}
      </div>

      {total === 0 ? (
        <div className="chart-card__empty">
          <span className="chart-card__empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <path d="M3.27 6.96 12 12.01l8.73-5.05" />
              <path d="M12 22.08V12" />
            </svg>
          </span>
          <span className="chart-card__empty-text">No IPR data yet</span>
        </div>
      ) : (
        <>
          <div className="ipr-progress">
            {data.map((d) => (
              <div key={d.type} className="ipr-progress__row">
                <div className="ipr-progress__label-row">
                  <span className="ipr-progress__type">{d.type}</span>
                  <span className="ipr-progress__counts">
                    <button
                      type="button"
                      className="ipr-progress__count ipr-progress__count--granted"
                      onClick={() => openIprStatus(d.grantedName)}
                      title={`View ${d.grantedName} items`}>
                      {d.granted} granted
                    </button>
                    <span className="ipr-progress__sep">/</span>
                    <button
                      type="button"
                      className="ipr-progress__count ipr-progress__count--filed"
                      onClick={() => openIprStatus(d.filedName)}
                      title={`View ${d.filedName} items`}>
                      {d.filed} filed
                    </button>
                  </span>
                </div>
                <div
                  className="ipr-progress__track"
                  onClick={() => openIprStatus(d.filedName)}
                  title={`${d.type}: ${d.pct}% granted`}
                  role="button">
                  {d.filed === 0 ? (
                    <span className="ipr-progress__track-empty">No filings yet</span>
                  ) : (
                    <span
                      className="ipr-progress__fill"
                      style={{ width: `${Math.max(d.pct, d.granted > 0 ? 6 : 0)}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openIprStatus(d.grantedName);
                      }}>
                      {d.pct >= 18 && <span className="ipr-progress__fill-pct">{d.pct}%</span>}
                    </span>
                  )}
                  {d.pct < 18 && d.filed > 0 && (
                    <span className="ipr-progress__pct-outside">{d.pct}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="chart-card__legend chart-card__legend--wrap chart-card__legend--inline ipr-progress__legend">
            <span className="chart-card__legend-item">
              <span className="chart-card__legend-dot" style={{ background: "var(--color-border-strong)" }} />
              <span className="chart-card__legend-name">Filed (track)</span>
              <span className="chart-card__legend-val">{totalFiled}</span>
            </span>
            <span className="chart-card__legend-item">
              <span className="chart-card__legend-dot" style={{ background: "#22c55e" }} />
              <span className="chart-card__legend-name">Granted (fill)</span>
              <span className="chart-card__legend-val">{totalGranted}</span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
