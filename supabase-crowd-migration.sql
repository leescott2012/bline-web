-- ── B-line: live crowd density from real users ────────────────────────────
--
-- The heatmap used to be Math.random() jitter around three POIs. These two
-- functions make it real -- without weakening the RLS on `locations`, which
-- still says you may only read your own row or an accepted friend's.
--
-- The trick is that neither function ever returns a row: one returns counts
-- bucketed onto a coarse grid, the other returns a single integer. Both run as
-- `security definer` so they can see across users, and both are written so that
-- seeing the output tells you nothing about *who* is where.
--
-- Privacy properties, deliberately:
--   * positions are rounded to ~0.001 deg (~110 m N/S, ~92 m E/W at Atlanta's
--     latitude) before grouping, so a cell is a city block, not a person
--   * a cell is only returned when at least MIN_PEOPLE distinct users are in
--     it -- k-anonymity, so you can never resolve a cell to one individual
--   * only fixes from the last 30 minutes count, so this is "now", not history
--   * users with sharing_enabled = false are excluded server-side, which is
--     belt-and-braces on top of the client deleting their row when they go
--     invisible
--
-- Run in the Supabase SQL editor for the bline project. Idempotent.

-- The whole point of the recency filter is to keep this cheap; without an
-- index it's a seq scan on every heatmap open.
create index if not exists locations_updated_at on public.locations (updated_at);

-- ── grid cells for the heatmap layer ───────────────────────────────────────
-- Returns double precision (not numeric) so PostgREST serialises plain JSON
-- numbers and the client needs no parsing.
create or replace function public.crowd_density()
returns table (lng double precision, lat double precision, people int)
language sql
stable
security definer
set search_path = public
as $$
  select
    round(l.lng, 3)::double precision,
    round(l.lat, 3)::double precision,
    count(*)::int
  from public.locations l
  join public.profiles p on p.id = l.user_id
  where l.updated_at > now() - interval '30 minutes'
    and p.sharing_enabled
  group by 1, 2
  -- k-anonymity floor. Below this a "hot" cell would pinpoint one or two
  -- people; raise it if the trail gets busy enough to afford the resolution.
  having count(*) >= 3;
$$;

-- ── how many people are out right now ──────────────────────────────────────
-- A single scalar carries no location information at all, so it needs no
-- threshold -- which is why it's separate from crowd_density() rather than a
-- window function over it. It counts everyone active, including the people in
-- sub-threshold cells that the heatmap itself has to omit.
create or replace function public.trail_people_now()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.locations l
  join public.profiles p on p.id = l.user_id
  where l.updated_at > now() - interval '30 minutes'
    and p.sharing_enabled;
$$;

-- `security definer` bypasses RLS, so be explicit about who may call these.
revoke all on function public.crowd_density() from public;
revoke all on function public.trail_people_now() from public;
grant execute on function public.crowd_density() to authenticated;
grant execute on function public.trail_people_now() to authenticated;
