import { STATUS_BADGE_MAP } from "../../../utils/constants";
import "./StatusBadge.css";

/**
 * StatusBadge
 * Renders a coloured pill badge for any status string.
 * Props:
 *  - status : string  (e.g. "Developed", "Patent Filed")
 *  - size   : "sm" | "md"  (default "md")
 */
export default function StatusBadge({ status, label, size = "md" }) {
  if (!status) return null;

  const variant = STATUS_BADGE_MAP[status] || "neutral";

  return (
    <span className={`status-badge status-badge--${size} status-badge--${variant}`}>
      <span className="status-badge__dot" />
      {label || status}
    </span>
  );
}
