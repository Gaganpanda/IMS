import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import NotificationPopup from "../NotificationPopup/NotificationPopup";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="layout">
      {/* Fixed left sidebar */}
      <Sidebar />

      {/* Right: top navbar + scrollable page content */}
      <div className="layout__body">
        <Navbar />

        <main className="layout__main">
          <Outlet />
        </main>
      </div>

      {/* Slide-in notification panel (portal-like, fixed) */}
      <NotificationPopup />
    </div>
  );
}
