import { filterTasks, searchTasksByTitle } from '@tasks/utils/filterTasks';
import { sortTasks } from '@tasks/utils/sortTasks';
import type { Task } from '@tasks/types';

/**
 * Test 1 of 3 required (the assessment explicitly requires this one):
 * filter and sort logic — category filter, status filter, and both sort
 * orders (due date, created time).
 */

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'task-default',
    title: 'Untitled',
    description: null,
    categoryId: null,
    status: 'open',
    dueDate: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    starred: false,
    ...overrides,
  };
}

describe('filterTasks', () => {
  const tasks: Task[] = [
    makeTask({ id: '1', title: 'Design mobile app UI', categoryId: 'work', status: 'open' }),
    makeTask({ id: '2', title: 'Buy groceries', categoryId: 'personal', status: 'open' }),
    makeTask({ id: '3', title: 'Morning workout', categoryId: 'health', status: 'done' }),
    makeTask({ id: '4', title: 'Prepare project report', categoryId: 'work', status: 'done' }),
  ];

  it('returns every task when filters are "All" and no category is selected', () => {
    const result = filterTasks(tasks, { categoryId: null, status: 'All' });
    expect(result).toHaveLength(4);
  });

  it('filters by category id only', () => {
    const result = filterTasks(tasks, { categoryId: 'work', status: 'All' });
    expect(result.map(t => t.id)).toEqual(['1', '4']);
  });

  it('filters by status "Open" only', () => {
    const result = filterTasks(tasks, { categoryId: null, status: 'Open' });
    expect(result.map(t => t.id)).toEqual(['1', '2']);
  });

  it('filters by status "Done" only', () => {
    const result = filterTasks(tasks, { categoryId: null, status: 'Done' });
    expect(result.map(t => t.id)).toEqual(['3', '4']);
  });

  it('combines category AND status filters (both must match)', () => {
    const result = filterTasks(tasks, { categoryId: 'work', status: 'Done' });
    expect(result.map(t => t.id)).toEqual(['4']);
  });

  it('returns an empty array when nothing matches, without throwing', () => {
    const result = filterTasks(tasks, { categoryId: 'nonexistent-category', status: 'All' });
    expect(result).toEqual([]);
  });

  it('does not mutate the original tasks array', () => {
    const original = [...tasks];
    filterTasks(tasks, { categoryId: 'work', status: 'All' });
    expect(tasks).toEqual(original);
  });
});

describe('searchTasksByTitle', () => {
  const tasks: Task[] = [
    makeTask({ id: '1', title: 'Design mobile app UI' }),
    makeTask({ id: '2', title: 'Buy groceries' }),
  ];

  it('matches case-insensitively on a substring', () => {
    const result = searchTasksByTitle(tasks, 'MOBILE');
    expect(result.map(t => t.id)).toEqual(['1']);
  });

  it('returns all tasks for an empty/whitespace query', () => {
    expect(searchTasksByTitle(tasks, '')).toHaveLength(2);
    expect(searchTasksByTitle(tasks, '   ')).toHaveLength(2);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchTasksByTitle(tasks, 'zzz-no-match')).toEqual([]);
  });
});

describe('sortTasks', () => {
  const tasks: Task[] = [
    makeTask({
      id: 'no-due-date',
      dueDate: null,
      createdAt: '2026-01-03T00:00:00.000Z',
    }),
    makeTask({
      id: 'due-later',
      dueDate: '2026-05-20T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
    }),
    makeTask({
      id: 'due-sooner',
      dueDate: '2026-05-18T00:00:00.000Z',
      createdAt: '2026-01-02T00:00:00.000Z',
    }),
  ];

  it('sorts by due date ascending, with undated tasks pushed to the end', () => {
    const result = sortTasks(tasks, 'dueDate');
    expect(result.map(t => t.id)).toEqual(['due-sooner', 'due-later', 'no-due-date']);
  });

  it('sorts by created time descending (newest first)', () => {
    const result = sortTasks(tasks, 'createdTime');
    expect(result.map(t => t.id)).toEqual(['no-due-date', 'due-sooner', 'due-later']);
  });

  it('does not mutate the input array (returns a new array)', () => {
    const original = [...tasks];
    const result = sortTasks(tasks, 'dueDate');
    expect(tasks).toEqual(original); // input untouched
    expect(result).not.toBe(tasks); // genuinely a different array
  });

  it('handles an empty array without throwing', () => {
    expect(sortTasks([], 'dueDate')).toEqual([]);
    expect(sortTasks([], 'createdTime')).toEqual([]);
  });
});
