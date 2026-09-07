import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchNotificationsAsync,
  markAllAsReadAsync,
  markAsReadAsync,
  toggleFavoriteAsync,
  toggleArchivedAsync,
  deleteNotificationAsync,
  deleteAllNotificationsAsync,
} from "../../redux/slices/notificationSlice";
import ConfirmPopup from "../../components/common/ConfirmPopup/ConfirmPopup";
import { timeAgo, dateGroupLabel } from "../../utils/formatDate";
import "./Notifications.css";

/* ── Icon set (matches the app-wide stroke-icon style) ── */
const Icons = {
  bell: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  bellRing: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <path d="M2 8c0-2.2.7-4.1 2-5.5M22 8c0-2.2-.7-4.1-2-5.5" />
    </svg>
  ),
  check: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  checkCirc: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 10 11 15 8 12" />
    </svg>
  ),
  circle: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v5" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  ),
  file: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  ),
  shield: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  upload: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 3v12" />
      <polyline points="7 8 12 3 17 8" />
      <path d="M5 21h14" />
    </svg>
  ),
  cart: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  flask: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 3v5l-4 7a4 4 0 0 0 3.5 6h5a4 4 0 0 0 3.5-6l-4-7V3" />
    </svg>
  ),
  info: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  trash: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  layers: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  alertTriangle: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  search: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  arrowRight: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  x: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  alertCircle: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  fileCheck: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  ),
  clock: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  star: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  starFilled: (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  archive: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="5" rx="1" />
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <line x1="10" y1="13" x2="14" y2="13" />
    </svg>
  ),
  inboxIn: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
};

const TYPE_CONFIG = {
  item_added: { color: "green", icon: "checkCirc", label: "Item Added" },
  status_changed: { color: "purple", icon: "layers", label: "Status Changed" },
  document_filled: { color: "orange", icon: "file", label: "Document Filled" },
  ipr_changed: { color: "red", icon: "shield", label: "IPR Changed" },
  document_upload: {
    color: "blue",
    icon: "upload",
    label: "Document Uploaded",
  },
  procurement: { color: "gold", icon: "cart", label: "Procurement" },
  trial_update: { color: "teal", icon: "flask", label: "Trial Update" },
  feedback_received: { color: "green", icon: "checkCirc", label: "Feedback Received" },
  feedback_overdue: { color: "red", icon: "alertTriangle", label: "Feedback Overdue" },
  sample_pending: { color: "orange", icon: "alertCircle", label: "Sample Pending" },
  tot_validity: { color: "blue", icon: "fileCheck", label: "ToT Validity" },
  dev_completion: { color: "purple", icon: "clock", label: "Dev Completion" },
  general: { color: "grey", icon: "info", label: "General" },
  default: { color: "grey", icon: "bell", label: "Notification" },
};

