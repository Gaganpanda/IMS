import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUserAsync } from "../redux/slices/authSlice";
import { fetchNotificationsAsync } from "../redux/slices/notificationSlice";
import MainLayout from "../components/layout/MainLayout/MainLayout";
import Loader from "../components/common/Loader/Loader";

/* ── Lazy pages ── */
const Dashboard     = lazy(() => import("../pages/Dashboard/Dashboard"));
const Items         = lazy(() => import("../pages/Items/Items"));
const ItemDetails   = lazy(() => import("../pages/Items/ItemDetails"));
const AddItem       = lazy(() => import("../pages/Items/AddItem"));
const EditItem      = lazy(() => import("../pages/Items/EditItem"));
const Notifications = lazy(() => import("../pages/Notifications/Notifications"));
const Login         = lazy(() => import("../pages/Auth/Login"));

/* ── Guard: redirect unauthenticated users ── */
function RequireAuth({ children }) {
  const token = useSelector((s) => s.auth.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/* ── Guard: redirect authenticated users away from login ── */
function PublicOnly({ children }) {
  const token = useSelector((s) => s.auth.token);
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

/* ── Bootstrap: runs once on mount to restore session + start polling ── */
function AppBootstrap() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token    = useSelector((s) => s.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUserAsync());
      dispatch(fetchNotificationsAsync());
    }
  }, [token, dispatch]);

  /* Listen for 401 events from axios interceptor */
  useEffect(() => {
    const handler = () => navigate("/login", { replace: true });
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [navigate]);

  /* Poll notifications every 60 s while logged in */
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => dispatch(fetchNotificationsAsync()), 60_000);
    return () => clearInterval(id);
  }, [token, dispatch]);

  return null;
}

export default function AppRoutes() {
  return (
    <>
      <AppBootstrap />
      <Suspense fallback={<Loader variant="page" text="Loading..." />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />

          {/* Protected — nested under MainLayout */}
          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/items"          element={<Items />} />
            <Route path="/items/add"      element={<AddItem />} />
            <Route path="/items/:id"      element={<ItemDetails />} />
            <Route path="/items/:id/edit" element={<EditItem />} />
            <Route path="/notifications"  element={<Notifications />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
