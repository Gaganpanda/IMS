import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Tooltip.css";

const GAP = 9;
const EDGE = 12;

/**
 * Tooltip — small, animated, styled replacement for the native `title`
 * attribute (which renders as a slow, unstyled, browser-default box that
 * looks broken against a themed UI — see AlertIcon).
 *
 * Renders its trigger inline. The bubble itself is rendered through a
 * portal into `document.body` and positioned with `position: fixed` using
 * coordinates measured from the trigger — this means it is never clipped
 * by a parent with `overflow: hidden` (rounded cards, scrollable tables,
 * etc). Placement flips above/below based on whichever side actually has
 * more room, and is clamped horizontally so it never runs off-screen.
 */
export default function Tooltip({ content, children, className = "" }) {
  const wrapRef = useRef(null);
  const bubbleRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null); // { top, left, placement, arrowShift }

  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;

    const compute = () => {
      const trigger = wrapRef.current.getBoundingClientRect();
      const bubble = bubbleRef.current;
      const bw = bubble ? bubble.offsetWidth : 240;
      const bh = bubble ? bubble.offsetHeight : 36;

      const spaceAbove = trigger.top;
      const spaceBelow = window.innerHeight - trigger.bottom;
      // Prefer whichever side has more room — avoids overlapping content
      // that sits close above the trigger (e.g. a banner right above a
      // page title) even when there's technically viewport space there.
      const placement =
        spaceAbove >= bh + GAP + EDGE && spaceAbove >= spaceBelow ? "top" : "bottom";

      const top = placement === "top" ? trigger.top - GAP - bh : trigger.bottom + GAP;

      const half = bw / 2;
      const idealLeft = trigger.left + trigger.width / 2;
      let left = idealLeft;
      if (left - half < EDGE) left = EDGE + half;
      else if (left + half > window.innerWidth - EDGE) left = window.innerWidth - EDGE - half;
      const arrowShift = idealLeft - left;

      setPos({ top, left, placement, arrowShift });
    };

    compute();
    // Re-measure once the bubble has actually rendered (real width/height).
    const raf = requestAnimationFrame(compute);

    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  if (!content) return children;

  return (
    <span
      ref={wrapRef}
      className={`tooltip ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open &&
        createPortal(
          <span
            ref={bubbleRef}
            role="tooltip"
            className={`tooltip__bubble tooltip__bubble--${pos ? pos.placement : "top"}`}
            style={{
              position: "fixed",
              top: pos ? pos.top : -9999,
              left: pos ? pos.left : -9999,
              visibility: pos ? "visible" : "hidden",
              "--tt-shift": `${pos ? pos.arrowShift : 0}px`,
            }}
          >
            {content}
          </span>,
          document.body
        )}
    </span>
  );
}
