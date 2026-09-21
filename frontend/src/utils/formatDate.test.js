import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  formatDate,
  formatDateLong,
  formatDateShort,
  timeAgo,
  daysUntil,
  dateGroupLabel,
  toInputDate,
} from "./formatDate";

describe("formatDate", () => {
  it("formats a plain date string as dd/mm/yyyy for en-IN", () => {
    expect(formatDate("2026-05-20")).toBe("20/05/2026");
  });

  it("returns an em dash for falsy input", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
  });

  it("returns an em dash for an unparseable string instead of 'Invalid Date'", () => {
    expect(formatDate("not-a-date")).toBe("—");
  });
});

describe("formatDateShort / formatDateLong", () => {
  it("formats a date-only string without shifting the day", () => {
    // date-only strings intentionally bypass the UTC-aware path — regression
    // guard against ever wiring toUtcAwareDate() into this function, which
    // would risk rolling midnight-local dates back a day.
    expect(formatDateShort("2026-05-20")).toBe("20 May 2026");
  });

  it("does not throw and returns a dash for garbage input", () => {
    expect(formatDateLong("garbage")).toBe("—");
    expect(formatDateShort(undefined)).toBe("—");
  });
});

describe("timeAgo — naive UTC datetime handling (IST regression guard)", () => {
  // The backend sends naive LocalDateTime strings ("2026-07-27T18:14:23.123")
  // with no timezone marker, always meaning UTC. Bug fixed in source: browsers
  // in IST (UTC+5:30) used to read that as *local* time, making brand-new
  // items appear "5 hours ago" instead of "just now". These tests pin that
  // fix so a future edit can't silently reintroduce it.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-27T18:15:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("treats a naive datetime string (no Z, no offset) as UTC", () => {
    // 1 minute before the frozen "now" (18:15:00Z), expressed with no zone marker
    expect(timeAgo("2026-07-27T18:14:00.000")).toBe("1 minute ago");
  });

  it("treats a naive datetime string using a space separator as UTC too", () => {
    expect(timeAgo("2026-07-27 18:14:00")).toBe("1 minute ago");
  });

  it("does NOT re-interpret a string that already carries an explicit Z", () => {
    expect(timeAgo("2026-07-27T18:14:00.000Z")).toBe("1 minute ago");
  });

  it("does NOT re-interpret a string with an explicit numeric offset", () => {
    // 18:14:00+05:30 is 12:44:00 UTC — over 5 hours before frozen "now", so it
    // must NOT be read as "1 minute ago" (which is what the old bug produced
    // for offset-bearing strings misclassified as naive).
    const result = timeAgo("2026-07-27T18:14:00.000+05:30");
    expect(result).not.toBe("1 minute ago");
  });

  it("returns 'just now' for timestamps within the last 10 seconds", () => {
    expect(timeAgo("2026-07-27T18:14:55.000Z")).toBe("just now");
  });

  it("returns an empty string for falsy or invalid input", () => {
    expect(timeAgo(null)).toBe("");
    expect(timeAgo("not-a-date")).toBe("");
  });
});

describe("daysUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-04T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a positive count of days for a future date", () => {
    expect(daysUntil("2026-06-15")).toBe(11);
  });

  it("returns a negative count for a past date", () => {
    expect(daysUntil("2026-05-30")).toBe(-5);
  });

  it("returns 0 for today", () => {
    expect(daysUntil("2026-06-04")).toBe(0);
  });

  it("returns null for missing or invalid input", () => {
    expect(daysUntil(null)).toBeNull();
    expect(daysUntil("nope")).toBeNull();
  });
});

describe("dateGroupLabel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-17T09:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("labels today's date as 'Today'", () => {
    expect(dateGroupLabel("2026-08-17T02:00:00.000Z")).toBe("Today");
  });

  it("labels yesterday as 'Yesterday'", () => {
    expect(dateGroupLabel("2026-08-16T09:00:00.000Z")).toBe("Yesterday");
  });

  it("labels 5 days ago as 'This Week'", () => {
    expect(dateGroupLabel("2026-08-12T09:00:00.000Z")).toBe("This Week");
  });

  it("labels anything older as 'Earlier'", () => {
    expect(dateGroupLabel("2026-07-01T09:00:00.000Z")).toBe("Earlier");
  });

  it("falls back to 'Earlier' for missing/invalid input", () => {
    expect(dateGroupLabel(null)).toBe("Earlier");
    expect(dateGroupLabel("garbage")).toBe("Earlier");
  });
});

describe("toInputDate", () => {
  it("formats a Date object as yyyy-mm-dd for <input type=date>", () => {
    expect(toInputDate(new Date(Date.UTC(2026, 4, 20)))).toBe("2026-05-20");
  });

  it("returns an empty string for missing/invalid input", () => {
    expect(toInputDate(null)).toBe("");
    expect(toInputDate("garbage")).toBe("");
  });
});
