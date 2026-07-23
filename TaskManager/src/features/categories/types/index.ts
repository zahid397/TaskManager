export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

/** Shape of a row in the Supabase `categories` table. */
export interface RemoteCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
}
