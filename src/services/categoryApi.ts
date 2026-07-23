import { supabase } from '@services/supabase';
import type { Category, CreateCategoryInput, RemoteCategory } from '@categories/types';

export class CategoryApiError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'CategoryApiError';
  }
}

function remoteToCategory(remote: RemoteCategory): Category {
  return {
    id: remote.id,
    name: remote.name,
    createdAt: remote.created_at,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new CategoryApiError(`Failed to fetch categories: ${error.message}`, error);
  }
  return ((data ?? []) as RemoteCategory[]).map(remoteToCategory);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name: input.name })
    .select('*')
    .single();

  if (error || !data) {
    throw new CategoryApiError(
      `Failed to create category: ${error?.message ?? 'no row returned'}`,
      error,
    );
  }
  return remoteToCategory(data as RemoteCategory);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) {
    throw new CategoryApiError(`Failed to delete category ${id}: ${error.message}`, error);
  }
}

export async function renameCategory(id: string, name: string): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw new CategoryApiError(
      `Failed to rename category ${id}: ${error?.message ?? 'no row returned'}`,
      error,
    );
  }
  return remoteToCategory(data as RemoteCategory);
}
