import { useEffect, useRef } from "react";
import "./Modal.css";

/**
 * Modal
 * Props:
 *  - open       : boolean
 *  - onClose    : () => void
 *  - title      : string (optional)
 *  - size       : "sm" | "md" | "lg" | "xl"  (default "md")
 *  - children   : ReactNode
 *  - hideClose  : boolean (hide X button)
 */
export default function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
  hideClose = false,
}) {
  const panelRef = useRef(null);

  /* Lock body scroll */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Escape key closes */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={panelRef}
        className={`modal__panel modal__panel--${size}`}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="modal__header">
            {title && <h3 className="modal__title">{title}</h3>}
            {!hideClose && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
