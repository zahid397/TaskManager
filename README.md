<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:61DAFB,100:3ECF8E&height=170&section=header&text=TaskManager&fontSize=56&fontColor=1a1a2e&fontAlignY=42&desc=Production-Ready%2C%20Offline-First%20React%20Native%20Task%20Management&descAlignY=62&descSize=15" width="100%" alt="TaskManager banner"/>

  <img src="https://readme-typing-svg.demolab.com/?font=Poppins&size=18&pause=1200&color=3ECF8E&center=true&vCenter=true&width=600&lines=Offline-First+Architecture;Clean+Layered+Codebase;Zustand+%2B+Supabase+%2B+TypeScript" alt="typing banner"/>

  [![React Native](https://img.shields.io/badge/React_Native-CLI-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Zustand](https://img.shields.io/badge/Zustand-State_Management-443E38?style=for-the-badge)](https://github.com/pmndrs/zustand)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

  <sub>💡 The banner/typing effect above are SVGs from <a href="https://github.com/kyechan99/capsule-render">capsule-render</a> — GitHub strips real <code>&lt;style&gt;</code> animations from README output, this is the standard workaround.</sub>
</div>

---

## 📌 Overview

**TaskManager** is a cross-platform mobile task manager built with **React Native CLI + TypeScript**, engineered around an **offline-first architecture**: the task list always renders from a local cache first, then refreshes from Supabase in the background — with a per-device "starred" flag that's guaranteed to survive every refresh.

Built as a Mid-Level React Native Engineer assessment submission, prioritizing correctness and clean layering over feature breadth.

## ✨ Key Features

- 📝 **Task CRUD** — create, edit, delete, and mark complete/reopen
- 🏷️ **Category Management** — view and add categories, assign them to tasks
- 🔍 **Debounced Search** — 300ms-debounced title search, no per-keystroke filtering
- 🧮 **Filter & Sort** — by category, status (Open/Done), due date, or created time
- 📶 **Offline-First Reads** — cached data renders instantly, before any network call
- 🔄 **Background Sync** — refreshes tasks/categories from Supabase after launch and on pull-to-refresh
- ⭐ **Local-Only Starred Flag** — never touches the backend; preserved across every refresh by design
- 🧱 **Feature-Based Architecture** — UI, state, services, and storage cleanly separated

## 🏗️ Architecture

Three strict layers, one direction of dependency: **Screens → Store → Services → (Supabase / AsyncStorage)**. No screen ever imports Supabase or AsyncStorage directly.

```mermaid
flowchart TD
    UI["🎨 Screens & Components<br/>TaskList · TaskDetail · TaskForm · Categories"]
    Store["🧠 Zustand Store<br/>tasks · filters · search · sync status"]
    Services["🔌 Services<br/>taskApi · categoryApi · cache"]
    Supabase[("☁️ Supabase<br/>Postgres")]
    Cache[("📦 AsyncStorage<br/>Local Cache")]

    UI <--> Store
    Store <--> Services
    Services <--> Supabase
    Services <--> Cache

    style UI fill:#61DAFB33,stroke:#61DAFB
    style Store fill:#F5E0FF,stroke:#8B5CF6
    style Services fill:#FFF3CD,stroke:#F59E0B
    style Supabase fill:#3ECF8E33,stroke:#3ECF8E
    style Cache fill:#E5E7EB,stroke:#6B7280
```

### Offline-First Read Path

```mermaid
flowchart LR
    A[App Opens] --> B[Read AsyncStorage Cache]
    B --> C[Render Immediately]
    C --> D{Online?}
    D -->|Yes| E[Fetch Supabase]
    E --> F[Merge Local Starred State]
    F --> G[Update Cache + Store]
    D -->|No| H[Show Offline Banner]
    H --> I[Keep Cached Data on Screen]

    style D fill:#FEF3C7,stroke:#F59E0B
    style H fill:#FEE2E2,stroke:#EF4444
    style G fill:#D1FAE5,stroke:#10B981
```

The list is **never blank** — cache renders before any network request even starts.

### Write Path (Create / Edit / Delete / Complete)

Writes are **request-first, not optimistic**: the UI only updates after Supabase confirms success, and a failed write leaves the cache completely untouched instead of rolling back a guessed state.

```mermaid
sequenceDiagram
    actor User
    participant UI as Screen
    participant API as taskApi.ts
    participant DB as Supabase
    participant Store as Zustand Store
    participant Cache as AsyncStorage

    User->>UI: Submit create / edit / delete / complete
    UI->>API: Call API function
    API->>DB: Insert / Update / Delete
    alt Write succeeds
        DB-->>API: Row returned
        API-->>UI: Success
        UI->>Store: Update in-memory state
        UI->>Cache: Persist tasks_cache
    else Write fails
        DB-->>API: Error
        API-->>UI: Throws
        UI->>User: Show error banner
        Note over Store,Cache: Left untouched — no partial state
    end
```

> **How starred survives a refresh:** `mergeTasksWithStarred()` (`src/features/tasks/utils/`) maps every fresh-from-Supabase task through the locally-cached starred map before it ever reaches the store — the server has no `starred` column at all, so there's nothing to overwrite.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native CLI, TypeScript |
| Navigation | React Navigation (native stack) |
| State | Zustand |
| Backend | Supabase (Postgres) |
| Local Cache | AsyncStorage |
| Connectivity | `@react-native-community/netinfo` |
| Testing | Jest + React Native Testing Library |

## 📁 Folder Structure

```
TaskManager/
├── android/, ios/            Native projects
├── src/
│   ├── app/navigation/       RootNavigator, route param types
│   ├── features/
│   │   ├── tasks/
│   │   │   ├── components/   TaskItem, StarButton, SearchBar, FilterBar...
│   │   │   ├── screens/      TaskListScreen, TaskDetailScreen, TaskFormScreen
│   │   │   ├── hooks/        useDebouncedSearch, useFilteredTasks
│   │   │   ├── utils/        filterTasks, sortTasks, mergeTasksWithStarred
│   │   │   ├── store/        taskStore.ts
│   │   │   └── types/
│   │   └── categories/       screens/ store/ types/
│   ├── sync/
│   │   ├── components/       OfflineBanner, SyncStatusBar
│   │   └── hooks/             useNetworkStatus, useTasksSync
│   ├── services/              supabase.ts, taskApi.ts, categoryApi.ts, cache.ts
│   ├── storage/                asyncStorage.ts, keys.ts
│   ├── theme/                  colors, spacing, typography tokens
│   └── tests/                  4 suites, 31 tests
├── supabase/                  schema.sql, seed.sql
└── .env.example
```

## 🧪 Testing

Jest + React Native Testing Library, **4 suites / 31 tests**, all pure-logic or storage-contract tests (no device/emulator required):

| Suite | Covers |
|---|---|
| `filterAndSort.test.ts` | Category/status filtering, both sort orders, non-mutation |
| `mergeTasksWithStarred.test.ts` | The starred-survives-refresh guarantee |
| `useDebouncedSearch.test.ts` | 300ms debounce timing, via Jest fake timers |
| `cache.test.ts` | AsyncStorage round-trip for the cache layer |

```bash
npm test          # run all suites
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## ⚙️ Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd TaskManager

# 2. Install dependencies
npm install
cd ios && bundle install && bundle exec pod install && cd ..   # iOS only

# 3. Configure environment variables
cp .env.example .env
# fill in SUPABASE_URL and SUPABASE_ANON_KEY (Supabase → Settings → API)
# then run supabase/schema.sql and supabase/seed.sql in the SQL Editor

# 4. Run Metro (separate terminal)
npx react-native start

# 5. Run the Android app
npm run android
```

## 📦 APK Download

Download the latest Android APK:
**[⬇️ Download TaskManager.apk](https://drive.google.com/file/d/1EA-8K6roAmmKVNADLeZP4mx9Z39PS1p4/view)**

## 📸 Screenshots

| Task List | Task Detail | Create Task |
|:---:|:---:|:---:|
| _coming soon_ | _coming soon_ | _coming soon_ |

## 👨‍💻 Developer Notes

Three judgment calls worth calling out: **AsyncStorage over MMKV/SQLite** — the cached dataset is a few dozen small JSON records, well inside AsyncStorage's comfort zone, and every query already runs in memory rather than against the cache itself. **Zustand over Redux Toolkit or Context** — one feature's worth of state doesn't justify Redux's ceremony, and Context re-renders every consumer on any change unless hand-split. **Request-first writes over optimistic updates** — simpler to reason about and impossible to leave in a half-synced state on failure, at the cost of a small delay before the UI reflects a change. Deeper rationale for each lives as comments directly in `store/` and `services/`.

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:3ECF8E,100:61DAFB&height=90&section=footer" width="100%" alt="footer"/>
</div>
