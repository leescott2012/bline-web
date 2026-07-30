-- ── B-line: spots table migration ─────────────────────────────────────────
--
-- Moves spot data out of src/lib/data.ts into Supabase so spots can be
-- edited without a code deploy. The app fetches at runtime and falls back
-- to the static data.ts array if the fetch fails or times out.
--
-- Run this in the Supabase SQL editor for the bline project
-- (cszsikyzoinowjejlznw.supabase.co). Idempotent.
--
-- Schema mirrors the Spot type in src/lib/data.ts exactly so the fetch
-- result can be used as-is without field mapping.

create table if not exists public.spots (
  id          text        primary key,
  name        text        not null,
  category    text        not null default '',
  area        text        not null default '',
  loved       integer     not null default 0,
  rating      numeric(3,1) not null default 4.0,
  ratings     text        not null default '0',
  "openTill"  text        not null default '10p',
  badges      text[]      not null default '{}',
  img         text        not null default '',
  imgs        text[]      not null default '{}',
  price       integer     not null default 0,
  "wasPrice"  integer     not null default 0,
  lng         numeric(9,6) not null,
  lat         numeric(8,6) not null,
  address     text        not null default '',
  walk        text        not null default '',
  -- admin fields
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Enable RLS
alter table public.spots enable row level security;

-- Anon users can read active spots (public discovery app)
drop policy if exists "bline_anon_select_spots" on public.spots;
create policy "bline_anon_select_spots"
  on public.spots
  for select
  to anon
  using (active = true);

-- Service role can do everything (for seeding + admin edits)
-- (service role bypasses RLS by default — no explicit policy needed)

-- Auto-update updated_at on row changes
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists spots_updated_at on public.spots;
create trigger spots_updated_at
  before update on public.spots
  for each row execute function public.set_updated_at();

-- Index for geo queries (future: PostGIS or simple bounding-box filters)
create index if not exists spots_lat_lng on public.spots (lat, lng);
-- Index for area filtering
create index if not exists spots_area on public.spots (area);
