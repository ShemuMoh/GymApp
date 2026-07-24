-- Migration 4: progress photo diary.
-- Run once in the Supabase SQL Editor.

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  taken_on date not null default current_date,
  pose text not null check (pose in ('front', 'back')),
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (user_id, taken_on, pose)
);

create index if not exists progress_photos_user_id_idx on public.progress_photos (user_id);

alter table public.progress_photos enable row level security;

create policy "Users manage their own progress photos"
  on public.progress_photos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Private bucket: 25 MB per file, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('progress', 'progress', false, 26214400, array['image/*'])
on conflict (id) do nothing;

create policy "Progress photos read own folder"
  on storage.objects for select to authenticated
  using (bucket_id = 'progress' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Progress photos upload own folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'progress' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Progress photos delete own folder"
  on storage.objects for delete to authenticated
  using (bucket_id = 'progress' and (storage.foldername(name))[1] = auth.uid()::text);
