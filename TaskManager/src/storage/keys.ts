/**
 * Single source of truth for every AsyncStorage key the app uses.
 * Centralizing these avoids the classic bug where one file writes
 * 'tasks_cache' and another reads 'taskCache' and nobody notices until
 * "offline mode" silently shows stale/empty data.
 */
export const STORAGE_KEYS = {
  TASKS_CACHE: 'tasks_cache',
  CATEGORIES_CACHE: 'categories_cache',
  STARRED_TASKS: 'starred_tasks',
  LAST_REFRESH_TIME: 'last_refresh_time',
} as const;
