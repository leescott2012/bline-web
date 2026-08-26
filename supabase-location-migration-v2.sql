-- ── B-line: location sharing off by default ─────────────────────────────
--
-- supabase-location-migration.sql shipped `sharing_enabled` defaulting to
-- true, and the per-friend grant it was designed to sit alongside
-- (`location_shares`) was never actually written to by any client code --
-- so the master switch alone controlled visibility, on by default, with no
-- explicit per-friend consent step. This migration is the DB half of the
-- fix; the client half (a "share your location with @username?" prompt
-- that inserts into `location_shares`, see src/lib/friends.ts) ships in the
-- same change.
--
-- Only the column default changes here. `location_shares` and its RLS from
-- the original migration are already correct as designed and are untouched.
--
-- Deliberately NOT backfilling existing rows to false: as of this writing
-- `location_shares` has zero rows and there are zero accepted friendships in
-- production, so no user has ever actually had their location visible to a
-- friend through this feature -- flipping the default closes that gap for
-- everyone going forward without touching anyone's data. Existing profiles
-- keep whatever `sharing_enabled` value they already have, which also still
-- feeds the crowd-density heatmap (see supabase-crowd-migration.sql) --
-- retroactively flipping those rows would visibly shrink that heatmap for
-- real users today, which is a separate product decision, not part of this
-- fix.
--
-- Run in the Supabase SQL editor for the bline project. Idempotent.

alter table public.profiles
  alter column sharing_enabled set default false;
