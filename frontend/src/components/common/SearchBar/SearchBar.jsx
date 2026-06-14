import { useState, useEffect, useRef } from "react";
import "./SearchBar.css";

/**
 * SearchBar
 * Props:
 *  - value       : string
 *  - onChange    : (val: string) => void   — called after debounce
 *  - placeholder : string
 *  - debounce    : number ms  (default 400)
 *  - autoFocus   : boolean
 *  - className   : string
 */
export default function SearchBar({
  value: externalValue = "",
  onChange,
  placeholder = "Search...",
  debounce = 400,
  autoFocus = false,
  className = "",
}) {
  const [localValue, setLocalValue] = useState(externalValue);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  /* Sync external value when it resets (e.g. filter reset) */
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  /* Debounce the onChange call */
  const handleChange = (e) => {
    const val = e.target.value;
    setLocalValue(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange?.(val);
    }, debounce);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange?.("");
    inputRef.current?.focus();
  };

  /* Cleanup */
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className={`searchbar ${className}`}>
      {/* Search icon */}
      <span className="searchbar__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="text"
        className="searchbar__input"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />

      {/* Clear button */}
      {localValue && (
        <button
          className="searchbar__clear"
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
