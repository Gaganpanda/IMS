import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import NotificationPopup from "../NotificationPopup/NotificationPopup";
import "./MainLayout.css";

export default function MainLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  // The dashboard is laid out to fill the available viewport exactly (no
  // page-level scrollbar — see Dashboard.css); every other page keeps the
  // normal scrolling <main>.
  const isDashboard = pathname === "/" || pathname === "/dashboard";

  return (
    <div className={`layout${collapsed ? " layout--collapsed" : ""}`}>
      {/* Fixed left sidebar — becomes a slide-in drawer on mobile */}
      <Sidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      {/* Backdrop shown behind the drawer on small screens */}
      {mobileNavOpen && (
        <div
          className="layout__backdrop"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Right: top navbar + scrollable page content */}
      <div className="layout__body">
        <Navbar onMenuClick={() => setMobileNavOpen((v) => !v)} />

        <main className={`layout__main${isDashboard ? " layout__main--fit" : ""}`}>
          <Outlet />
        </main>
      </div>

      {/* Slide-in notification panel (portal-like, fixed) */}
      <NotificationPopup />
    </div>
  );
}
