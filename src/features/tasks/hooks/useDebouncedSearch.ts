import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms
 * have passed without `value` changing again.
 *
 * Why debounce the search box at all: without it, every keystroke would
 * immediately re-run filterTasks/sortTasks (and re-render the whole
 * FlatList) on every render. For a fast typist that's a filter pass per
 * ~100-150ms keystroke; debouncing at 300ms means we wait for a short pause
 * in typing before doing the (relatively) expensive work, which is the
 * standard tradeoff between "feels instant" and "doesn't churn the CPU on
 * every keypress" - 300ms is comfortably below the ~400-500ms threshold
 * where a search box starts to feel unresponsive, but long enough to
 * collapse a burst of keystrokes into a single filter pass.
 *
 * Implementation note: the cleanup function clears the *previous* timeout
 * whenever `value` changes before that timeout fired — that's what makes
 * this a debounce (fire only after the pause) rather than a throttle (fire
 * at most once per interval).
 */
export function useDebouncedSearch(value: string, delay: number = 300): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
