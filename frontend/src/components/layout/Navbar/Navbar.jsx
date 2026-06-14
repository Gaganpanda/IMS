import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toggleNotificationPopup } from "../../../redux/slices/notificationSlice";
import { logout } from "../../../redux/slices/authSlice";
import "./Navbar.css";

const PAGE_META = {
  "/dashboard":     { title: "Dashboard",      subtitle: "Welcome back, Admin! Here's what's happening today." },
  "/items":         { title: "Items",           subtitle: "Manage, track and monitor all items in the system", addItem: true },
  "/items/add":     { title: "Add New Item",    subtitle: "Fill in the details to add a new item" },
  "/notifications": { title: "Notifications",  subtitle: "View all your notifications" },
};

function getPageMeta(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (pathname.includes("/items/") && pathname.includes("/edit"))
    return { title: "Edit Item", subtitle: "Update item information" };
  if (pathname.startsWith("/items/"))
    return { title: "Item Details", subtitle: "Full details of the selected item" };
  return { title: "Dashboard", subtitle: "" };
}

export default function Navbar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const { user }  = useSelector((s) => s.auth);
  const unreadCount = useSelector((s) => s.notifications?.unreadCount ?? 0);
  const showPopup   = useSelector((s) => s.notifications?.showPopup ?? false);

  const { title, subtitle, addItem } = getPageMeta(pathname);
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AU";

  return (
    <header className="navbar">
      {/* Left — page title */}
      <div className="navbar__title-block">
        <h1 className="navbar__title">{title}</h1>
        {subtitle && <p className="navbar__subtitle">{subtitle}</p>}
      </div>

      {/* Right — actions */}
      <div className="navbar__actions">
        {/* {addItem && (
          <button className="navbar__add-btn" onClick={() => navigate("/items/add")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Item
          </button>
        )} */}

        {/* Notification bell */}
        <button
          className={`navbar__bell${showPopup ? " navbar__bell--active" : ""}`}
          onClick={() => dispatch(toggleNotificationPopup())}
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="navbar__bell-badge">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className="navbar__divider" />

        {/* User chip */}
        <div className="navbar__user">
          <div className="navbar__user-avatar">{initials}</div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">{user?.name || "Admin User"}</span>
            <span className="navbar__user-role">{user?.role || "Administrator"}</span>
          </div>
          <button className="navbar__user-chevron" onClick={() => dispatch(logout())} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
