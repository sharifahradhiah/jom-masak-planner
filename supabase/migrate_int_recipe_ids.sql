-- One-time migration: switch recipes.id from text to an auto-incrementing
-- bigint. Run this ONCE against a project that already ran the old
-- schema.sql. Drops and recreates only `recipes` and `planned_meals`
-- (profiles and grocery tables are untouched). Any recipes/planned meals
-- you'd already created will be lost — reseed after with seed.sql.

drop table if exists public.planned_meals cascade;
drop table if exists public.recipes cascade;

create table public.recipes (
  id bigint generated always as identity primary key,
  slug text unique,
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '🍽️',
  color text not null default 'terracotta',
  cuisine text not null default 'Custom',
  meal_types text[] not null default '{}',
  tags text[] not null default '{}',
  leftover_friendly boolean not null default false,
  calories int not null default 0,
  prep_time int not null default 0,
  servings int not null default 1,
  ingredients jsonb not null default '[]',
  created_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "recipes: read global or own" on public.recipes
  for select using (owner_id is null or owner_id = auth.uid());

create policy "recipes: insert own" on public.recipes
  for insert with check (owner_id = auth.uid());

create policy "recipes: update own" on public.recipes
  for update using (owner_id = auth.uid());

create policy "recipes: delete own" on public.recipes
  for delete using (owner_id = auth.uid());

create table public.planned_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null,
  recipe_id bigint not null references public.recipes(id),
  servings int not null default 2,
  source text not null default 'manual',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index planned_meals_user_date_idx on public.planned_meals (user_id, date);

alter table public.planned_meals enable row level security;

create policy "planned_meals: all own" on public.planned_meals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Now run supabase/seed.sql again to repopulate the recipe library.
