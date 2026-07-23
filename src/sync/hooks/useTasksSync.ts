import { useCallback, useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useTaskStore } from '@tasks/store/taskStore';
import { useCategoryStore } from '@categories/store/categoryStore';
import { mergeTasksWithStarred } from '@tasks/utils/mergeTasksWithStarred';
import { fetchTasks } from '@services/taskApi';
import { fetchCategories } from '@services/categoryApi';
import {
  getCategoriesCache,
  getLastRefreshTime,
  getStarredMap,
  getTasksCache,
  setCategoriesCache,
  setLastRefreshTime,
  setTasksCache,
} from '@services/cache';

/**
 * Implements the offline-first load flow exactly as specified:
 *
 *   1. On app open: read tasks_cache from AsyncStorage -> render immediately
 *   2. Check internet via NetInfo
 *   3. If online: fetch fresh tasks from Supabase -> merge with
 *      starred_tasks (local) -> update cache -> update Zustand
 *   4. If offline: show cached tasks + offline indicator, never show a
 *      blank screen
 *
 * The hook exposes `refresh()` so the Task List screen can also trigger
 * step 2-3 manually (pull-to-refresh) without re-running step 1 (there's no
 * need to re-read the cache we already have in memory just to refresh it).
 */
export function useTasksSync() {
  const setTasks = useTaskStore(state => state.setTasks);
  const syncStatus = useTaskStore(state => state.syncStatus);
  const setCategories = useCategoryStore(state => state.setCategories);

  // Guards against a slow initial load overlapping with a user-triggered
  // pull-to-refresh, which could otherwise interleave two writes to the
  // same cache keys in an unpredictable order.
  const isSyncing = useRef(false);

  const refresh = useCallback(async () => {
    if (isSyncing.current) {
      return;
    }
    isSyncing.current = true;
    syncStatus({ loading: true });

    try {
      const netState = await NetInfo.fetch();
      const isOnline = netState.isConnected === true;
      syncStatus({ onlineStatus: isOnline });

      if (!isOnline) {
        // Requirement 4.1: never show a blank screen when offline. The
        // cache was already loaded into the store during the initial load
        // (see loadInitial below), so there's nothing further to do here —
        // explicitly a no-op branch rather than an error, offline is an
        // expected, first-class state, not a failure.
        return;
      }

      const [serverTasks, serverCategories, starredMap] = await Promise.all([
        fetchTasks(),
        fetchCategories(),
        getStarredMap(),
      ]);

      // Requirement 4.3: local-only `starred` must survive a refresh.
      const merged = mergeTasksWithStarred(serverTasks, starredMap);

      await Promise.all([
        setTasksCache(merged),
        setCategoriesCache(serverCategories),
      ]);

      const now = new Date().toISOString();
      await setLastRefreshTime(now);

      setTasks(merged);
      setCategories(serverCategories);
      syncStatus({ lastRefresh: now });
    } catch (error) {
      // A failed background refresh must not clobber what's already on
      // screen — we deliberately do NOT call setTasks([]) or clear the
      // cache here. The user keeps seeing the last-known-good cached data,
      // which is the same "never show blank" guarantee as the offline case.
      console.warn('[sync] Background refresh failed, keeping cached data:', error);
    } finally {
      syncStatus({ loading: false });
      isSyncing.current = false;
    }
  }, [setTasks, setCategories, syncStatus]);

  const loadInitial = useCallback(async () => {
    // Step 1: read cache and render immediately, before any network call.
    const [cachedTasks, cachedCategories, cachedLastRefresh] = await Promise.all([
      getTasksCache(),
      getCategoriesCache(),
      getLastRefreshTime(),
    ]);

    setTasks(cachedTasks);
    setCategories(cachedCategories);
    syncStatus({ lastRefresh: cachedLastRefresh });

    // Steps 2-4: attempt a background refresh on top of what's now on
    // screen. If this fails or the device is offline, `refresh()`'s own
    // early-return / catch block leaves the cached data (just rendered
    // above) exactly as-is.
    await refresh();
  }, [refresh, setTasks, setCategories, syncStatus]);

  useEffect(() => {
    // useEffect callbacks can't be async themselves, so loadInitial (async)
    // is invoked and its own internal try/catch handles failures - this
    // .catch() is just a last-resort net in case something throws before
    // that (e.g. a synchronous error reading from the store).
    loadInitial().catch(err =>
      console.warn('[useTasksSync] Unexpected error during initial load:', err),
    );
    // Intentionally run once on mount only - re-syncing on every render
    // would defeat the point of caching. Pull-to-refresh / reconnect
    // handling call `refresh()` directly instead of re-running this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { refresh };
}
