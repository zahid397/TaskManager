import { create } from 'zustand';
import { setStarredMap, setTasksCache } from '@services/cache';
import type { StatusFilter, Task, TaskFilters } from '@tasks/types';

interface TaskStoreState {
  // --- state (exactly as specified) ---
  tasks: Task[];
  filters: TaskFilters;
  searchQuery: string;
  loading: boolean;
  lastRefresh: string | null;
  onlineStatus: boolean;

  // --- actions (exactly as specified) ---
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleStar: (id: string) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSearch: (query: string) => void;
  syncStatus: (status: {
    loading?: boolean;
    lastRefresh?: string | null;
    onlineStatus?: boolean;
  }) => void;

  // --- category filter shortcut used by the UI (thin wrapper over setFilters) ---
  setCategoryFilter: (categoryId: string | null) => void;
  setStatusFilter: (status: StatusFilter) => void;
}

export const useTaskStore = create<TaskStoreState>((set, get) => ({
  tasks: [],
  filters: { categoryId: null, status: 'All' },
  searchQuery: '',
  loading: false,
  lastRefresh: null,
  onlineStatus: true,

  setTasks: tasks => set({ tasks }),

  addTask: task => set(state => ({ tasks: [task, ...state.tasks] })),

  updateTask: (id, patch) =>
    set(state => ({
      tasks: state.tasks.map(t => (t.id === id ? { ...t, ...patch } : t)),
    })),

  deleteTask: id =>
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) })),

  /**
   * Starring is LOCAL ONLY (requirement: never sent to Supabase). This
   * action updates the in-memory store immediately for a snappy UI AND
   * persists the change to the starred_tasks AsyncStorage key + refreshes
   * tasks_cache so a killed-and-reopened app still remembers the star
   * without needing a network round trip.
   *
   * Note this is the one place a "fire and forget" async write is
   * acceptable even though the rest of the app's write flow is
   * request-then-update-cache: starring has no backend request to wait on
   * in the first place, so there's no success/failure branch to speak of.
   */
  toggleStar: id => {
    const nextTasks = get().tasks.map(t =>
      t.id === id ? { ...t, starred: !t.starred } : t,
    );
    set({ tasks: nextTasks });

    const starredMap = nextTasks.reduce<Record<string, boolean>>((acc, t) => {
      acc[t.id] = t.starred;
      return acc;
    }, {});

    // Intentionally not awaited: toggling a star is a synchronous, local-only
    // UI update (see class doc above) with no request/response to wait on.
    // .catch() (rather than the `void` operator) both satisfies the linter
    // and makes sure a write failure is at least logged instead of silently
    // swallowed.
    setStarredMap(starredMap).catch(err =>
      console.warn('[taskStore] Failed to persist starred_tasks:', err),
    );
    setTasksCache(nextTasks).catch(err =>
      console.warn('[taskStore] Failed to persist tasks_cache:', err),
    );
  },

  setFilters: filters =>
    set(state => ({ filters: { ...state.filters, ...filters } })),

  setCategoryFilter: categoryId =>
    set(state => ({ filters: { ...state.filters, categoryId } })),

  setStatusFilter: status =>
    set(state => ({ filters: { ...state.filters, status } })),

  setSearch: query => set({ searchQuery: query }),

  syncStatus: status =>
    set(state => ({
      loading: status.loading ?? state.loading,
      lastRefresh: status.lastRefresh ?? state.lastRefresh,
      onlineStatus: status.onlineStatus ?? state.onlineStatus,
    })),
}));
