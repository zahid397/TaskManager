import type { SortOption, Task } from '@tasks/types';

/**
 * Pure sort function. Returns a NEW array (never mutates the input) — this
 * matters because the input is often the Zustand store's `tasks` array
 * directly, and mutating it in place (Array.prototype.sort does mutate)
 * would silently corrupt store state out from under other subscribers.
 *
 * Sort rules:
 * - 'dueDate': tasks with a due date first (ascending, soonest first), tasks
 *   with no due date pushed to the end. This is a deliberate product choice —
 *   an undated task isn't "due infinitely far in the future" or "already
 *   overdue", it's just unscheduled, so it shouldn't interleave with dated
 *   tasks at either extreme.
 * - 'createdTime': newest first (descending), matching how the Task List
 *   mockup and most task apps show "most recently added" at the top.
 */
export function sortTasks(tasks: Task[], sortOption: SortOption): Task[] {
  const copy = [...tasks];

  if (sortOption === 'dueDate') {
    return copy.sort((a, b) => {
      if (a.dueDate === null && b.dueDate === null) return 0;
      if (a.dueDate === null) return 1; // a has no due date -> goes after b
      if (b.dueDate === null) return -1; // b has no due date -> goes after a
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  // 'createdTime'
  return copy.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
