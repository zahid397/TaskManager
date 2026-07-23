import {
  getStarredMap,
  getTasksCache,
  setStarredMap,
  setTasksCache,
} from '@services/cache';
import type { Task } from '@tasks/types';

/**
 * Bonus test (beyond the 3 required): exercises services/cache.ts against
 * the real @react-native-async-storage/async-storage jest mock (an
 * in-memory Map standing in for the native module - see jest.setup.js),
 * rather than mocking cache.ts itself. This is closer to an integration
 * test of the actual storage contract than the other three, which test
 * pure logic in isolation.
 */
describe('cache service (tasks_cache, starred_tasks round-trip)', () => {
  const sampleTask: Task = {
    id: 'task-1',
    title: 'Read a book',
    description: null,
    categoryId: 'health',
    status: 'open',
    dueDate: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    starred: true,
  };

  it('returns an empty array when nothing has been cached yet', async () => {
    const tasks = await getTasksCache();
    expect(tasks).toEqual([]);
  });

  it('round-trips a task list through tasks_cache unchanged', async () => {
    await setTasksCache([sampleTask]);
    const cached = await getTasksCache();
    expect(cached).toEqual([sampleTask]);
  });

  it('round-trips the starred map through starred_tasks unchanged', async () => {
    await setStarredMap({ 'task-1': true, 'task-2': false });
    const map = await getStarredMap();
    expect(map).toEqual({ 'task-1': true, 'task-2': false });
  });
});
