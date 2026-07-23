# Task Manager (React Native, offline-first)

A production-quality task manager built for the Mid-Level React Native Engineer assessment: create/edit/delete tasks, assign categories, mark complete/reopen, filter and sort, debounced search, and a per-device "starred" flag — all backed by a local-first cache with a Supabase backend.

## Table of Contents
- [Setup](#setup)
- [Backend: schema and seed data](#backend-schema-and-seed-data)
- [Architecture overview](#architecture-overview)
- [Local storage choice: AsyncStorage](#local-storage-choice-asyncstorage)
- [State management choice: Zustand](#state-management-choice-zustand)
- [How starred is preserved across a refresh](#how-starred-is-preserved-across-a-refresh)
- [Offline-first flow](#offline-first-flow)
- [Write flow (create/edit/delete/complete)](#write-flow-createeditdeletecomplete)
- [Filter/sort outside the render tree](#filtersort-outside-the-render-tree)
- [Testing approach](#testing-approach)
- [Known limitations](#known-limitations)
- [What I'd do differently with another day](#what-id-do-differently-with-another-day)
- [AI usage note](#ai-usage-note)
- [Interview prep notes](#interview-prep-notes)

## Setup

Prerequisites: Node 18+, a React Native development environment set up for at least one platform ([official guide](https://reactnative.dev/docs/set-up-your-environment)), and a free [Supabase](https://supabase.com) project.

```bash
# 1. Install JS dependencies
npm install

# 2. iOS only - install native pods
cd ios && bundle install && bundle exec pod install && cd ..

# 3. Configure environment
cp .env.example .env
# then edit .env and fill in SUPABASE_URL / SUPABASE_ANON_KEY
# (Supabase dashboard -> your project -> Settings -> API)

# 4. Set up the database (see next section) - run supabase/schema.sql then
#    supabase/seed.sql in the Supabase SQL Editor

# 5. Run it
npm run android
# or
npm run ios
```

Run the test suite (does not require a configured backend or a device/emulator):

```bash
npm test          # 31 tests, 4 suites
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Backend: schema and seed data

Backend: **Supabase** (hosted Postgres + auto-generated REST API via `@supabase/supabase-js`). Chosen because the assessment listed it as the default and it needs zero backend code to stand up — create a project, run two SQL files, and the schema/RLS/seed data are done.

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor -> New query** -> paste the full contents of [`supabase/schema.sql`](./supabase/schema.sql) -> **Run**.
3. New query again -> paste [`supabase/seed.sql`](./supabase/seed.sql) -> **Run**.
4. **Settings -> API** -> copy the Project URL and `anon` `public` key into your `.env`.

**Schema** (see `supabase/schema.sql` for the full, commented version):

```
categories: id (uuid, pk), name (text, unique), created_at (timestamptz)
tasks:      id (uuid, pk), title (text), description (text, nullable),
            category_id (uuid, fk -> categories, nullable),
            status (text: 'open' | 'done'), due_date (timestamptz, nullable),
            created_at (timestamptz), updated_at (timestamptz, auto-updated by trigger)
```

Indexes on `category_id`, `status`, `due_date`, and `created_at` support the filter/sort operations. There is deliberately **no `starred` column** — see [How starred is preserved](#how-starred-is-preserved-across-a-refresh).

**RLS**: enabled with permissive `anon`-role policies (`using (true)`), documented inline in `schema.sql`, since authentication is explicitly out of scope for this assessment. The comment in that file spells out the exact change needed if auth is added later (a `user_id` column + `auth.uid() = user_id` policies).

**Seed data** (`supabase/seed.sql`): 3 categories (Work, Personal, Health) and 9 tasks with deliberately mixed status/dates — some overdue, some upcoming, one far-future, one with **no due date at all** (to exercise the "undated tasks sort last" rule for real, not just in the unit test), 5 open / 4 done, spread across all three categories. Re-running the seed script is safe — it's guarded with `where not exists` per task and `on conflict` for categories.

## Architecture overview

```
src/
  app/navigation/       RootStackParamList + RootNavigator (single stack navigator)
  features/
    tasks/
      components/       TaskItem (memoized), StarButton, StatusBadge, SearchBar,
                         FilterBar, SortControls, CategoryPicker, EmptyState, ErrorBanner
      screens/           TaskListScreen, TaskDetailScreen, TaskFormScreen
      hooks/             useDebouncedSearch, useFilteredTasks
      utils/             filterTasks, sortTasks, mergeTasksWithStarred, taskMappers
      store/             taskStore (Zustand)
      types/
    categories/          screens/ store/ types/ (same shape, smaller)
  sync/
    components/          OfflineBanner, SyncStatusBar
    hooks/                useNetworkStatus (NetInfo -> store), useTasksSync (the
                          offline-first load/refresh flow)
  services/               supabase.ts, taskApi.ts, categoryApi.ts, cache.ts
  storage/                asyncStorage.ts (generic wrapper), keys.ts (key constants)
  utils/                  date.ts (relative time / formatting)
  theme/                  shared colors/spacing/typography tokens
  tests/                  the 4 test files (see Testing approach)
```

Layering rule followed throughout: **screens call hooks/store actions -> hooks/actions call services -> services call Supabase or AsyncStorage.** No screen imports `@supabase/supabase-js` or `AsyncStorage` directly — that indirection is what makes the star-merge and cache-write-only-on-success rules enforceable in one place each, instead of re-implemented (and potentially re-broken) in every screen.

Navigation is a **single stack navigator** (`TaskList -> TaskDetail`, `TaskList -> TaskForm`, `TaskList -> Categories`), matching the tech-stack requirement exactly. The Categories screen is reached via a header button rather than a bottom tab bar — the brief asks for 4 screens on a stack, not a tab layout, so that's what's built.

## Local storage choice: AsyncStorage

**AsyncStorage**, as suggested in the brief. Reasoning: the cached dataset here is a few dozen JSON-serializable tasks/categories plus a small starred-id map — well within AsyncStorage's comfortable range, and it needs zero native setup beyond the one community package already in the required tech stack. MMKV is meaningfully faster and supports synchronous reads, which matters once you're storing megabytes of data or need to read on every render — neither applies here (the async round-trip cache read is a one-time cost at app launch, not a per-frame cost). SQLite would earn its complexity if this needed real queries (`WHERE`/`JOIN`/pagination) against the *cache itself* — but all filtering/sorting/searching already happens in memory against the in-flight `Task[]` array (see [Filter/sort outside the render tree](#filtersort-outside-the-render-tree)), so the cache's only job is "persist this array, read it back" — exactly AsyncStorage's sweet spot.

## State management choice: Zustand

**Zustand**, per the brief's suggested options. Reasoning: Redux Toolkit's action/reducer/selector ceremony is disproportionate for one feature's worth of state; Context + `useReducer` works but re-renders every consumer on any state change unless you hand-split contexts, which is exactly the boilerplate Zustand avoids by letting each component subscribe to only the slice it needs (e.g. `useTaskStore(state => state.loading)` re-renders only on `loading` changes, not on every `tasks` mutation). TanStack Query is genuinely excellent for the *server* half of this problem (caching, background refetch, retries) — but it manages a request/response cache, not arbitrary client state, and this app also needs to hold UI-only state (filters, search query, sort — plus a `starred` field TanStack Query would never know exists, since it doesn't come from the server). Zustand's single store comfortably holds both without needing two libraries stitched together.

## How starred is preserved across a refresh

The `starred` field is **never sent to or read from Supabase** — there's no `starred` column in the `tasks` table at all. Instead:

1. `toggleStar(id)` (in `taskStore.ts`) flips the flag in memory and persists a `{ [taskId]: boolean }` map to the `starred_tasks` AsyncStorage key. No network request happens at all for this action.
2. Every time fresh data arrives from Supabase (`fetchTasks()` in `taskApi.ts`), each row comes back through `remoteTaskToTask()` with `starred: false` — the server literally cannot say otherwise, since it has no concept of the field.
3. `mergeTasksWithStarred(serverTasks, starredMap)` (`src/features/tasks/utils/mergeTasksWithStarred.ts`) is the single place that reconciles the two: it maps over the fresh server tasks and sets `starred: starredMap[task.id] ?? false` on each one. This function runs on **every** background refresh, inside `useTasksSync.refresh()`, before the merged result is written to cache or the store.

```ts
export function mergeTasksWithStarred(serverTasks: Task[], starredMap: StarredMap): Task[] {
  return serverTasks.map(task => ({
    ...task,
    starred: starredMap[task.id] ?? false,
  }));
}
```

This is directly covered by `src/tests/mergeTasksWithStarred.test.ts`, including a test explicitly named around "THE CORE GUARANTEE" that simulates a full refresh cycle and asserts the previously-starred task keeps `starred: true` even though the "fresh from server" data it's merged with all arrives `starred: false`.

## Offline-first flow

Implemented in `src/sync/hooks/useTasksSync.ts`, exactly as specified:

1. **On app open**: read `tasks_cache` / `categories_cache` / `last_refresh_time` from AsyncStorage and populate the store immediately — this happens before any network call, so the list is never blank on a cold start even with zero connectivity.
2. **Check connectivity** via `NetInfo.fetch()`.
3. **If online**: fetch fresh tasks + categories from Supabase, merge starred state in (above), write the merged result to `tasks_cache`/`categories_cache`/`last_refresh_time`, and update the Zustand store.
4. **If offline**: the cached data loaded in step 1 is left exactly as-is; `useNetworkStatus.ts` mirrors NetInfo's connectivity into the store so `OfflineBanner` renders. Nothing here ever renders a blank screen.
5. **On a failed refresh** (e.g. request timeout while "online" per NetInfo but the Supabase call itself throws): caught, logged, and — critically — the cache and store are **not** touched, so the previous good state stays on screen instead of being wiped by an error.

Pull-to-refresh on the Task List screen calls the same `refresh()` function directly (skipping the initial cache read, since it's already in memory).

## Write flow (create/edit/delete/complete)

Every write (`TaskFormScreen`'s submit, `TaskDetailScreen`'s complete/reopen and delete) follows the same shape:

```
1. Call the Supabase API function (services/taskApi.ts)
2. On success: update the Zustand store AND AsyncStorage cache
3. On failure: show an ErrorBanner / Alert, and do NOT touch the store or cache
```

No optimistic updates and no offline write queue, per the assessment's explicit scope. If a write fails, the user sees exactly what they had before, plus a visible error — never a silently-lost edit and never a UI that raced ahead of a request that then failed.

## Filter/sort outside the render tree

`useFilteredTasks(sortOption)` (`src/features/tasks/hooks/useFilteredTasks.ts`) is the **only** place `filterTasks`, `searchTasksByTitle`, and `sortTasks` are chained together, and it's memoized with `useMemo` keyed on `[tasks, filters, debouncedQuery, sortOption]`. `TaskListScreen` calls this one hook and renders its result — there is no `.filter()`/`.sort()` call anywhere inside a screen or component's JSX/render body.

Debouncing lives in `useDebouncedSearch` (plain `setTimeout`/`clearTimeout`, 300ms default) and is composed *inside* `useFilteredTasks` — the search box itself stays a fully responsive controlled input (see `SearchBar.tsx`'s comment on why the debounce must not touch the visible text), while the relatively expensive filter/sort pass it triggers is what's delayed.

## Testing approach

31 tests across 4 files, run with `npm test` (Jest + React Native Testing Library):

| File | What it covers | Why |
|---|---|---|
| `filterAndSort.test.ts` | **Required.** `filterTasks` (category, status, combined), `searchTasksByTitle`, `sortTasks` (both orders, undated-task handling, non-mutation) | The assessment explicitly requires filter/sort coverage — this is the most direct, highest-value test to write since it's pure logic with clear inputs/outputs. |
| `mergeTasksWithStarred.test.ts` | The star-merge guarantee: preserved on refresh, defaults to `false`, ignores stale ids, non-mutation | This is the single piece of logic the "Local-field preservation across refresh" (High weight) criterion hinges on — worth a dedicated, thorough suite rather than one assertion buried elsewhere. |
| `useDebouncedSearch.test.ts` | 300ms delay behavior via Jest fake timers: no update before the delay, update exactly at the delay, a burst of keystrokes collapsing into one update, cleanup on unmount | Debouncing is a timing behavior, easy to get subtly wrong (off-by-one on the delay, not clearing the previous timer); fake timers make it deterministic instead of flaky. |
| `cache.test.ts` (bonus, not required) | Round-trips `tasks_cache` and `starred_tasks` through the *real* `@react-native-async-storage/async-storage` Jest mock | The other three are pure-function tests with no I/O; this one exercises the actual storage contract, closer to an integration test. |

**What's intentionally not tested**: component rendering/snapshot tests for screens. Given the fixed time budget, testing effort went into the business logic the evaluation criteria weight highest (filter/sort, local-field preservation) rather than shallow "does this render without crashing" tests that mostly just restate the implementation. The default React Native template's own `App.test.tsx` smoke test was removed for the same reason — rendering the fully-wired `App` now needs Supabase/NetInfo/Navigation all mocked for a test that would mostly just prove imports resolve.

## Known limitations

- **No offline write queue.** Creating/editing/deleting a task while offline fails immediately with a visible error; there's no local queue that replays writes once connectivity returns. Explicitly out of scope per the brief.
- **No conflict resolution.** If the same task is edited on two devices, last-write-wins at the database level; there's no version vector or merge UI. Explicitly out of scope.
- **No optimistic updates.** Every write waits for the Supabase round-trip before the UI reflects it. This is a deliberate simplicity/correctness trade rather than an oversight — see next section.
- **Due date input is a plain `YYYY-MM-DD` text field**, not a native date picker, to avoid adding another native dependency for one field (see the in-app hint text). Validated with a regex before submit.
- **Category deletion isn't exposed in the UI** (the brief marks rename/delete as optional). The category API function (`deleteCategory`) exists in `services/categoryApi.ts` but isn't wired to a button.
- **RLS is fully permissive** (any anon request can read/write any row) since there's no auth yet — documented explicitly in `schema.sql`, not left as a silent gap.

## What I'd do differently with another day

1. **Refresh automatically on reconnect**, not just on app-open and pull-to-refresh — listening for a NetInfo transition from offline -> online and triggering `refresh()` at that moment. I left this out deliberately for this submission: it's a read-only enhancement (no queued writes, no conflict resolution), but the brief's explicit "if you find yourself building [sync features], stop" made me want to ship exactly what's asked first and call this out as the next increment rather than quietly scope-creep it in.
2. **A native date picker** for due dates instead of the regex-validated text field, if a date library were pre-approved (the current one avoids adding a dependency not in the required stack).
3. **Category rename/delete UI** — the API functions already exist; wiring them up is mechanical.
4. **A few component-level tests** (e.g., `TaskItem` renders the right status badge/star state for a given task) once the higher-value logic tests were solid.
5. **Pagination or a windowed query** if the task count were expected to reach the thousands server-side — see the note below on 2,000 tasks.

## AI usage note

This entire implementation — architecture, all source files, the SQL schema/seed data, and the test suite — was built by Claude (Anthropic) working directly from the two assessment documents (the task brief PDF and the design mockup image), inside a sandboxed dev environment with real `npm install`/`tsc`/`eslint`/`jest` execution used to verify each piece rather than assuming it would work. Every code comment explaining a *why* (not just a *what*) reflects an actual design decision made during the build — e.g., the AsyncStorage-vs-MMKV-vs-SQLite reasoning above, the choice of a modal-based category picker over a native picker library, and the deliberate decision *not* to add reconnect-triggered auto-refresh.

Two genuine build-time issues surfaced and were fixed through actual tool execution, not guessed at: React Native 0.86 split its Jest preset into a separate `@react-native/jest-preset` package not installed by default (the generated `jest.config.js` referenced it but the package wasn't present), and `@testing-library/react-native` v14 made `renderHook`/`rerender`/`unmount`/`act` all return Promises (a real breaking change from v12/v13) — both required rewriting configuration/test code to match, which is documented inline in the affected files.

Judgment calls worth being able to explain in an interview (all covered in more depth above): why Zustand over the other three options, why AsyncStorage over MMKV/SQLite, why the star-merge function is a separate testable unit rather than inlined into the sync hook, why writes are request-then-cache-update rather than optimistic, and why RLS is enabled-but-permissive rather than just left disabled.

## Interview prep notes

*(Notes only, not part of the app — see the assessment's "The Interview After" section.)*

- **No internet on open?** `useTasksSync`'s `loadInitial()` reads AsyncStorage first and calls `setTasks`/`setCategories` before `NetInfo.fetch()` is even awaited — the list is populated from cache regardless of what NetInfo says next. If `NetInfo.fetch()` then reports offline, `refresh()` returns early and `OfflineBanner` renders because `useNetworkStatus` mirrors the same NetInfo state into the store.
- **Where is starred preserved?** `mergeTasksWithStarred` in `src/features/tasks/utils/mergeTasksWithStarred.ts`, called from `useTasksSync.refresh()` on every background sync. Break it by, e.g., changing that call to `setTasks(serverTasks)` directly (skipping the merge) — the `mergeTasksWithStarred.test.ts` suite would immediately fail on the "CORE GUARANTEE" test.
- **Why Zustand?** See [State management choice](#state-management-choice-zustand) — less ceremony than Redux Toolkit, avoids Context's re-render-everything problem, and holds UI-only state (like `starred`) that a server-cache library like TanStack Query has no model for.
- **Why debounce, and why 300ms?** See [Filter/sort outside the render tree](#filtersort-outside-the-render-tree) — collapses a fast typing burst into one filter pass instead of one per keystroke; 300ms is comfortably under the ~400-500ms threshold where an input starts to feel laggy, while still absorbing a normal typing cadence.
- **If the task list grew to 2,000 items?** In order of what I'd check first: (1) confirm `FlatList` virtualization is actually configured well — `keyExtractor`, `initialNumToRender`, `windowSize`, `removeClippedSubviews` (all already set in `TaskListScreen`, tuned for a modest list — I'd re-tune these specifically for 2,000); (2) confirm `TaskItem`'s `React.memo` is actually preventing re-renders (verify with `why-did-you-render` or the React DevTools profiler, since a broken memo comparator silently degrades exactly like this); (3) move `useFilteredTasks`' `useMemo` dependencies under scrutiny — three inputs changing together could thrash the memo; (4) if the *data source* itself is the bottleneck rather than rendering, that's when cursor-based pagination on `fetchTasks()` (Supabase `.range()`) becomes worth the added complexity, rather than fetching all 2,000 rows on every refresh.
