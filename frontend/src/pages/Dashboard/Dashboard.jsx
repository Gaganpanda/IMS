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
  IprOverviewChart,
} from "../../components/dashboard/charts/Charts";
import Loader from "../../components/common/Loader/Loader";
import Icon from "../../components/common/Icon/Icon";
import "./Dashboard.css";

const STAT_CARDS = [
  { key: "total",      label: "TOTAL ITEMS",         color: "blue",   icon: "box" },
  { key: "developed",   label: "DEVELOPED",           color: "green",  icon: "checkCircle" },
  { key: "inProgress",  label: "IN PROGRESS",         color: "orange", icon: "clock" },
  { key: "trials",      label: "TRIALS IN PROGRESS",  color: "purple", icon: "flask" },
  { key: "iprFiled",    label: "IPR FILED",           color: "red",    icon: "shieldCheck" },
  { key: "totFilled",   label: "TOT FILLED",          color: "teal",   icon: "fileCheck" },
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, trialsOverview, monthlyProgress, loading } =
    useSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStatsAsync());
  }, [dispatch]);

  if (loading && !stats) return <Loader variant="page" text="Loading dashboard..." />;

  return (
    <div className="dashboard animate-fade-in-up">
      {/* Top stat cards */}
      <div className="dashboard__stats stagger-children">
        {STAT_CARDS.map(({ key, label, icon, color }) => (
          <StatsCard
            key={key}
            title={label}
            value={stats?.[key] ?? 0}
            subtitle={stats?.[`${key}Pct`] ? `${stats[`${key}Pct`]}% of total` : undefined}
            icon={<Icon name={icon} size={22} strokeWidth={1.8} />}
            color={color}
          />
        ))}
      </div>

      {/* Middle row: pie + due dates + activity */}
      <h2 className="dashboard__section-title">Activity &amp; Deadlines</h2>
      <div className="dashboard__mid">
        <DevStatusPieChart stats={stats} />
        <DueDateCard />
        <ActivityCard />
      </div>

      {/* Bottom row: trials bar + monthly area + IPR overview */}
      <h2 className="dashboard__section-title">Trends</h2>
      <div className="dashboard__bottom">
        <TrialsBarChart data={trialsOverview} />
        <MonthlyProgressChart data={monthlyProgress} />
        <IprOverviewChart stats={stats} />
      </div>

      {/* Quick overview strip */}
      {/* <QuickOverview /> */}
    </div>
  );
}
