-- ── B-line: profiles + friendships migration ──────────────────────────────
--
-- Instagram-style social graph: every account picks a @username, you search
-- for people by that handle, send a request, and they accept in-app. No
-- invite links, no emails beyond the one-time sign-in.
--
-- Run this in the Supabase SQL editor for the bline project
-- (cszsikyzoinowjejlznw.supabase.co). Idempotent -- safe to re-run.

-- ── profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid        primary key references auth.users(id) on delete cascade,
  username     text        not null unique
                           check (username ~ '^[a-z0-9_.]{3,20}$'),
  display_name text        not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Anyone signed in can look up profiles -- that's what username search is.
drop policy if exists "bline_profiles_select" on public.profiles;
create policy "bline_profiles_select"
  on public.profiles for select to authenticated using (true);

-- You may only create/edit your own profile row.
drop policy if exists "bline_profiles_insert_own" on public.profiles;
create policy "bline_profiles_insert_own"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "bline_profiles_update_own" on public.profiles;
create policy "bline_profiles_update_own"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Case-insensitive handle lookups (search + uniqueness intent).
create index if not exists profiles_username_lower on public.profiles (lower(username));

-- ── friendships ────────────────────────────────────────────────────────────
-- One row per relationship. 'pending' until the addressee accepts; declining
-- or unfriending deletes the row outright (no tombstones to reason about).
create table if not exists public.friendships (
  id           uuid        primary key default gen_random_uuid(),
  requester_id uuid        not null references auth.users(id) on delete cascade,
  addressee_id uuid        not null references auth.users(id) on delete cascade,
  status       text        not null default 'pending'
                           check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint friendships_no_self check (requester_id <> addressee_id)
);

-- Prevents both a duplicate request and a mirrored one (B->A while A->B exists).
create unique index if not exists friendships_unique_pair on public.friendships (
  least(requester_id::text, addressee_id::text),
  greatest(requester_id::text, addressee_id::text)
);

alter table public.friendships enable row level security;

-- You only ever see rows you're part of.
drop policy if exists "bline_friendships_select_own" on public.friendships;
create policy "bline_friendships_select_own"
  on public.friendships for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- You can only send requests as yourself.
drop policy if exists "bline_friendships_insert_own" on public.friendships;
create policy "bline_friendships_insert_own"
  on public.friendships for insert to authenticated
  with check (auth.uid() = requester_id);

-- Only the addressee can accept (flip status); the requester can't self-accept.
drop policy if exists "bline_friendships_accept" on public.friendships;
create policy "bline_friendships_accept"
  on public.friendships for update to authenticated
  using (auth.uid() = addressee_id) with check (auth.uid() = addressee_id);

-- Either side can decline/unfriend.
drop policy if exists "bline_friendships_delete_own" on public.friendships;
create policy "bline_friendships_delete_own"
  on public.friendships for delete to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create index if not exists friendships_requester on public.friendships (requester_id);
create index if not exists friendships_addressee on public.friendships (addressee_id);

-- ── updated_at trigger (shared helper, already exists from earlier migrations)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists friendships_updated_at on public.friendships;
create trigger friendships_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();
