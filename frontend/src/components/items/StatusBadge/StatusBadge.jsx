import { STATUS_BADGE_MAP } from "../../../utils/constants";
import "./StatusBadge.css";

/**
 * StatusBadge
 * Renders a coloured pill badge for any status string.
 * Props:
 *  - status : string  (e.g. "Developed", "Patent Filed")
 *  - size   : "sm" | "md"  (default "md")
 */
export default function StatusBadge({ status, size = "md" }) {
  if (!status) return null;

  const style = STATUS_BADGE_MAP[status] || { bg: "#f1f5f9", color: "#475569" };

  return (
    <span
      className={`status-badge status-badge--${size}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}
