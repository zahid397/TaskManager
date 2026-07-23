/**
 * Core domain types for the tasks feature.
 *
 * `Task` is the shape the *app* works with — it includes `starred`, which is
 * a purely local, per-device field that is never persisted to Supabase.
 * `RemoteTask` is what actually comes back from / goes to the `tasks` table.
 */

export type TaskStatus = 'open' | 'done';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

/** Shape of a row in the Supabase `tasks` table (snake_case, no `starred`). */
export interface RemoteTask {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * App-level Task: camelCase + `starred`.
 * `starred` is LOCAL ONLY — see mergeTasksWithStarred. It must never be sent
 * back to Supabase (see services/taskApi.ts, which strips it before writes).
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  categoryId: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  starred: boolean;
}

export type SortOption = 'dueDate' | 'createdTime';

export type StatusFilter = 'All' | 'Open' | 'Done';

export interface TaskFilters {
  categoryId: string | null; // null = All categories
  status: StatusFilter;
}

/** Payload for creating a task. `starred` is deliberately excluded — new
 * tasks always start unstarred and starring happens locally afterwards. */
export interface CreateTaskInput {
  title: string;
  description: string | null;
  categoryId: string | null;
  dueDate: string | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput> & {
  status?: TaskStatus;
};

/** Map of taskId -> starred, exactly matching the `starred_tasks` cache key. */
export type StarredMap = Record<string, boolean>;
