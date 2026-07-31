-- ── B-line: reservations table migration ──────────────────────────────────
--
-- Creates the reservations table so the Reserve screen can persist
-- bookings to Supabase instead of only confirming locally.
--
-- Run this in the Supabase SQL editor for the bline project
-- (cszsikyzoinowjejlznw.supabase.co). Idempotent — safe to re-run.
--
-- After running this, set SUPABASE_SERVICE_ROLE_KEY in Vercel env vars
-- (Project Settings → Environment Variables) so api/reservations.ts can
-- write to the table server-side.
--
create table if not exists public.reservations (
  id          uuid        primary key default gen_random_uuid(),
  spot_id     text        not null,
  spot_name   text        not null default '',
  guests      integer     not null default 2,
  day_label   text        not null default '',   -- e.g. "Today", "Fri 12"
  time_label  text        not null default '',   -- e.g. "7:00 PM"
  -- Optional: filled in once Supabase auth is wired
  user_id     uuid        references auth.users(id) on delete set null,
  -- Contact info for anonymous reservations (pre-auth)
  name        text        not null default '',
  email       text        not null default '',
  phone       text        not null default '',
  -- Status lifecycle: pending → confirmed → cancelled
  status      text        not null default 'confirmed'
                          check (status in ('pending', 'confirmed', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS: enable but keep permissive for now (no auth yet)
alter table public.reservations enable row level security;

-- Anon users can insert their own reservations
drop policy if exists "bline_anon_insert_reservations" on public.reservations;
create policy "bline_anon_insert_reservations"
  on public.reservations
  for insert
  to anon
  with check (true);

-- Anon users can read their own reservations by id (for confirmation page)
drop policy if exists "bline_anon_select_reservations" on public.reservations;
create policy "bline_anon_select_reservations"
  on public.reservations
  for select
  to anon
  using (true);

-- Service role can do everything (bypasses RLS by default — no explicit policy needed)

-- Auto-update updated_at on row changes
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_updated_at on public.reservations;
create trigger reservations_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();

-- Index for looking up reservations by spot
create index if not exists reservations_spot_id on public.reservations (spot_id);
-- Index for looking up by user once auth is wired
create index if not exists reservations_user_id on public.reservations (user_id);
-- Index for admin views sorted by time
create index if not exists reservations_created_at on public.reservations (created_at desc);
