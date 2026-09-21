import { describe, it, expect, vi, beforeEach } from "vitest";
import toast from "react-hot-toast";
import axiosInstance from "./axiosInstance";

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

// axiosInstance registers its response interceptor once at import time.
// Reach into axios's internal handler list to invoke that same rejected
// callback directly with a fabricated error, instead of making a real
// network call for every branch.
const rejectedHandler = axiosInstance.interceptors.response.handlers[0].rejected;

function makeError({ status, data, url = "/items/1" } = {}) {
  return {
    config: { url },
    response: status === undefined ? undefined : { status, data },
  };
}

describe("axios response interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("re-rejects the promise so calling code can still catch it", async () => {
    const err = makeError({ status: 404 });
    await expect(rejectedHandler(err)).rejects.toBe(err);
  });

  describe("401 handling", () => {
    it("on a normal API call: clears the token, fires auth:unauthorized, and toasts", async () => {
      sessionStorage.setItem("token", "expired-token");
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      const err = makeError({ status: 401, url: "/items/1" });

      await rejectedHandler(err).catch(() => {});

      expect(sessionStorage.getItem("token")).toBeNull();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: "auth:unauthorized" })
      );
      expect(toast.error).toHaveBeenCalledWith("Session expired. Please login again.");
    });

    it("on the login call itself: shows no toast at all (Login.jsx renders the error inline)", async () => {
      const err = makeError({
        status: 401,
        url: "/auth/login",
        data: { error: "Invalid username or password" },
      });

      await rejectedHandler(err).catch(() => {});

      // Regression guard: a failed login must not toast the same message
      // Login.jsx already shows inline via state.auth.error.
      expect(toast.error).not.toHaveBeenCalled();
      expect(sessionStorage.getItem("token")).toBeNull();
    });
  });

  it("403 shows a single permission-denied toast", async () => {
    await rejectedHandler(makeError({ status: 403 })).catch(() => {});
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      "You don't have permission to perform this action."
    );
  });

  it("404 shows a single not-found toast", async () => {
    await rejectedHandler(makeError({ status: 404 })).catch(() => {});
    expect(toast.error).toHaveBeenCalledWith("Resource not found.");
  });

  describe("409 conflict handling", () => {
    it("shows a toast for a plain 409 with no special code", async () => {
      const err = makeError({ status: 409, data: { error: "Conflict" } });
      await rejectedHandler(err).catch(() => {});
      expect(toast.error).toHaveBeenCalledWith("Conflict");
    });

    it("suppresses the toast for ITEM_STALE (handled by an inline conflict banner)", async () => {
      const err = makeError({
        status: 409,
        data: { error: "stale", code: "ITEM_STALE" },
      });
      await rejectedHandler(err).catch(() => {});
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("suppresses the toast for HAS_DEPENDENCIES (handled by an inline prompt)", async () => {
      const err = makeError({
        status: 409,
        data: { error: "blocked", code: "HAS_DEPENDENCIES" },
      });
      await rejectedHandler(err).catch(() => {});
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe("400 handling", () => {
    it("toasts a plain 400 with only a top-level message", async () => {
      const err = makeError({ status: 400, data: { error: "Bad input" } });
      await rejectedHandler(err).catch(() => {});
      expect(toast.error).toHaveBeenCalledWith("Bad input");
    });

    it("does NOT toast when field-level errors are present (the originating thunk handles it)", async () => {
      const err = makeError({
        status: 400,
        data: { error: "Validation failed", data: { name: "Name is required" } },
      });
      await rejectedHandler(err).catch(() => {});
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  it("shows exactly one toast for an unhandled 5xx status (no double-toast regression)", async () => {
    const err = makeError({ status: 500, data: { error: "Server error" } });
    await rejectedHandler(err).catch(() => {});
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith("Server error");
  });

  it("does not toast at all for a network error / no response (e.g. timeout, offline)", async () => {
    const err = makeError({ status: undefined });
    await rejectedHandler(err).catch(() => {});
    expect(toast.error).not.toHaveBeenCalled();
  });
});
