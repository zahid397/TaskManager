import { supabase } from '@services/supabase';
import { remoteTasksToTasks, remoteTaskToTask } from '@tasks/utils/taskMappers';
import type {
  CreateTaskInput,
  RemoteTask,
  Task,
  UpdateTaskInput,
} from '@tasks/types';

/**
 * All Supabase access for the `tasks` table lives here. Two rules this file
 * enforces on every path, by construction rather than by convention:
 *
 * 1. `starred` NEVER appears in an insert/update payload — it isn't part of
 *    CreateTaskInput/UpdateTaskInput's shape, so there's nothing to
 *    accidentally send even if a caller passed a full Task object in.
 * 2. Every read maps snake_case rows to the app's camelCase Task shape via
 *    remoteTaskToTask, so the rest of the app never sees a RemoteTask.
 */

export class TaskApiError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'TaskApiError';
  }
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new TaskApiError(`Failed to fetch tasks: ${error.message}`, error);
  }
  return remoteTasksToTasks((data ?? []) as RemoteTask[]);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: input.title,
      description: input.description,
      category_id: input.categoryId,
      due_date: input.dueDate,
      status: 'open',
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new TaskApiError(
      `Failed to create task: ${error?.message ?? 'no row returned'}`,
      error,
    );
  }
  return remoteTaskToTask(data as RemoteTask);
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const patch: Partial<RemoteTask> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.categoryId !== undefined) patch.category_id = input.categoryId;
  if (input.dueDate !== undefined) patch.due_date = input.dueDate;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw new TaskApiError(
      `Failed to update task ${id}: ${error?.message ?? 'no row returned'}`,
      error,
    );
  }
  return remoteTaskToTask(data as RemoteTask);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) {
    throw new TaskApiError(`Failed to delete task ${id}: ${error.message}`, error);
  }
}

/** Convenience wrapper: toggling done/open is just an update() with intent. */
export async function setTaskStatus(
  id: string,
  status: 'open' | 'done',
): Promise<Task> {
  return updateTask(id, { status });
}
