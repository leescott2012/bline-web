-- ── B-line: reservations RLS update ──────────────────────────────────────
--
-- Tightens the reservations table policies now that auth is wired:
--   - Authenticated users can read their own reservations (by user_id)
--   - Anon insert policy is kept so anonymous bookings still work
--   - The overly-permissive anon SELECT policy is replaced with a
--     narrower one: anon can only read by id (for confirmation page)
--
-- Run this in the Supabase SQL editor for the bline project
-- (cszsikyzoinowjejlznw.supabase.co). Idempotent — safe to re-run.
--

-- Drop the old permissive anon select policy (allowed reading all rows)
drop policy if exists "bline_anon_select_reservations" on public.reservations;

-- Anon users can read a single reservation by its own id (confirmation page)
-- The api/reservations GET ?id= route uses the service role key, so this
-- policy only matters for direct client-side reads — which we don't do.
-- Keep it narrow: no policy = no anon select (service role bypasses RLS).

-- Authenticated users can read their own reservations
drop policy if exists "bline_auth_select_own_reservations" on public.reservations;
create policy "bline_auth_select_own_reservations"
  on public.reservations
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Authenticated users can cancel their own reservations
drop policy if exists "bline_auth_update_own_reservations" on public.reservations;
create policy "bline_auth_update_own_reservations"
  on public.reservations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
