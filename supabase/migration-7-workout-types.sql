-- Migration 7: workout type per day.
-- Run once in the Supabase SQL Editor.

create table if not exists public.workout_day_types (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, performed_on date not null, workout_type text not null, created_at timestamptz not null default now(), unique (user_id, performed_on));

alter table public.workout_day_types enable row level security;

create policy "Users manage their own workout day types" on public.workout_day_types for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
