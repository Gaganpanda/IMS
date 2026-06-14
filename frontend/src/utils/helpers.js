import { STATUS_BADGE_MAP } from "./constants";

/**
 * Get badge style object for a given status string.
 * Returns { bg, color } or a default grey.
 */
export function getStatusStyle(status) {
  return STATUS_BADGE_MAP[status] || { bg: "#f1f5f9", color: "#475569" };
}

/**
 * Truncate a string to maxLen characters.
 */
export function truncate(str, maxLen = 50) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

/**
 * Format a number with Indian locale (e.g. 1,23,456)
 */
export function formatNumber(n) {
  if (n == null) return "—";
  return Number(n).toLocaleString("en-IN");
}

/**
 * Format a currency amount in INR
 */
export function formatCurrency(amount, symbol = "₹") {
  if (amount == null) return "—";
  return `${symbol} ${Number(amount).toLocaleString("en-IN")}`;
}

/**
 * Capitalise the first letter of a string.
 */
export function capitalise(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Build initials from a full name.
 * "John Doe" → "JD"
 */
export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 2);
}

/**
 * Compute percentage with optional decimal places.
 */
export function percent(part, total, decimals = 1) {
  if (!total) return "0%";
  return ((part / total) * 100).toFixed(decimals) + "%";
}

/**
 * Debounce a function call.
 */
export function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Deep clone a plain object/array (JSON safe).
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove empty/null/undefined keys from an object.
 */
export function cleanParams(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== "" && v != null)
  );
}
