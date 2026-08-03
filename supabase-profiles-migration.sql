-- ── B-line: richer friend profiles ────────────────────────────────────────
-- Avatar + status line, plus letting accepted friends see each other's saved
-- spots so a profile has something on it worth looking at.

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists status text not null default '';

-- Public bucket: avatars are shown to friends and are not sensitive, and a
-- public URL avoids minting signed URLs on every render.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone may read an avatar; you may only write inside a folder named after
-- your own uid, so one user can't overwrite another's picture.
drop policy if exists "bline_avatar_read" on storage.objects;
create policy "bline_avatar_read" on storage.objects
  for select to public using (bucket_id = 'avatars');

drop policy if exists "bline_avatar_insert" on storage.objects;
create policy "bline_avatar_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "bline_avatar_update" on storage.objects;
create policy "bline_avatar_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "bline_avatar_delete" on storage.objects;
create policy "bline_avatar_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Favorites: your own, plus those of people you're actually friends with.
-- Replaces the own-rows-only policy rather than adding a second permissive one,
-- so there's a single readable rule for who can see a favorite.
drop policy if exists "bline_auth_select_favorites" on public.favorites;
drop policy if exists "bline_favorites_select_self_or_friends" on public.favorites;
create policy "bline_favorites_select_self_or_friends" on public.favorites
  for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.friendships f
      where f.status = 'accepted'
        and ((f.requester_id = auth.uid() and f.addressee_id = favorites.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = favorites.user_id))
    )
  );
