-- Migration 5: daily body-weight tracker.
-- Run once in the Supabase SQL Editor.

create table if not exists public.body_weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recorded_on date not null default current_date,
  weight numeric not null check (weight > 0 and weight < 1000),
  created_at timestamptz not null default now(),
  unique (user_id, recorded_on)
);

create index if not exists body_weights_user_id_idx on public.body_weights (user_id);

alter table public.body_weights enable row level security;

create policy "Users manage their own body weights" on public.body_weights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
