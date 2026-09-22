-- JomMasak schema — run this once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)

-- ─────────────────────────── profiles ───────────────────────────
-- One row per auth.users row. Holds the app-specific fields your mock
-- authService used to store: name, onboarded, preferences.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  onboarded boolean not null default false,
  dietary_tags text[] not null default '{}',
  cuisines text[] not null default '{}',
  goals text[] not null default '{}',
  household_size int not null default 2,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up.
-- `name` comes from the signUp() call's options.data.name (see authService.js).
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────── recipes ───────────────────────────
-- Seeded recipes have owner_id = null (global/shared, read-only to users).
-- Custom recipes a user creates have owner_id = their auth.uid().
create table public.recipes (
  id bigint generated always as identity primary key,
  slug text unique, -- stable human-readable key for the seeded library, used by seed.sql for idempotent re-seeding. Null for user-created recipes.
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

-- Everyone signed in can read global recipes (owner_id is null) plus their own.
create policy "recipes: read global or own" on public.recipes
  for select using (owner_id is null or owner_id = auth.uid());

create policy "recipes: insert own" on public.recipes
  for insert with check (owner_id = auth.uid());

create policy "recipes: update own" on public.recipes
  for update using (owner_id = auth.uid());

create policy "recipes: delete own" on public.recipes
  for delete using (owner_id = auth.uid());

-- ─────────────────────────── planned_meals ───────────────────────────
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

-- ─────────────────────────── grocery_checked ───────────────────────────
create table public.grocery_checked (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  checked boolean not null default true,
  primary key (user_id, item_id)
);

alter table public.grocery_checked enable row level security;

create policy "grocery_checked: all own" on public.grocery_checked
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────── grocery_extra_items ───────────────────────────
create table public.grocery_extra_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'Other',
  qty text not null default '',
  created_at timestamptz not null default now()
);

alter table public.grocery_extra_items enable row level security;

create policy "grocery_extra_items: all own" on public.grocery_extra_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
