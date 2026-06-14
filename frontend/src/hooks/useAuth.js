import { useSelector, useDispatch } from "react-redux";
import { loginAsync, logoutAsync, clearAuthError } from "../redux/slices/authSlice";

/**
 * useAuth — exposes auth state and actions
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((s) => s.auth);

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    isAdmin:  user?.role === "ADMIN",
    login:    (credentials) => dispatch(loginAsync(credentials)),
    logout:   ()            => dispatch(logoutAsync()),
    clearError: ()          => dispatch(clearAuthError()),
  };
}
