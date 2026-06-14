/**
 * Format a date string/Date object into various display formats.
 * Uses Intl for zero-dependency formatting.
 */

/**
 * formatDate("2026-05-20") → "20/05/2026"
 */
export function formatDate(value, locale = "en-IN") {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * formatDateLong("2026-05-20T10:30:00") → "10 May 2026, 10:30 AM"
 */
export function formatDateLong(value, locale = "en-IN") {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * formatDateShort("2026-05-20") → "20 May 2025"
 */
export function formatDateShort(value, locale = "en-IN") {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * timeAgo("2026-05-20T08:00:00") → "2 hours ago"
 */
export function timeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  const now = Date.now();
  const diff = now - date.getTime(); // ms

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  const months  = Math.floor(days / 30);
  const years   = Math.floor(days / 365);

  if (seconds < 10)  return "just now";
  if (seconds < 60)  return `${seconds} seconds ago`;
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60)  return `${minutes} minutes ago`;
  if (hours === 1)   return "1 hour ago";
  if (hours < 24)    return `${hours} hours ago`;
  if (days === 1)    return "1 day ago";
  if (days < 30)     return `${days} days ago`;
  if (months === 1)  return "1 month ago";
  if (months < 12)   return `${months} months ago`;
  if (years === 1)   return "1 year ago";
  return `${years} years ago`;
}

/**
 * daysUntil("2026-06-15") → 11
 * Returns negative if date is in the past.
 */
export function daysUntil(value) {
  if (!value) return null;
  const target = new Date(value);
  if (isNaN(target.getTime())) return null;
  const diff = target.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * toInputDate(new Date()) → "2026-05-20"  (for <input type="date">)
 */
export function toInputDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}
