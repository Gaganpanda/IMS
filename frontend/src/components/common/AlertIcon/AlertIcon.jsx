import Tooltip from "../Tooltip/Tooltip";
import "./AlertIcon.css";

/**
 * Small triangular warning icon used to flag overdue dates (feedback not
 * received in time, ToT validity expired, etc). `message` is shown in a
 * themed floating Tooltip on hover/focus — not the native `title`
 * attribute, which renders as a slow, unstyled OS tooltip that looks like
 * a rendering bug against the rest of the (dark, styled) UI.
 */
export default function AlertIcon({ message, className = "" }) {
  if (!message) return null;
  return (
    <Tooltip content={message}>
      <span
        className={`alert-icon ${className}`}
        role="img"
        aria-label={message}
        tabIndex={0}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
    </Tooltip>
  );
}
