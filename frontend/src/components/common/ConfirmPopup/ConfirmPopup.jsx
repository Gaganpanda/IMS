import Modal from "../Modal/Modal";
import Icon from "../Icon/Icon";
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
    danger:  { bg: "var(--color-danger-bg)",  color: "var(--color-danger)",  name: "close" },
    warning: { bg: "var(--color-warning-bg)", color: "var(--color-warning)", name: "alertTriangle" },
    info:    { bg: "var(--color-info-bg)",    color: "var(--color-info)",    name: "info" },
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
          <Icon name={cfg.name} size={24} />
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
