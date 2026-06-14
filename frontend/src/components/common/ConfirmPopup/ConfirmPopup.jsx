import Modal from "../Modal/Modal";
import "./ConfirmPopup.css";

/**
 * ConfirmPopup
 * Props:
 *  - open         : boolean
 *  - onClose      : () => void
 *  - onConfirm    : () => void
 *  - title        : string
 *  - message      : string
 *  - confirmLabel : string  (default "Confirm")
 *  - cancelLabel  : string  (default "Cancel")
 *  - variant      : "danger" | "warning" | "info"  (default "danger")
 *  - loading      : boolean
 */
export default function ConfirmPopup({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) {
  const ICON = {
    danger:  { bg: "#fee2e2", color: "#dc2626", svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /> },
    warning: { bg: "#fef9c3", color: "#ca8a04", svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /> },
    info:    { bg: "#dbeafe", color: "#2563eb", svg: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  };

  const cfg = ICON[variant] || ICON.danger;

  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose>
      <div className="confirm-popup">
        {/* Icon */}
        <div
          className="confirm-popup__icon"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            {cfg.svg}
          </svg>
        </div>

        {/* Text */}
        <h3 className="confirm-popup__title">{title}</h3>
        {message && <p className="confirm-popup__message">{message}</p>}

        {/* Actions */}
        <div className="confirm-popup__actions">
          <button
            className="confirm-popup__btn confirm-popup__btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={`confirm-popup__btn confirm-popup__btn--confirm confirm-popup__btn--${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="confirm-popup__spinner" />
            ) : null}
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
