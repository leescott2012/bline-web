import { supabase } from "./supabase";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string | null;
  status?: string | null;
  // Only selected for your own profile -- nobody else's switch is your business.
  sharing_enabled?: boolean;
}

const COLS = "id, username, display_name, avatar_url, status";

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted";
}

// A friendship joined with the *other* person's profile, which is what every
// list in the UI actually wants to render.
export interface FriendEdge extends Friendship {
  other: Profile;
  incoming: boolean; // they requested you (so you're the one who can accept)
}

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select(`${COLS}, sharing_enabled`)
    .eq("id", userId)
    .maybeSingle();
  return data ?? null;
}

export async function claimUsername(userId: string, username: string, displayName: string) {
  return supabase
    .from("profiles")
    .insert({ id: userId, username: username.toLowerCase(), display_name: displayName });
}

// Username search, Instagram-style. Excludes yourself; the caller filters out
// people you already have an edge with.
export async function searchProfiles(query: string, meId: string): Promise<Profile[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const { data } = await supabase
    .from("profiles")
    .select(COLS)
    .ilike("username", `%${q}%`)
    .neq("id", meId)
    .limit(20);
  return data ?? [];
}

// All edges involving me, each paired with the other person's profile.
export async function listFriendships(meId: string): Promise<FriendEdge[]> {
  const { data: rows } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status")
    .or(`requester_id.eq.${meId},addressee_id.eq.${meId}`);
  if (!rows?.length) return [];

  const otherIds = rows.map((r) => (r.requester_id === meId ? r.addressee_id : r.requester_id));
  const { data: profiles } = await supabase
    .from("profiles")
    .select(COLS)
    .in("id", otherIds);

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  return rows.flatMap((r) => {
    const other = byId.get(r.requester_id === meId ? r.addressee_id : r.requester_id);
    // profile row missing (deleted account mid-flight) -- drop the edge rather
    // than render a nameless entry
    return other ? [{ ...(r as Friendship), other, incoming: r.addressee_id === meId }] : [];
  });
}

export async function sendRequest(meId: string, toId: string) {
  return supabase.from("friendships").insert({ requester_id: meId, addressee_id: toId });
}

export async function acceptRequest(friendshipId: string) {
  return supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
}

// Decline and unfriend are the same operation -- the row just goes away.
export async function removeFriendship(friendshipId: string) {
  return supabase.from("friendships").delete().eq("id", friendshipId);
}

// Master "visible to friends" switch, stored on the profile. RLS on `locations`
// already checks profiles.sharing_enabled, so flipping this off hides your
// position server-side -- not just in the UI. crowd_density() checks it too, so
// going invisible also drops you out of the heatmap aggregate. Off by default
// for new accounts (see supabase-location-migration-v2.sql) -- this is the
// master switch, not consent for any one friend, which is `location_shares`
// below.
export async function setSharingEnabled(userId: string, enabled: boolean) {
  return supabase.from("profiles").update({ sharing_enabled: enabled }).eq("id", userId);
}

// The actual per-friend consent: a friend can only see your position if you
// have an unexpired row here granting *them* specifically, on top of (not
// instead of) sharing_enabled above -- see bline_locations_select_shared in
// supabase-location-migration.sql. RLS restricts inserts to the owner, so
// this only ever grants your own location, never someone else's.
export async function grantLocationShare(ownerId: string, viewerId: string) {
  return supabase.from("location_shares").insert({ owner_id: ownerId, viewer_id: viewerId });
}

// Revokes a grant you made. RLS restricts deletes to the owner too, so this
// is a no-op if you never shared with this person.
export async function revokeLocationShare(ownerId: string, viewerId: string) {
  return supabase.from("location_shares").delete().eq("owner_id", ownerId).eq("viewer_id", viewerId);
}

// ── profiles: avatar, status, and a friend's saved spots ───────────────────

export async function updateProfile(
  userId: string,
  patch: { status?: string; display_name?: string; avatar_url?: string },
) {
  return supabase.from("profiles").update(patch).eq("id", userId);
}

// Avatars live under a folder named after the uploader's uid -- storage RLS
// keys on that, so one user can't overwrite another's picture.
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) return null;
  // Cache-bust: the path is stable across re-uploads, so without this the old
  // image keeps rendering from cache.
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

// Only returns rows for yourself or an accepted friend -- enforced by RLS.
export async function listFavoriteSpotIds(userId: string): Promise<string[]> {
  const { data } = await supabase.from("favorites").select("spot_id").eq("user_id", userId);
  return (data ?? []).map((r) => r.spot_id as string);
}
