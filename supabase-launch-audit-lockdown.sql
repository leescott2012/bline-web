-- Launch security audit (2026-10-28). APPLIED to production.
-- Reservations feature is retired (api/reservations.ts returns 410, no client reads it),
-- but anon could still read every row incl. name/email/phone. Remove public access.
drop policy if exists "bline_anon_select_reservations" on public.reservations;
drop policy if exists "bline_anon_insert_reservations" on public.reservations;

-- A requester could insert a friendship already 'accepted', skipping the other
-- person's consent and unlocking their favorites. New requests must start pending.
drop policy if exists "bline_friendships_insert_own" on public.friendships;
create policy "bline_friendships_insert_own" on public.friendships
  for insert to authenticated
  with check (auth.uid() = requester_id and status = 'pending');

-- Hard auth gate: crowd aggregates are for signed-in users.
revoke execute on function public.crowd_density() from anon, public;
revoke execute on function public.trail_people_now() from anon, public;
