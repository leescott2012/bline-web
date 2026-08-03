-- ── B-line: live location sharing ─────────────────────────────────────────
--
-- Apple Find My-style sharing: one "latest position" row per user (upserted,
-- never appended, so there's no location history to leak), plus an explicit
-- per-friend grant with an optional expiry, plus a master on/off switch.
--
-- Visibility is enforced by RLS, not by the UI: if a grant is missing, expired,
-- or the owner has gone offline, the row is unreadable no matter what the
-- client asks for.
--
-- Run in the Supabase SQL editor for the bline project. Idempotent.

-- master "go invisible to everyone" switch
alter table public.profiles
  add column if not exists sharing_enabled boolean not null default true;

-- ── latest known position, one row per user ────────────────────────────────
create table if not exists public.locations (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  lng        numeric(9,6) not null,
  lat        numeric(8,6) not null,
  accuracy   numeric,
  updated_at timestamptz not null default now()
);

alter table public.locations enable row level security;

-- You can always write (and read) your own position.
drop policy if exists "bline_locations_write_own" on public.locations;
create policy "bline_locations_write_own"
  on public.locations for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "bline_locations_update_own" on public.locations;
create policy "bline_locations_update_own"
  on public.locations for update to authenticated using (auth.uid() = user_id);

drop policy if exists "bline_locations_delete_own" on public.locations;
create policy "bline_locations_delete_own"
  on public.locations for delete to authenticated using (auth.uid() = user_id);

-- ── who may see whom, and until when ───────────────────────────────────────
-- expires_at NULL = share indefinitely. Revoking deletes the row.
create table if not exists public.location_shares (
  owner_id   uuid        not null references auth.users(id) on delete cascade,
  viewer_id  uuid        not null references auth.users(id) on delete cascade,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (owner_id, viewer_id),
  constraint location_shares_no_self check (owner_id <> viewer_id)
);

alter table public.location_shares enable row level security;

-- Both sides can see the grant (you need to know who you're sharing with, and
-- the viewer needs to know they have access).
drop policy if exists "bline_shares_select" on public.location_shares;
create policy "bline_shares_select"
  on public.location_shares for select to authenticated
  using (auth.uid() = owner_id or auth.uid() = viewer_id);

-- Only the owner grants, changes, or revokes their own sharing.
drop policy if exists "bline_shares_insert_own" on public.location_shares;
create policy "bline_shares_insert_own"
  on public.location_shares for insert to authenticated with check (auth.uid() = owner_id);

drop policy if exists "bline_shares_update_own" on public.location_shares;
create policy "bline_shares_update_own"
  on public.location_shares for update to authenticated using (auth.uid() = owner_id);

drop policy if exists "bline_shares_delete_own" on public.location_shares;
create policy "bline_shares_delete_own"
  on public.location_shares for delete to authenticated using (auth.uid() = owner_id);

create index if not exists location_shares_viewer on public.location_shares (viewer_id);

-- ── the policy that actually protects position data ────────────────────────
-- Readable only if it's yours, or someone granted you an unexpired share AND
-- they haven't flipped their master switch off.
drop policy if exists "bline_locations_select_shared" on public.locations;
create policy "bline_locations_select_shared"
  on public.locations for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.location_shares s
      join public.profiles p on p.id = s.owner_id
      where s.owner_id = locations.user_id
        and s.viewer_id = auth.uid()
        and p.sharing_enabled
        and (s.expires_at is null or s.expires_at > now())
    )
  );

-- ── realtime ───────────────────────────────────────────────────────────────
-- Push position updates to friends who are watching. RLS above still applies
-- to realtime payloads, so this doesn't widen visibility.
do $$
begin
  alter publication supabase_realtime add table public.locations;
exception
  when duplicate_object then null;  -- already added on a previous run
end $$;

drop trigger if exists locations_updated_at on public.locations;
create trigger locations_updated_at
  before update on public.locations
  for each row execute function public.set_updated_at();
