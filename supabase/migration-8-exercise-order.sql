-- Migration 8: custom exercise order within a day.
-- Run once in the Supabase SQL Editor.

create table if not exists public.workout_day_exercise_order (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, performed_on date not null, exercise_id uuid not null references public.exercises(id) on delete cascade, position integer not null, created_at timestamptz not null default now(), unique (user_id, performed_on, exercise_id));

alter table public.workout_day_exercise_order enable row level security;

create policy "Users manage their own exercise order" on public.workout_day_exercise_order for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
