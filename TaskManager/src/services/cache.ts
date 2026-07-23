import { getItem, setItem } from '@storage/asyncStorage';
import { STORAGE_KEYS } from '@storage/keys';
import type { Task, StarredMap } from '@tasks/types';
import type { Category } from '@categories/types';

/**
 * Domain-level cache API. This is what the rest of the app imports — nothing
 * outside storage/ and services/cache.ts should call AsyncStorage directly.
 * Each function here maps 1:1 to one of the four cache keys in the spec:
 * tasks_cache, categories_cache, starred_tasks, last_refresh_time.
 */

export async function getTasksCache(): Promise<Task[]> {
  const cached = await getItem<Task[]>(STORAGE_KEYS.TASKS_CACHE);
  return cached ?? [];
}

export async function setTasksCache(tasks: Task[]): Promise<void> {
  await setItem(STORAGE_KEYS.TASKS_CACHE, tasks);
}

export async function getCategoriesCache(): Promise<Category[]> {
  const cached = await getItem<Category[]>(STORAGE_KEYS.CATEGORIES_CACHE);
  return cached ?? [];
}

export async function setCategoriesCache(categories: Category[]): Promise<void> {
  await setItem(STORAGE_KEYS.CATEGORIES_CACHE, categories);
}

export async function getStarredMap(): Promise<StarredMap> {
  const cached = await getItem<StarredMap>(STORAGE_KEYS.STARRED_TASKS);
  return cached ?? {};
}

export async function setStarredMap(map: StarredMap): Promise<void> {
  await setItem(STORAGE_KEYS.STARRED_TASKS, map);
}

export async function getLastRefreshTime(): Promise<string | null> {
  return getItem<string>(STORAGE_KEYS.LAST_REFRESH_TIME);
}

export async function setLastRefreshTime(iso: string): Promise<void> {
  await setItem(STORAGE_KEYS.LAST_REFRESH_TIME, iso);
}
