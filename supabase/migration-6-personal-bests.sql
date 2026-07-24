-- Migration 6: personal bests.
-- Run once in the Supabase SQL Editor.

create table if not exists public.personal_bests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  achieved_on date not null default current_date,
  weight numeric not null check (weight >= 0),
  reps int not null default 1 check (reps >= 0),
  created_at timestamptz not null default now()
);

create index if not exists personal_bests_user_id_idx on public.personal_bests (user_id);

alter table public.personal_bests enable row level security;

create policy "Users manage their own personal bests" on public.personal_bests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
