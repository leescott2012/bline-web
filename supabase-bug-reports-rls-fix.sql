-- ── Fix: anon inserts into bug_reports are currently rejected ──────────────
--
-- Diagnosed 2026-07-30: every POST to /rest/v1/bug_reports with the anon key
-- returns 401 "new row violates row-level security policy" (Postgres error
-- 42501). The client code (src/lib/bugReport.ts) assumed anon inserts were
-- allowed and only caught network-level exceptions, not HTTP error statuses --
-- so every feedback/bug submission has been silently failing while the UI
-- showed "Sent". That silent-failure bug is now fixed in the client; this is
-- the other half -- the actual RLS policy needs to permit the insert.
--
-- Run this in the Supabase SQL editor for the bline project
-- (cszsikyzoinowjejlznw.supabase.co). Idempotent.

alter table public.bug_reports enable row level security;

drop policy if exists "bline_anon_insert_bug" on public.bug_reports;
create policy "bline_anon_insert_bug"
  on public.bug_reports
  for insert
  to anon
  with check (true);
