import { useMemo } from 'react';
import { filterTasks, searchTasksByTitle } from '@tasks/utils/filterTasks';
import { sortTasks } from '@tasks/utils/sortTasks';
import { useDebouncedSearch } from '@tasks/hooks/useDebouncedSearch';
import { useTaskStore } from '@tasks/store/taskStore';
import type { SortOption } from '@tasks/types';

/**
 * Composes category/status filtering, debounced title search, and sorting
 * into a single memoized derived list. This is the ONLY place that chains
 * filter -> search -> sort — screens just call this hook and render the
 * result, satisfying requirement 4.4 (no .filter().sort() inline in JSX).
 *
 * `sortOption` is a local UI concern (which sort the user currently has
 * selected) rather than global store state, so it's a parameter here rather
 * than pulled from useTaskStore — this keeps the store focused on server
 * + cache-backed state and keeps "what am I sorting by right now" as
 * ordinary component state in TaskListScreen.
 */
export function useFilteredTasks(sortOption: SortOption) {
  const tasks = useTaskStore(state => state.tasks);
  const filters = useTaskStore(state => state.filters);
  const searchQuery = useTaskStore(state => state.searchQuery);

  const debouncedQuery = useDebouncedSearch(searchQuery, 300);

  return useMemo(() => {
    const filtered = filterTasks(tasks, filters);
    const searched = searchTasksByTitle(filtered, debouncedQuery);
    return sortTasks(searched, sortOption);
  }, [tasks, filters, debouncedQuery, sortOption]);
}
