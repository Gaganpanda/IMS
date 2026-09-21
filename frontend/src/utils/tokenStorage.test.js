import { describe, it, expect, beforeEach } from "vitest";
import { tokenStorage } from "./tokenStorage";

describe("tokenStorage — session-scoped, bank-style logout on close", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("stores the token in sessionStorage", () => {
    tokenStorage.set("tok-123");
    expect(sessionStorage.getItem("token")).toBe("tok-123");
  });

  it("never writes the token to localStorage", () => {
    tokenStorage.set("tok-123");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("get() reads back what was set", () => {
    tokenStorage.set("tok-456");
    expect(tokenStorage.get()).toBe("tok-456");
  });

  it("clear() removes the token from sessionStorage", () => {
    tokenStorage.set("tok-789");
    tokenStorage.clear();
    expect(tokenStorage.get()).toBeNull();
  });

  it("get() returns null when nothing has been set", () => {
    expect(tokenStorage.get()).toBeNull();
  });
});
