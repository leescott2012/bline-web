-- ── B-line: favorites table migration ────────────────────────────────────
--
-- Creates the favorites table so authenticated users' saved spots persist
-- in Supabase and sync across devices instead of staying in localStorage.
--
-- Run this in the Supabase SQL editor for the bline project
-- (cszsikyzoinowjejlznw.supabase.co). Idempotent — safe to re-run.
--
-- After running this, the app automatically uses Supabase for signed-in
-- users and falls back to localStorage for guests. No Vercel env changes
-- needed — favorites are written directly from the client using the anon
-- key (RLS policies below restrict each user to their own rows).
--
create table if not exists public.favorites (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  spot_id    text        not null,
  created_at timestamptz not null default now(),
  -- Each user can only favorite a spot once
  unique (user_id, spot_id)
);

-- RLS: each user can only see and modify their own favorites
alter table public.favorites enable row level security;

-- Authenticated users can read their own favorites
drop policy if exists "bline_auth_select_favorites" on public.favorites;
create policy "bline_auth_select_favorites"
  on public.favorites
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Authenticated users can insert their own favorites
drop policy if exists "bline_auth_insert_favorites" on public.favorites;
create policy "bline_auth_insert_favorites"
  on public.favorites
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authenticated users can delete their own favorites
drop policy if exists "bline_auth_delete_favorites" on public.favorites;
create policy "bline_auth_delete_favorites"
  on public.favorites
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Index for fast per-user lookups
create index if not exists favorites_user_id on public.favorites (user_id);
-- Index for looking up which users favorited a spot (future: "X people saved this")
create index if not exists favorites_spot_id on public.favorites (spot_id);
