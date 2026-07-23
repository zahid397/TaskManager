import type { RemoteTask, Task } from '@tasks/types';

/**
 * Converts a raw Supabase row into an app-level Task.
 * `starred` defaults to `false` here — the real starred value is applied
 * afterwards by mergeTasksWithStarred, using the local starred_tasks cache.
 * This function never has access to (and must never invent) starred state.
 */
export function remoteTaskToTask(remote: RemoteTask): Task {
  return {
    id: remote.id,
    title: remote.title,
    description: remote.description,
    categoryId: remote.category_id,
    status: remote.status,
    dueDate: remote.due_date,
    createdAt: remote.created_at,
    updatedAt: remote.updated_at,
    starred: false,
  };
}

export function remoteTasksToTasks(rows: RemoteTask[]): Task[] {
  return rows.map(remoteTaskToTask);
}
