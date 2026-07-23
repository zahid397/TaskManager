import { create } from 'zustand';
import type { Category } from '@categories/types';

interface CategoryStoreState {
  categories: Category[];
  loading: boolean;
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  renameCategoryLocal: (id: string, name: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useCategoryStore = create<CategoryStoreState>(set => ({
  categories: [],
  loading: false,

  setCategories: categories => set({ categories }),

  addCategory: category =>
    set(state => ({ categories: [...state.categories, category] })),

  removeCategory: id =>
    set(state => ({
      categories: state.categories.filter(c => c.id !== id),
    })),

  renameCategoryLocal: (id, name) =>
    set(state => ({
      categories: state.categories.map(c => (c.id === id ? { ...c, name } : c)),
    })),

  setLoading: loading => set({ loading }),
}));
