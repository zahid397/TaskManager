import type { StarredMap, Task } from '@tasks/types';

/**
 * Merges fresh server tasks with the locally-cached starred map.
 *
 * This is the single piece of logic that guarantees requirement 4.3: a
 * background refresh must never silently un-star something the user starred
 * on this device, because the server has no concept of "starred" at all —
 * it isn't a column in the `tasks` table, so a fresh fetch always comes back
 * with every task effectively un-starred until this function runs.
 *
 * Contract:
 * - Every task in `serverTasks` gets `starred: starredMap[id] ?? false`.
 * - Tasks are otherwise untouched (no other field is read from the map).
 * - If a task no longer exists on the server (deleted elsewhere), it simply
 *   isn't in `serverTasks` and therefore isn't in the output either — the
 *   stray key in the map, if the caller doesn't clean it up, is harmless and
 *   just goes unused. Callers that want to garbage-collect old ids can use
 *   `pruneStarredMap` below (not required by the current write flow, since
 *   deletes are always author-initiated and already updated below, but
 *   useful if the server-side data changes for other reasons).
 */
export function mergeTasksWithStarred(
  serverTasks: Task[],
  starredMap: StarredMap,
): Task[] {
  return serverTasks.map(task => ({
    ...task,
    starred: starredMap[task.id] ?? false,
  }));
}

/**
 * Drops starred-map entries for task ids that no longer exist in the given
 * task list. Not required by the spec (which explicitly says refresh must
 * NOT remove starred state), so this is opt-in and only ever called after a
 * task is actually deleted via the app's own delete flow — never as part of
 * a background refresh.
 */
export function pruneStarredMap(
  starredMap: StarredMap,
  existingTasks: Task[],
): StarredMap {
  const existingIds = new Set(existingTasks.map(t => t.id));
  const pruned: StarredMap = {};
  for (const [id, isStarred] of Object.entries(starredMap)) {
    if (existingIds.has(id)) {
      pruned[id] = isStarred;
    }
  }
  return pruned;
}
