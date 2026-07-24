-- Migration 2: per-set logging.
-- Run this once in the Supabase SQL Editor after the original schema.sql.

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  performed_on date not null default current_date,
  set_number int not null check (set_number > 0),
  reps int not null check (reps >= 0),
  weight numeric not null check (weight >= 0),
  created_at timestamptz not null default now()
);

create index if not exists workout_sets_user_id_idx on public.workout_sets (user_id);
create index if not exists workout_sets_exercise_id_idx on public.workout_sets (exercise_id);
create index if not exists workout_sets_performed_on_idx on public.workout_sets (performed_on);

alter table public.workout_sets enable row level security;

create policy "Users manage their own workout sets"
  on public.workout_sets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Carry over old aggregate records: a record of N sets x R reps @ W kg
-- becomes N individual set rows.
insert into public.workout_sets (user_id, exercise_id, performed_on, set_number, reps, weight)
select r.user_id, r.exercise_id, r.performed_on, gs.n, r.reps, r.weight
from public.exercise_records r
cross join lateral generate_series(1, greatest(r.sets, 1)) as gs(n);
