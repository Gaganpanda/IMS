import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./DropdownMenu.css";

const MENU_WIDTH_ESTIMATE = 170;
const MENU_MARGIN = 8;

/**
 * Kebab / three-dot dropdown that portals its menu to <body> and positions
 * itself with fixed coordinates computed from the trigger button. Because it
 * lives outside any scrollable/overflow ancestor, it can never be clipped —
 * and it automatically opens upward when there isn't enough room below.
 */
export default function DropdownMenu({ trigger, children, align = "end", open, onOpenChange, menuClassName = "" }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setOpen = (v) => {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  };

  const place = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuHeightEstimate = 140;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeightEstimate && rect.top > spaceBelow;

    let left = align === "end" ? rect.right - MENU_WIDTH_ESTIMATE : rect.left;
    left = Math.max(MENU_MARGIN, Math.min(left, window.innerWidth - MENU_WIDTH_ESTIMATE - MENU_MARGIN));

    setPos({
      left,
      top: openUp ? null : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : null,
    });
  };

  const toggle = () => {
    if (!isOpen) place();
    setOpen(!isOpen);
  };

  const close = () => setOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    place();
    const reposition = () => place();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        className="ddm__trigger"
        onClick={(e) => { e.stopPropagation(); toggle(); }}
      >
        {trigger}
      </button>

      {isOpen && pos && createPortal(
        <>
          <div className="ddm__backdrop" onClick={close} />
          <div
            className={`ddm__menu ${menuClassName}`}
            style={{ left: pos.left, top: pos.top ?? "auto", bottom: pos.bottom ?? "auto" }}
            onClick={(e) => { e.stopPropagation(); close(); }}
          >
            {children}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
