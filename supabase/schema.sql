-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exercise_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  performed_on date not null default current_date,
  sets int not null check (sets >= 0),
  reps int not null check (reps >= 0),
  weight numeric not null check (weight >= 0),
  created_at timestamptz not null default now()
);

create index if not exists exercises_user_id_idx on public.exercises (user_id);
create index if not exists exercise_records_exercise_id_idx on public.exercise_records (exercise_id);
create index if not exists exercise_records_user_id_idx on public.exercise_records (user_id);

alter table public.exercises enable row level security;
alter table public.exercise_records enable row level security;

create policy "Users manage their own exercises"
  on public.exercises
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own exercise records"
  on public.exercise_records
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
