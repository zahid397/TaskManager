-- =============================================================
-- Task Manager - Supabase Schema
-- =============================================================

create extension if not exists "pgcrypto";


-- =============================================================
-- TABLES
-- =============================================================

create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz default now()
);


create table if not exists tasks (
    id uuid primary key default gen_random_uuid(),

    title text not null,

    description text,

    category_id uuid references categories(id)
        on delete set null,

    status text not null default 'open'
        check (status in ('open', 'done')),

    due_date timestamptz,

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);



-- =============================================================
-- INDEXES
-- =============================================================

create index if not exists idx_tasks_category_id 
on tasks(category_id);

create index if not exists idx_tasks_status 
on tasks(status);

create index if not exists idx_tasks_due_date 
on tasks(due_date);

create index if not exists idx_tasks_created_at 
on tasks(created_at desc);



-- =============================================================
-- UPDATED_AT TRIGGER
-- =============================================================

create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;


drop trigger if exists trg_tasks_updated_at on tasks;


create trigger trg_tasks_updated_at
before update on tasks
for each row
execute function set_updated_at();



-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table categories enable row level security;

alter table tasks enable row level security;



-- Remove old policies if exist

drop policy if exists "categories_anon_all" on categories;

drop policy if exists "tasks_anon_all" on tasks;



-- Allow anonymous access for assessment

create policy "categories_anon_all"
on categories
for all
to anon
using (true)
with check (true);



create policy "tasks_anon_all"
on tasks
for all
to anon
using (true)
with check (true);



-- =============================================================
-- Schema Complete
-- Run seed.sql after this
-- =============================================================