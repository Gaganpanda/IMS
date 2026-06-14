import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchItemsAsync,
  setPage,
  setPageSize,
  setActiveTab,
  setFilters,
  resetFilters,
} from "../../redux/slices/itemSlice";
import { ITEM_TABS, PAGE_SIZE_OPTIONS, SORT_OPTIONS } from "../../utils/constants";
import StatsCard from "../../components/dashboard/StatsCard/StatsCard";
import ItemTable from "../../components/items/ItemTable/ItemTable";
import ItemCard from "../../components/items/ItemCard/ItemCard";
import ItemFilters from "../../components/items/ItemFilters/ItemFilters";
import EmptyState from "../../components/common/EmptyState/EmptyState";
import Loader from "../../components/common/Loader/Loader";
import "./Items.css";

/* ── Pagination ── */
function Pagination({ pagination, onPageChange, onSizeChange }) {
  const { page, totalPages, totalElements, size } = pagination;
  const from = page * size + 1;
  const to   = Math.min((page + 1) * size, totalElements);

  if (totalPages <= 1 && totalElements <= size) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i;
    if (page <= 2) return i;
    if (page >= totalPages - 3) return totalPages - 5 + i;
    return page - 2 + i;
  });

  return (
    <div className="items-page__pagination">
      <span className="items-page__pagination-info">
        Showing {from} to {to} of {totalElements} items
      </span>
      <div className="items-page__pagination-pages">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 0}
          className="items-page__page-btn">‹</button>
        {pages.map((p) => (
          <button key={p} onClick={() => onPageChange(p)}
            className={`items-page__page-btn${p === page ? " items-page__page-btn--active" : ""}`}>
            {p + 1}
          </button>
        ))}
        {totalPages > 5 && page < totalPages - 3 && (
          <>
            <span className="items-page__ellipsis">…</span>
            <button onClick={() => onPageChange(totalPages - 1)}
              className="items-page__page-btn">{totalPages}</button>
          </>
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}
          className="items-page__page-btn">›</button>
      </div>
      <select className="items-page__page-size" value={size}
        onChange={(e) => onSizeChange(Number(e.target.value))}>
        {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} / page</option>)}
      </select>
    </div>
  );
}

/* ── Stats icons (SVG, matching screenshot style) ── */
const STATS = [
  {
    key: "total",
    title: "Total Items",
    color: "blue",
    link: "View all items",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    key: "developed",
    title: "Developed",
    pctKey: "developedPct",
    color: "green",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    key: "inProgress",
    title: "In Progress",
    pctKey: "inProgressPct",
    color: "orange",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: "trials",
    title: "Trials",
    pctKey: "trialsPct",
    color: "purple",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    key: "iprFiled",
    title: "IPR Filed",
    pctKey: "iprFiledPct",
    color: "red",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function Items() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { list, pagination, filters, activeTab, listLoading } = useSelector((s) => s.items);
  const dashStats = useSelector((s) => s.dashboard.stats);
  const [viewMode, setViewMode] = useState("list");
  const [sortVal, setSortVal]   = useState("updatedAt,desc");

  useEffect(() => {
    const [sortBy, sortDir] = sortVal.split(",");
    dispatch(fetchItemsAsync({
      ...filters,
      page:    pagination.page,
      size:    pagination.size,
      sortBy,
      sortDir,
    }));
  }, [dispatch, filters, pagination.page, pagination.size, sortVal]);

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
    const found = ITEM_TABS.find((t) => t.key === tab);
    if (!found) return;
    if (found.filterKey) {
      dispatch(setFilters({ [found.filterKey]: found.filterVal }));
    } else {
      dispatch(resetFilters());
    }
  };

  return (
    <div className="items-page">
      {/* Stats row */}
      <div className="items-page__stats">
        {STATS.map(({ key, title, pctKey, color, icon, link }) => (
          <div key={key} className={`items-stat-card items-stat-card--${color}`}>
            <div className="items-stat-card__icon">{icon}</div>
            <div className="items-stat-card__body">
              <span className="items-stat-card__label">{title}</span>
              <span className="items-stat-card__value">
                {key === "total" ? pagination.totalElements : (dashStats?.[key] ?? "—")}
              </span>
              {pctKey && dashStats?.[pctKey] != null && (
                <span className="items-stat-card__sub">{dashStats[pctKey]}% of total</span>
              )}
              {link && (
                <button className="items-stat-card__link" onClick={() => navigate("/items")}>
                  {link}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="card items-page__table-card">
        {/* Tabs */}
        <div className="items-page__tabs">
          {ITEM_TABS.map((tab) => (
            <button key={tab.key}
              className={`items-page__tab${activeTab === tab.key ? " items-page__tab--active" : ""}`}
              onClick={() => handleTabChange(tab.key)}>
              {tab.label}
              {tab.key === "all" && (
                <span className="items-page__tab-count"> ({pagination.totalElements})</span>
              )}
              {tab.key === "developed" && dashStats?.developed != null && (
                <span className="items-page__tab-count"> ({dashStats.developed})</span>
              )}
              {tab.key === "inProgress" && dashStats?.inProgress != null && (
                <span className="items-page__tab-count"> ({dashStats.inProgress})</span>
              )}
              {tab.key === "trials" && dashStats?.trials != null && (
                <span className="items-page__tab-count"> ({dashStats.trials})</span>
              )}
              {tab.key === "iprFiled" && dashStats?.iprFiled != null && (
                <span className="items-page__tab-count"> ({dashStats.iprFiled})</span>
              )}
            </button>
          ))}

          {/* Sort + view toggle pushed to right */}
          <div className="items-page__tabs-right">
            <span className="items-page__sort-label">Sort by :</span>
            <select className="items-page__sort" value={sortVal}
              onChange={(e) => setSortVal(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="items-page__view-toggle">
              <button
                className={`items-page__view-btn${viewMode === "list" ? " items-page__view-btn--active" : ""}`}
                onClick={() => setViewMode("list")} title="List view">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <button
                className={`items-page__view-btn${viewMode === "grid" ? " items-page__view-btn--active" : ""}`}
                onClick={() => setViewMode("grid")} title="Grid view">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3"  y="3"  width="7" height="7" rx="1" />
                  <rect x="14" y="3"  width="7" height="7" rx="1" />
                  <rect x="3"  y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filters toolbar */}
        <div className="items-page__toolbar">
          <ItemFilters />
        </div>

        {/* Content */}
        {listLoading ? (
          <Loader variant="page" />
        ) : list.length === 0 ? (
          <EmptyState
            title="No items found"
            description="Try adjusting your filters or add a new item to get started."
            action={
              <button className="btn btn--primary" onClick={() => navigate("/items/add")}>
                + Add Item
              </button>
            }
          />
        ) : viewMode === "list" ? (
          <ItemTable items={list} loading={listLoading} />
        ) : (
          <div className="items-page__grid">
            {list.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}

        <Pagination
          pagination={pagination}
          onPageChange={(p) => dispatch(setPage(p))}
          onSizeChange={(s) => dispatch(setPageSize(s))}
        />
      </div>
    </div>
  );
}
