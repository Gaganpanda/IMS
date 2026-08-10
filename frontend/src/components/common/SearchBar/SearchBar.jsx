import { useState, useEffect, useRef } from "react";
import Icon from "../Icon/Icon";
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
        <Icon name="search" size={18} />
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
          className="searchbar__clear press-scale"
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
        >
          <Icon name="close" size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
