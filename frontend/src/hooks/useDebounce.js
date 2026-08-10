import { useState, useEffect } from "react";

/**
 * useDebounce
 * Returns a debounced version of the value that only updates
 * after the specified delay has elapsed.
 *
 * @param {any}    value  - The value to debounce
 * @param {number} delay  - Delay in ms (default 400)
 * @returns {any}  debounced value
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
