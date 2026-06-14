import "./Loader.css";

/**
 * Loader — three variants:
 *  - "page"    : full-page centered spinner (default)
 *  - "inline"  : small inline spinner
 *  - "overlay" : semi-transparent overlay over parent
 */
export default function Loader({ variant = "page", text = "Loading..." }) {
  if (variant === "inline") {
    return (
      <span className="loader loader--inline" aria-label="Loading">
        <span className="loader__ring loader__ring--sm" />
      </span>
    );
  }

  if (variant === "overlay") {
    return (
      <div className="loader loader--overlay" role="status" aria-label="Loading">
        <div className="loader__card">
          <span className="loader__ring" />
          {text && <span className="loader__text">{text}</span>}
        </div>
      </div>
    );
  }

  // "page" variant
  return (
    <div className="loader loader--page" role="status" aria-label="Loading">
      <div className="loader__content">
        <span className="loader__ring" />
        {text && <span className="loader__text">{text}</span>}
      </div>
    </div>
  );
}
