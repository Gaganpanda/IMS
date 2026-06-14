import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import productLogo from "../../../assets/order (1).png";
import "./Sidebar.css";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/items",
    label: "Items",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    to: "/items/add",
    label: "Add Item",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    to: "/notifications",
    label: "Notifications",
    badge: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const unreadCount = useSelector((s) => s.notifications?.unreadCount ?? 0);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AU";

  return (
    <aside className="sidebar">
      {/* Logo */}
     <div className="sidebar__logo">
  <div className="sidebar__logo-icon">
    <img
      src={productLogo}
      alt="Product Management"
      className="sidebar__logo-img"
    />
  </div>

  <div className="sidebar__logo-text">
    <span className="sidebar__logo-title">
      Product Management
    </span>
  </div>
</div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon, badge }) => (
          <NavLink
  key={to}
  to={to}
  end={to === "/dashboard" || to === "/items"}
  className={({ isActive }) =>
    `sidebar__nav-item${
      isActive ? " sidebar__nav-item--active" : ""
    }`
  }
>
            <span className="sidebar__nav-icon">{icon}</span>
            <span className="sidebar__nav-label">{label}</span>
            {badge && unreadCount > 0 && (
              <span className="sidebar__badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div className="sidebar__user">
        <div className="sidebar__user-avatar">{initials}</div>
        <div className="sidebar__user-info">
          <span className="sidebar__user-name">{user?.name || "Admin User"}</span>
          <span className="sidebar__user-role">{user?.role || "Administrator"}</span>
        </div>
        <div className="sidebar__user-status-row">
          <span className="sidebar__status-dot" />
          <span className="sidebar__status-label">Online</span>
        </div>
      </div>
    </aside>
  );
}