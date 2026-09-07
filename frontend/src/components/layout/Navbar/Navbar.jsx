import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toggleNotificationPopup } from "../../../redux/slices/notificationSlice";
import { logout } from "../../../redux/slices/authSlice";
import { useTheme } from "../../../context/ThemeContext";
import Icon from "../../common/Icon/Icon";
import "./Navbar.css";

const PAGE_META = {
  "/dashboard":     { title: "Dashboard",      subtitle: "Welcome back, Admin! Here's what's happening today." },
  "/items":         { title: "Items",           subtitle: "Manage, track and monitor all items in the system" },
  "/items/add":     { title: "Add New Item",    subtitle: "Create and manage product information through a guided workflow" },
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

export default function Navbar({ onMenuClick = () => {} }) {
  const dispatch  = useDispatch();
  const { pathname } = useLocation();
  const { user }  = useSelector((s) => s.auth);
  const unreadCount = useSelector((s) => s.notifications?.unreadCount ?? 0);
  const showPopup   = useSelector((s) => s.notifications?.showPopup ?? false);
  const { isDark, toggleTheme } = useTheme();

  // Fire a stronger "vibrate" burst on the bell the moment a *new*
  // notification arrives (unreadCount ticking up), on top of the gentle
  // always-on ring it already does while anything is unread — this is
  // what makes a fresh alert actually catch the eye instead of blending
  // into the same idle animation that's been running the whole session.
  const prevUnreadRef = useRef(unreadCount);
  const [justArrived, setJustArrived] = useState(false);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setJustArrived(true);
      const t = setTimeout(() => setJustArrived(false), 900);
      prevUnreadRef.current = unreadCount;
      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const { title, subtitle } = getPageMeta(pathname);
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AU";

  return (
    <header className="navbar">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        className="navbar__menu-btn press-scale"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Icon name="menu" size={20} />
      </button>

      {/* Left — page title */}
      <div className="navbar__title-block">
        <h1 className="navbar__title">{title}</h1>
        {subtitle && <p className="navbar__subtitle">{subtitle}</p>}
      </div>

      {/* Right — actions */}
      <div className="navbar__actions">
        {/* Theme toggle */}
        <button
          type="button"
          className="navbar__theme-btn press-scale"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <Icon name={isDark ? "sun" : "moon"} size={19} />
        </button>

        {/* Notification bell */}
        <button
          className={`navbar__bell press-scale${showPopup ? " navbar__bell--active" : ""}${unreadCount > 0 ? " navbar__bell--has-unread" : ""}${justArrived ? " navbar__bell--vibrate" : ""}`}
          onClick={() => dispatch(toggleNotificationPopup())}
          aria-label="Notifications"
        >
          <Icon name="bell" size={20} className="navbar__bell-icon" />
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
          <button className="navbar__user-chevron press-scale" onClick={() => dispatch(logout())} title="Logout">
            <Icon name="logOut" size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
