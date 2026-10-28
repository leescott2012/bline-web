-- Launch security audit round 2 (2026-10-28). APPLIED to production and tested
-- (rolled-back txn with 3 fake users: rewrite blocked, accept OK, unfriend revokes location).

-- BL-01: an addressee could UPDATE requester_id/addressee_id (RLS limits rows, not columns).
revoke update on public.friendships from authenticated, anon;
grant update (status) on public.friendships to authenticated;
drop policy if exists "bline_friendships_accept" on public.friendships;
create policy "bline_friendships_accept" on public.friendships
  for update to authenticated
  using (auth.uid() = addressee_id and status = 'pending')
  with check (auth.uid() = addressee_id and status = 'accepted');

-- BL-02: reading a friend's location now also requires a currently accepted friendship,
-- so a grant can't outlive unfriending.
drop policy if exists "bline_locations_select_shared" on public.locations;
create policy "bline_locations_select_shared" on public.locations
  for select to authenticated
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
        and exists (
          select 1 from public.friendships f
          where f.status = 'accepted'
            and ((f.requester_id = s.owner_id and f.addressee_id = s.viewer_id)
              or (f.addressee_id = s.owner_id and f.requester_id = s.viewer_id))
        )
    )
  );

-- Duplicate anon policy WITH CHECK (true) let anyone file reports under another user's id.
drop policy if exists "bline_anon_insert_bug" on public.bug_reports;
