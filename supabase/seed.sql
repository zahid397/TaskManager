-- =============================================================
-- Task Manager - seed data
-- Run AFTER schema.sql, in the same SQL Editor.
-- Safe to re-run: categories are upserted by unique name, and tasks are
-- only inserted if the title doesn't already exist for that category
-- (see the `where not exists` guard on each insert) - re-running this
-- script will not create duplicates.
-- =============================================================

-- =============================================================
-- Task Manager Seed Data (Fixed)
-- =============================================================


-- Insert Categories safely

insert into categories (name)
select 'Work'
where not exists (
    select 1 from categories where name = 'Work'
);


insert into categories (name)
select 'Personal'
where not exists (
    select 1 from categories where name = 'Personal'
);


insert into categories (name)
select 'Health'
where not exists (
    select 1 from categories where name = 'Health'
);



-- =============================================================
-- Insert Tasks
-- =============================================================


insert into tasks
(title, description, category_id, status, due_date, created_at)

select
'Design mobile app UI',
'Design clean and modern UI for the task management app.',
c.id,
'open',
now() + interval '3 days',
now() - interval '6 days'

from categories c
where c.name = 'Work'
and not exists (
    select 1 from tasks 
    where title = 'Design mobile app UI'
);



insert into tasks
(title, description, category_id, status, due_date, created_at)

select
'Prepare quarterly project report',
'Summarize progress and next steps for Q3 review.',
c.id,
'open',
now() - interval '1 day',
now() - interval '4 days'

from categories c
where c.name = 'Work'
and not exists (
    select 1 from tasks 
    where title = 'Prepare quarterly project report'
);



insert into tasks
(title, description, category_id, status, due_date, created_at)

select
'Review pull requests',
'Review pending code changes.',
c.id,
'done',
now() - interval '2 days',
now() - interval '5 days'

from categories c
where c.name = 'Work'
and not exists (
    select 1 from tasks 
    where title = 'Review pull requests'
);



insert into tasks
(title, description, category_id, status, due_date, created_at)

select
'Buy groceries',
'Milk, eggs, bread, and vegetables.',
c.id,
'open',
now() + interval '1 day',
now() - interval '2 days'

from categories c
where c.name = 'Personal'
and not exists (
    select 1 from tasks 
    where title = 'Buy groceries'
);



insert into tasks
(title, description, category_id, status, due_date, created_at)

select
'Call mom',
null,
c.id,
'open',
now() + interval '2 days',
now() - interval '1 day'

from categories c
where c.name = 'Personal'
and not exists (
    select 1 from tasks 
    where title = 'Call mom'
);



insert into tasks
(title, description, category_id, status, due_date, created_at)

select
'Renew passport',
'Passport office appointment.',
c.id,
'open',
now() + interval '45 days',
now() - interval '10 days'

from categories c
where c.name = 'Personal'
and not exists (
    select 1 from tasks 
    where title = 'Renew passport'
);



insert into tasks
(title, description, category_id, status, due_date, created_at)

select
'Read a book',
'Finish Atomic Habits.',
c.id,
'done',
null,
now() - interval '8 days'

from categories c
where c.name = 'Personal'
and not exists (
    select 1 from tasks 
    where title = 'Read a book'
);



insert into tasks
(title, description, category_id, status, due_date, created_at)

select
'Morning workout',
'30 minutes cardio and stretching.',
c.id,
'done',
now() - interval '3 days',
now() - interval '3 days'

from categories c
where c.name = 'Health'
and not exists (
    select 1 from tasks 
    where title = 'Morning workout'
);



insert into tasks
(title, description, category_id, status, due_date, created_at)

select
'Annual health checkup',
'General physical and bloodwork.',
c.id,
'done',
now() - interval '15 days',
now() - interval '20 days'

from categories c
where c.name = 'Health'
and not exists (
    select 1 from tasks 
    where title = 'Annual health checkup'
);



-- =============================================================
-- Complete
-- 3 Categories
-- 9 Tasks
-- =============================================================