import { useSelector } from "react-redux";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
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
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [v, ""]} />
          </PieChart>
        </ResponsiveContainer>
        {/* Centre label */}
        <div className="chart-card__centre-label">
          <span className="chart-card__centre-val">{total}</span>
          <span className="chart-card__centre-sub">Total Items</span>
        </div>
      </div>
      {/* Legend */}
      <div className="chart-card__legend">
        {data.map((d, i) => (
          <div key={d.name} className="chart-card__legend-item">
            <span className="chart-card__legend-dot" style={{ background: PIE_COLORS[i] }} />
            <span className="chart-card__legend-name">{d.name}</span>
            <span className="chart-card__legend-val">{d.value}</span>
            <span className="chart-card__legend-pct">
              ({total ? ((d.value / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Trials Status Bar ─── */
const BAR_COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#22c55e", "#a855f7"];

export function TrialsBarChart({ data = [] }) {
  return (
    <div className="chart-card card">
      <h3 className="chart-card__title">Trials Status Overview</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
            cursor={{ fill: "#f8fafc" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
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
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#progressGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#2563eb" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Documentation Donut ─── */
const DOC_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

export function DocumentationPieChart({ docStats }) {
  const data = [
    { name: "Completed",    value: docStats?.completed    || 0 },
    { name: "In Progress",  value: docStats?.inProgress   || 0 },
    { name: "Pending",      value: docStats?.pending      || 0 },
    { name: "To Be Uploaded", value: docStats?.toBeUploaded || 0 },
  ].filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="chart-card card">
      <h3 className="chart-card__title">Documentation Status</h3>
      <div className="chart-card__body">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3}>
              {data.map((_, i) => <Cell key={i} fill={DOC_COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v) => [v, ""]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-card__centre-label">
          <span className="chart-card__centre-val">{total}</span>
          <span className="chart-card__centre-sub">Total Docs</span>
        </div>
      </div>
      <div className="chart-card__legend">
        {data.map((d, i) => (
          <div key={d.name} className="chart-card__legend-item">
            <span className="chart-card__legend-dot" style={{ background: DOC_COLORS[i] }} />
            <span className="chart-card__legend-name">{d.name}</span>
            <span className="chart-card__legend-val">{d.value}</span>
            <span className="chart-card__legend-pct">
              ({total ? ((d.value / total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
