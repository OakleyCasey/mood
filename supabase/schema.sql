create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  kind text not null check (kind in ('positive', 'negative')),
  size text not null check (size in ('small', 'medium', 'large')),
  value int not null check (value in (1, 2, 3)),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.subject_preferences (
  subject_id uuid primary key references public.subjects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  positive_color text not null default '#E9A15F',
  negative_color text not null default '#424247',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.mood_entries enable row level security;
alter table public.subject_preferences enable row level security;

create policy "profiles are self readable"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are self insertable"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "subjects are isolated by user"
  on public.subjects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "entries are isolated by user"
  on public.mood_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "preferences are isolated by user"
  on public.subject_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
