import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import productLogo from "../../../assets/logo-hexagon.webp";
import Icon from "../../common/Icon/Icon";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/dashboard",     label: "Dashboard",     icon: "grid" },
  { to: "/items",         label: "Items",         icon: "box" },
  { to: "/items/add",     label: "Add Item",      icon: "plus" },
  { to: "/notifications", label: "Notifications", icon: "bell", badge: true },
];

export default function Sidebar({
  mobileOpen = false,
  onClose = () => {},
  collapsed = false,
  onToggleCollapse = () => {},
}) {
  const { user } = useSelector((s) => s.auth);
  const unreadCount = useSelector((s) => s.notifications?.unreadCount ?? 0);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AU";

  return (
    <aside
      className={`sidebar${mobileOpen ? " sidebar--open" : ""}${collapsed ? " sidebar--collapsed" : ""}`}>
      {/* Collapse / expand slide button */}
      <button
        type="button"
        className="sidebar__toggle-btn press-scale"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        <Icon name="back" size={16} strokeWidth={2.4} />
      </button>

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
          <span className="sidebar__logo-title">Product Management</span>
        </div>

        <button
          type="button"
          className="sidebar__close-btn press-scale"
          onClick={onClose}
          aria-label="Close menu">
          <Icon name="close" size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard" || to === "/items"}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar__nav-item${isActive ? " sidebar__nav-item--active" : ""}`
            }>
            <span className="sidebar__nav-icon"><Icon name={icon} size={19} /></span>
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
          <span className="sidebar__user-name">
            {user?.name || "Admin User"}
          </span>
          <span className="sidebar__user-role">
            {user?.role || "Administrator"}
          </span>
        </div>
        <div className="sidebar__user-status-row">
          <span className="sidebar__status-dot" />
          <span className="sidebar__status-label">Online</span>
        </div>
      </div>
    </aside>
  );
}
