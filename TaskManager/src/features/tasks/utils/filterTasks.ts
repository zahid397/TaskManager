import type { Task, TaskFilters } from '@tasks/types';

/**
 * Pure filter function — takes tasks + filters, returns a new filtered array.
 * Deliberately has zero React dependency so it's trivially unit-testable and
 * reusable outside of any component (see useFilteredTasks, which composes
 * this with sortTasks and the debounced search query).
 */
export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter(task => {
    if (filters.categoryId !== null && task.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.status === 'Open' && task.status !== 'open') {
      return false;
    }
    if (filters.status === 'Done' && task.status !== 'done') {
      return false;
    }
    // filters.status === 'All' matches everything.

    return true;
  });
}

/**
 * Case-insensitive substring match against title, used for the debounced
 * search box. Separated from filterTasks so search and category/status
 * filtering can be tested and reasoned about independently.
 */
export function searchTasksByTitle(tasks: Task[], query: string): Task[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) {
    return tasks;
  }
  return tasks.filter(task => task.title.toLowerCase().includes(trimmed));
}
