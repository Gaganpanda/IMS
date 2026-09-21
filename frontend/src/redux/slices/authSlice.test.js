import { describe, it, expect, beforeEach } from "vitest";
import reducer, {
  logout,
  clearAuthError,
  loginAsync,
  fetchCurrentUserAsync,
  logoutAsync,
} from "./authSlice";

const baseState = { user: null, token: null, loading: false, error: null };

describe("authSlice reducer", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toMatchObject({
      user: null,
      loading: false,
      error: null,
    });
  });

  it("logout clears user/token and removes the stored token", () => {
    sessionStorage.setItem("token", "abc123");
    const state = { ...baseState, user: { id: 1 }, token: "abc123" };
    const next = reducer(state, logout());
    expect(next.user).toBeNull();
    expect(next.token).toBeNull();
    expect(sessionStorage.getItem("token")).toBeNull();
  });

  it("clearAuthError resets only the error field", () => {
    const state = { ...baseState, error: "Login failed", user: { id: 1 } };
    const next = reducer(state, clearAuthError());
    expect(next.error).toBeNull();
    expect(next.user).toEqual({ id: 1 });
  });

  it("loginAsync.pending sets loading and clears any previous error", () => {
    const state = { ...baseState, error: "old error" };
    const next = reducer(state, { type: loginAsync.pending.type });
    expect(next.loading).toBe(true);
    expect(next.error).toBeNull();
  });

  it("loginAsync.fulfilled stores the token and user, clears loading", () => {
    const state = { ...baseState, loading: true };
    const next = reducer(state, {
      type: loginAsync.fulfilled.type,
      payload: { token: "tok-1", user: { id: 5, username: "admin" } },
    });
    expect(next.loading).toBe(false);
    expect(next.token).toBe("tok-1");
    expect(next.user).toEqual({ id: 5, username: "admin" });
  });

  it("loginAsync.rejected stores the error message and clears loading", () => {
    const state = { ...baseState, loading: true };
    const next = reducer(state, {
      type: loginAsync.rejected.type,
      payload: "Invalid credentials",
    });
    expect(next.loading).toBe(false);
    expect(next.error).toBe("Invalid credentials");
  });

  describe("fetchCurrentUserAsync — session should only end on a real 401/403", () => {
    it("fulfilled stores the user", () => {
      const next = reducer(baseState, {
        type: fetchCurrentUserAsync.fulfilled.type,
        payload: { id: 1, username: "admin" },
      });
      expect(next.user).toEqual({ id: 1, username: "admin" });
    });

    it("rejected with a 401 payload logs the user out", () => {
      sessionStorage.setItem("token", "stale-token");
      const state = { ...baseState, user: { id: 1 }, token: "stale-token" };
      const next = reducer(state, {
        type: fetchCurrentUserAsync.rejected.type,
        payload: { status: 401, message: "Unauthorized" },
      });
      expect(next.user).toBeNull();
      expect(next.token).toBeNull();
      expect(sessionStorage.getItem("token")).toBeNull();
    });

    it("rejected with a 403 payload logs the user out", () => {
      const state = { ...baseState, user: { id: 1 }, token: "tok" };
      const next = reducer(state, {
        type: fetchCurrentUserAsync.rejected.type,
        payload: { status: 403, message: "Forbidden" },
      });
      expect(next.user).toBeNull();
      expect(next.token).toBeNull();
    });

    it("rejected with NO status (network error/timeout) keeps the session intact", () => {
      sessionStorage.setItem("token", "still-valid-token");
      const state = { ...baseState, user: { id: 1 }, token: "still-valid-token" };
      const next = reducer(state, {
        type: fetchCurrentUserAsync.rejected.type,
        payload: { status: undefined, message: undefined },
      });
      expect(next.user).toEqual({ id: 1 });
      expect(next.token).toBe("still-valid-token");
      expect(sessionStorage.getItem("token")).toBe("still-valid-token");
    });

    it("rejected with a 500 keeps the session intact", () => {
      const state = { ...baseState, user: { id: 1 }, token: "tok" };
      const next = reducer(state, {
        type: fetchCurrentUserAsync.rejected.type,
        payload: { status: 500, message: "Server error" },
      });
      expect(next.user).toEqual({ id: 1 });
      expect(next.token).toBe("tok");
    });
  });

  it("logoutAsync.fulfilled clears user and token", () => {
    const state = { ...baseState, user: { id: 1 }, token: "tok" };
    const next = reducer(state, { type: logoutAsync.fulfilled.type });
    expect(next.user).toBeNull();
    expect(next.token).toBeNull();
  });
});
