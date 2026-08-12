import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStatsAsync } from "../../redux/slices/dashboardSlice";
import { useAuth } from "../../hooks/useAuth";
import StatsCard from "../../components/dashboard/StatsCard/StatsCard";
import ActivityCard from "../../components/dashboard/ActivityCard/ActivityCard";
import DueDateCard from "../../components/dashboard/DueDateCard/DueDateCard";
import {
  DevStatusPieChart,
  TrialsBarChart,
  MonthlyProgressChart,
  IprOverviewChart,
} from "../../components/dashboard/charts/Charts";
import Loader from "../../components/common/Loader/Loader";
import Icon from "../../components/common/Icon/Icon";
import "./Dashboard.css";

const STAT_CARDS = [
  { key: "total",      code: "01", label: "Total Items",        color: "blue",   icon: "box" },
  { key: "developed",  code: "02", label: "Developed",          color: "green",  icon: "checkCircle" },
  { key: "inProgress", code: "03", label: "In Progress",        color: "orange", icon: "clock" },
  { key: "trials",     code: "04", label: "Trials In Progress", color: "purple", icon: "flask" },
  { key: "iprFiled",   code: "05", label: "IPR Filed",          color: "red",    icon: "shieldCheck" },
  { key: "totFilled",  code: "06", label: "ToT Filled",         color: "teal",   icon: "fileCheck" },
];

function SectionHeader({ index, title, meta }) {
  return (
    <div className="dashboard__section-header">
      <span className="dashboard__section-index">{index}</span>
      <h2 className="dashboard__section-title">{title}</h2>
      <span className="dashboard__section-line" />
      {meta && <span className="dashboard__section-meta">{meta}</span>}
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { stats, trialsOverview, monthlyProgress, loading } =
    useSelector((s) => s.dashboard);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    dispatch(fetchDashboardStatsAsync());
  }, [dispatch]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const timeStr = useMemo(
    () => now.toLocaleTimeString("en-GB", { hour12: false }),
    [now]
  );
  const dateStr = useMemo(
    () =>
      now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [now]
  );

  if (loading && !stats) return <Loader variant="page" text="Loading dashboard..." />;

  const firstName = user?.name?.split(" ")?.[0] || "Admin";

  return (
    <div className="dashboard animate-fade-in-up">
      {/* ── Command header ── */}
      <div className="dashboard__header">
        <span className="dashboard__corner dashboard__corner--tl" />
        <span className="dashboard__corner dashboard__corner--br" />

        <div className="dashboard__header-left">
          <div className="dashboard__eyebrow">
            <Icon name="shieldCheck" size={12} strokeWidth={2.4} />
            <span>Defense Asset &amp; IPR Management System</span>
          </div>
          <h1 className="dashboard__title">Operations Dashboard</h1>
          <p className="dashboard__subtitle">
            Welcome back, {firstName}. Consolidated overview of product development, trials and IPR status.
          </p>
        </div>

        <div className="dashboard__header-right">
          <div className="dashboard__status-pill">
            <span className="dashboard__status-dot" />
            System Operational
          </div>
          <div className="dashboard__clock">
            <span className="dashboard__clock-time">{timeStr}</span>
            <span className="dashboard__clock-date">{dateStr}</span>
          </div>
        </div>
      </div>

      {/* ── Top stat cards ── */}
      <SectionHeader index="01" title="Key Metrics" meta={`${STAT_CARDS.length} indicators tracked`} />
      <div className="dashboard__stats stagger-children">
        {STAT_CARDS.map(({ key, code, label, icon, color }) => (
          <StatsCard
            key={key}
            code={code}
            title={label}
            value={stats?.[key] ?? 0}
            subtitle={stats?.[`${key}Pct`] ? `${stats[`${key}Pct`]}% of total` : undefined}
            icon={<Icon name={icon} size={20} strokeWidth={1.9} />}
            color={color}
          />
        ))}
      </div>

      {/* ── Middle row: pie + due dates + activity ── */}
      <SectionHeader index="02" title="Activity &amp; Deadlines" />
      <div className="dashboard__mid">
        <DevStatusPieChart stats={stats} />
        <DueDateCard />
        <ActivityCard />
      </div>

      {/* ── Bottom row: trials bar + monthly area + IPR overview ── */}
      <SectionHeader index="03" title="Trends &amp; Intelligence" />
      <div className="dashboard__bottom">
        <TrialsBarChart data={trialsOverview} />
        <MonthlyProgressChart data={monthlyProgress} />
        <IprOverviewChart stats={stats} />
      </div>

      {/* ── Footer strip ── */}
      <div className="dashboard__footer">
        <span className="dashboard__footer-item">
          <Icon name="hexagon" size={12} strokeWidth={2.2} /> IMS Product Management
        </span>
        <span className="dashboard__footer-dot" />
        <span className="dashboard__footer-item">Data classification: Internal Use Only</span>
        <span className="dashboard__footer-dot" />
        <span className="dashboard__footer-item">Dashboard refreshed on load</span>
      </div>
    </div>
  );
}