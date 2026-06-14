import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStatsAsync } from "../../redux/slices/dashboardSlice";
import StatsCard from "../../components/dashboard/StatsCard/StatsCard";
import ActivityCard from "../../components/dashboard/ActivityCard/ActivityCard";
import DueDateCard from "../../components/dashboard/DueDateCard/DueDateCard";
import QuickOverview from "../../components/dashboard/QuickOverview/QuickOverview";
import {
  DevStatusPieChart,
  TrialsBarChart,
  MonthlyProgressChart,
  DocumentationPieChart,
} from "../../components/dashboard/charts/Charts";
import Loader from "../../components/common/Loader/Loader";
import "./Dashboard.css";

const STAT_CARDS = [
  {
    key: "total",
    label: "TOTAL ITEMS",
    color: "blue",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },

  {
    key: "developed",
    label: "DEVELOPED",
    color: "green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12l3 3 5-5"/>
      </svg>
    ),
  },

  {
    key: "inProgress",
    label: "IN PROGRESS",
    color: "orange",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },

  {
    key: "trials",
    label: "TRIALS IN PROGRESS",
    color: "purple",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 3h6"/>
        <path d="M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3"/>
      </svg>
    ),
  },

  {
    key: "iprFiled",
    label: "IPR FILED",
    color: "red",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },

  {
    key: "totFilled",
    label: "TOT FILLED",
    color: "teal",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <path d="M9 13l2 2 4-4"/>
      </svg>
    ),
  },
];
export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, trialsOverview, monthlyProgress, documentationStats, loading } =
    useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStatsAsync());
  }, [dispatch]);

  if (loading && !stats) return <Loader variant="page" text="Loading dashboard..." />;

  return (
    <div className="dashboard">
      {/* Top stat cards */}
      <div className="dashboard__stats">
        {STAT_CARDS.map(({ key, label, icon, color }) => (
          <StatsCard
            key={key}
            title={label}
            value={stats?.[key] ?? 0}
            subtitle={stats?.[`${key}Pct`] ? `${stats[`${key}Pct`]}% of total` : undefined}
            icon={icon}
            color={color}
          />
        ))}
      </div>

      {/* Middle row: pie + due dates + activity */}
      <div className="dashboard__mid">
        <DevStatusPieChart stats={stats} />
        <DueDateCard />
        <ActivityCard />
      </div>

      {/* Bottom row: trials bar + monthly area + doc donut */}
      <div className="dashboard__bottom">
        <TrialsBarChart data={trialsOverview} />
        <MonthlyProgressChart data={monthlyProgress} />
        <DocumentationPieChart docStats={documentationStats} />
      </div>

      {/* Quick overview strip */}
      <QuickOverview />
    </div>
  );
}