import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import "./Charts.css";

/* ─── Dev Status Pie ─── */
const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

export function DevStatusPieChart({ stats }) {
  const data = [
    { name: "Developed",         value: stats?.developed        || 0 },
    { name: "In Progress",       value: stats?.inProgress       || 0 },
    { name: "Under Development", value: stats?.underDevelopment || 0 },
    { name: "Not Started",       value: stats?.notStarted       || 0 },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="chart-card card">
      <h3 className="chart-card__title">Items by Development Status</h3>
      <div className="chart-card__body">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => [v, ""]} contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: 12, boxShadow: "var(--shadow-md)" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-card__centre-label">
          <span className="chart-card__centre-val">{total}</span>
          <span className="chart-card__centre-sub">Total Items</span>
        </div>
      </div>
      <div className="chart-card__legend">
        {data.map((d, i) => (
          <div key={d.name} className="chart-card__legend-item">
            <span className="chart-card__legend-dot" style={{ background: PIE_COLORS[i] }} />
            <span className="chart-card__legend-name">{d.name}</span>
            <span className="chart-card__legend-val">{d.value}</span>
            <span className="chart-card__legend-pct">({total ? ((d.value / total) * 100).toFixed(1) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Trials Status Bar ─── */
const BAR_COLORS = ["#64748b", "#3b82f6", "#f59e0b", "#22c55e", "#a855f7"];

export function TrialsBarChart({ data = [] }) {
  return (
    <div className="chart-card card">
      <h3 className="chart-card__title">Trials Status Overview</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
          <XAxis dataKey="status" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: 12, boxShadow: "var(--shadow-md)" }} cursor={{ fill: "var(--color-surface-alt)" }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Monthly Progress Area ─── */
export function MonthlyProgressChart({ data = [] }) {
  return (
    <div className="chart-card card">
      <h3 className="chart-card__title">Monthly Progress Overview</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: 12, boxShadow: "var(--shadow-md)" }} />
          <Area type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#progressGrad)" dot={false} activeDot={{ r: 5, fill: "var(--color-primary-dark)" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── IPR Overview — per-type filed/granted breakdown ─── */
const IPR_TYPE_COLORS = {
  "Patent Filed":      "#6d28d9",
  "Patent Granted":    "#a78bfa",
  "Trademark Filed":   "#0369a1",
  "Trademark Granted": "#7dd3fc",
  "Design Filed":      "#b45309",
  "Design Granted":    "#fcd34d",
};

const IPR_TYPES = [
  {
    key: "patent",
    label: "Patent",
    filed:   { name: "Patent Filed",   field: "patentFiledCount" },
    granted: { name: "Patent Granted", field: "patentGrantedCount" },
  },
  {
    key: "trademark",
    label: "Trademark",
    filed:   { name: "Trademark Filed",   field: "trademarkFiledCount" },
    granted: { name: "Trademark Granted", field: "trademarkGrantedCount" },
  },
  {
    key: "design",
    label: "Design",
    filed:   { name: "Design Filed",   field: "designFiledCount" },
    granted: { name: "Design Granted", field: "designGrantedCount" },
  },
];

export function IprOverviewChart({ stats }) {
  const [selected, setSelected] = React.useState("patent");

  const typeConfig = IPR_TYPES.find((t) => t.key === selected);

  const data = [
    { name: typeConfig.filed.name,   value: stats?.[typeConfig.filed.field]   || 0 },
    { name: typeConfig.granted.name, value: stats?.[typeConfig.granted.field] || 0 },
  ].filter((d) => d.value > 0);

  const typeTotal = (stats?.[typeConfig.filed.field] || 0) + (stats?.[typeConfig.granted.field] || 0);

  return (
    <div className="chart-card card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">IPR Overview</h3>
        <div className="chart-card__type-tabs">
          {IPR_TYPES.map((t) => (
            <button
              key={t.key}
              className={`chart-card__type-tab${selected === t.key ? " chart-card__type-tab--active" : ""}`}
              onClick={() => setSelected(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {typeTotal === 0 ? (
        <div className="chart-card__empty">
          <span className="chart-card__empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <path d="M3.27 6.96 12 12.01l8.73-5.05" />
              <path d="M12 22.08V12" />
            </svg>
          </span>
          <span className="chart-card__empty-text">No {typeConfig.label} IPR data yet</span>
        </div>
      ) : (
        <>
          <div className="chart-card__body">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={68}
                  dataKey="value"
                  paddingAngle={4}
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={IPR_TYPE_COLORS[d.name] || "var(--color-text-muted)"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [v, ""]}
                  contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-primary)", fontSize: 12, boxShadow: "var(--shadow-md)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-card__centre-label">
              <span className="chart-card__centre-val">{typeTotal}</span>
              <span className="chart-card__centre-sub">{typeConfig.label}</span>
            </div>
          </div>
          <div className="chart-card__legend">
            {data.map((d) => (
              <div key={d.name} className="chart-card__legend-item">
                <span className="chart-card__legend-dot" style={{ background: IPR_TYPE_COLORS[d.name] }} />
                <span className="chart-card__legend-name">{d.name.replace(typeConfig.label + " ", "")}</span>
                <span className="chart-card__legend-val">{d.value}</span>
                <span className="chart-card__legend-pct">
                  ({typeTotal ? ((d.value / typeTotal) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