function NotifIcon({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.default;
  return (
    <div className={`notif-page__icon notif-page__icon--${cfg.color}`}>
      {Icons[cfg.icon]}
    </div>
  );
}

// Notification types that represent a lapsed/pending state worth flagging
// with the same red "urgent" treatment used on the dashboard's due-date
// card — ToT validity that's expired/renewing, feedback that's gone quiet,
// and samples that were never submitted.
const URGENT_TYPES = new Set(["tot_validity", "feedback_overdue", "sample_pending"]);

function isUrgent(n) {
  return !n.read && URGENT_TYPES.has(n.type);
}

export default function Notifications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, unreadCount, loading } = useSelector((s) => s.notifications);
  const [tab, setTab] = useState("all"); // all | archive | favorite
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchNotificationsAsync());
  }, [dispatch]);

  const allCount = list.filter((n) => !n.archived).length;
  const archiveCount = list.filter((n) => n.archived).length;
  const favoriteCount = list.filter((n) => n.favorite).length;

  // Category chips are built from whatever types actually exist in the feed —
  // an enterprise inbox filters by real data, not a hardcoded taxonomy.
  const typeCounts = useMemo(() => {
    const counts = {};
    list.forEach((n) => { counts[n.type] = (counts[n.type] || 0) + 1; });
    return counts;
  }, [list]);

  const availableTypes = useMemo(
    () => Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a]),
    [typeCounts]
  );

  const tabFiltered =
    tab === "archive"
      ? list.filter((n) => n.archived)
      : tab === "favorite"
        ? list.filter((n) => n.favorite)
        : list.filter((n) => !n.archived);

  const readFiltered = unreadOnly ? tabFiltered.filter((n) => !n.read) : tabFiltered;

  const typeFiltered =
    typeFilter === "all" ? readFiltered : readFiltered.filter((n) => n.type === typeFilter);

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? typeFiltered
    : typeFiltered.filter((n) =>
        (n.title || "").toLowerCase().includes(q) ||
        (n.message || "").toLowerCase().includes(q) ||
        (n.itemName || "").toLowerCase().includes(q)
      );

  const handleDeleteAll = async () => {
    setDeleting(true);
    await dispatch(deleteAllNotificationsAsync());
    setDeleting(false);
    setShowDeleteAll(false);
  };

  const openRelatedItem = (n) => {
    if (!n.itemId) return;
    if (!n.read) dispatch(markAsReadAsync(n.id));
    navigate(n.variantId ? `/items/${n.itemId}?variant=${n.variantId}` : `/items/${n.itemId}`);
  };

  // Bucket into enterprise-inbox-style date sections (Today / Yesterday / This Week / Earlier)
  const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Earlier"];
  const groups = GROUP_ORDER.map((label) => ({
    label,
    items: filtered.filter((n) => dateGroupLabel(n.createdAt) === label),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="notif-page animate-fade-in-up">
      {/* Page header */}
      <div className="notif-page__top">
        <div className="notif-page__heading-group">
          <div
            className={`notif-page__heading-icon ${
              unreadCount > 0 ? "notif-page__heading-icon--active" : ""
            }`}>
            {Icons.bellRing}
          </div>
          <div>
            <h1 className="notif-page__heading">Activity Center</h1>
            <p className="notif-page__subheading">
              {list.length} Notification{list.length === 1 ? "" : "s"}
              {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
            </p>
          </div>
        </div>
        <div className="notif-page__header-actions">
          {unreadCount > 0 && (
            <button
              className="notif-page__btn notif-page__btn--secondary"
              onClick={() => dispatch(markAllAsReadAsync())}>
              {Icons.check}
              Mark all as read
            </button>
          )}
          {list.length > 0 && (
            <button
              className="notif-page__btn notif-page__btn--danger"
              onClick={() => setShowDeleteAll(true)}>
              {Icons.trash}
              Delete all
            </button>
          )}
        </div>
      </div>

      {/* Primary tab bar — All / Archive / Favorite, count-first like an inbox */}
      <div className="notif-page__tabbar">
        <button
          type="button"
          className={`notif-page__tab${tab === "all" ? " notif-page__tab--active" : ""}`}
          onClick={() => setTab("all")}>
          <span className="notif-page__tab-count notif-page__tab-count--all">{allCount}</span>
          All
        </button>
        <button
          type="button"
          className={`notif-page__tab${tab === "archive" ? " notif-page__tab--active" : ""}`}
          onClick={() => setTab("archive")}>
          <span className="notif-page__tab-count">{archiveCount}</span>
          Archive
        </button>
        <button
          type="button"
          className={`notif-page__tab${tab === "favorite" ? " notif-page__tab--active" : ""}`}
          onClick={() => setTab("favorite")}>
          <span className="notif-page__tab-count">{favoriteCount}</span>
          Favorite
        </button>

        <label className="notif-page__unread-toggle">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          <span>Unread only ({unreadCount})</span>
        </label>
      </div>

      {/* Search + category filter toolbar */}
      <div className="notif-page__toolbar">
        <div className="notif-page__search">
          <span className="notif-page__search-icon">{Icons.search}</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, product, or message…"
          />
          {query && (
            <button
              type="button"
              className="notif-page__search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search">
              {Icons.x}
            </button>
          )}
        </div>

        {availableTypes.length > 1 && (
          <div className="notif-page__chips">
            <button
              type="button"
              className={`notif-page__chip${typeFilter === "all" ? " notif-page__chip--active" : ""}`}
              onClick={() => setTypeFilter("all")}>
              All categories
            </button>
            {availableTypes.map((t) => {
              const cfg = TYPE_CONFIG[t] || TYPE_CONFIG.default;
              return (
                <button
                  key={t}
                  type="button"
                  className={`notif-page__chip notif-page__chip--${cfg.color}${typeFilter === t ? " notif-page__chip--active" : ""}`}
                  onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}>
                  {cfg.label}
                  <span className="notif-page__chip-count">{typeCounts[t]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Notification list */}
      <div className="notif-page__card">
        <div className="notif-page__card-head">
          <span>
            {tab === "archive"
              ? "Archived notifications"
              : tab === "favorite"
                ? "Favorite notifications"
                : "All notifications"}
            {unreadOnly && " · Unread only"}
            {typeFilter !== "all" && ` · ${(TYPE_CONFIG[typeFilter] || TYPE_CONFIG.default).label}`}
          </span>
          <span className="notif-page__card-head-count">{filtered.length}</span>
        </div>

        {loading ? (
          <div className="notif-page__skeleton" aria-busy="true" aria-label="Loading notifications">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="notif-page__skeleton-row">
                <span className="notif-page__skeleton-bar" />
                <span className="notif-page__skeleton-icon shimmer" />
                <div className="notif-page__skeleton-body">
                  <span className="notif-page__skeleton-line shimmer" style={{ width: "38%" }} />
                  <span className="notif-page__skeleton-line shimmer" style={{ width: "72%" }} />
                </div>
                <span className="notif-page__skeleton-time shimmer" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-page__empty">
            <div className="notif-page__empty-icon">{Icons.bell}</div>
            <p>
              {q || typeFilter !== "all"
                ? "No matching notifications"
                : unreadOnly
                  ? "No unread notifications"
                  : tab === "archive"
                    ? "No archived notifications"
                    : tab === "favorite"
                      ? "No favorite notifications"
                      : "No notifications"}
            </p>
            <span>
              {q || typeFilter !== "all"
                ? "Try a different search term or clear the category filter."
                : tab === "favorite"
                  ? "Tap the star on any notification to pin it here."
                  : "You're all caught up — new activity will show up here."}
            </span>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="notif-page__group">
              <div className="notif-page__group-label">
                <span>{group.label}</span>
                <span className="notif-page__group-count">{group.items.length}</span>
              </div>
              {group.items.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
                const urgent = isUrgent(n);
                return (
                  <div
                    key={n.id}
                    className={`notif-page__item${!n.read ? " notif-page__item--unread" : ""}${urgent ? " notif-page__item--urgent" : ""}`}
                    onClick={() => !n.read && dispatch(markAsReadAsync(n.id))}>
                    <span
                      className={`notif-page__item-bar notif-page__item-bar--${cfg.color}`}
                    />
                    <button
                      type="button"
                      className={`notif-page__item-star${n.favorite ? " notif-page__item-star--active" : ""}`}
                      title={n.favorite ? "Remove from favorites" : "Add to favorites"}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(toggleFavoriteAsync(n.id));
                      }}>
                      {n.favorite ? Icons.starFilled : Icons.star}
                    </button>
                    <NotifIcon type={n.type} />
                    <div className="notif-page__item-body">
                      <div className="notif-page__item-title-row">
                        <span className="notif-page__item-title">{n.title}</span>
                        <span
                          className={`notif-page__item-tag notif-page__item-tag--${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {n.itemName && (
                          <span className="notif-page__item-ref">{n.itemName}</span>
                        )}
                      </div>
                      <div className="notif-page__item-msg">{n.message}</div>
                    </div>
                    <div className="notif-page__item-right">
                      {!n.read && <span className="notif-page__unread-dot" />}
                      <span className="notif-page__item-time">
                        {timeAgo(n.createdAt)}
                      </span>
                      {n.itemId && (
                        <button
                          className="notif-page__item-view"
                          title="Open related item"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRelatedItem(n);
                          }}>
                          View item {Icons.arrowRight}
                        </button>
                      )}
                      <button
                        className="notif-page__item-archive"
                        title={n.archived ? "Unarchive" : "Archive"}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleArchivedAsync(n.id));
                        }}>
                        {n.archived ? Icons.inboxIn : Icons.archive}
                      </button>
                      <button
                        className="notif-page__item-del"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(deleteNotificationAsync(n.id));
                        }}>
                        {Icons.trash}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <div className="notif-page__footer-count">
          Showing {filtered.length} of {list.length} notifications
        </div>
      )}

      <ConfirmPopup
        open={showDeleteAll}
        onClose={() => setShowDeleteAll(false)}
        onConfirm={handleDeleteAll}
        title="Delete All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        confirmLabel="Delete All"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
