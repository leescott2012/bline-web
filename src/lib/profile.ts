import { useSyncExternalStore } from "react";
import { getMyProfile, type Profile } from "./friends";
import { supabase } from "./supabase";

// Your own profile, in one place. Same module-store shape as auth.ts and
// favorites.ts. It exists because the profile now gates the whole app -- the
// onboarding screen, the Friends tab and the Profile tab all need to know
// whether one exists, and three independent fetches would drift apart the
// moment you change your avatar.
let state: { profile: Profile | null; loading: boolean } = { profile: null, loading: true };
const listeners = new Set<() => void>();

function setState(patch: Partial<typeof state>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

// Tracks which user the current state belongs to, so token refreshes -- which
// also fire onAuthStateChange -- don't trigger a redundant refetch.
let loadedFor: string | null | undefined;

async function load(userId: string | null) {
  if (userId === loadedFor) return;
  loadedFor = userId;
  if (!userId) {
    setState({ profile: null, loading: false });
    return;
  }
  setState({ loading: true });
  setState({ profile: await getMyProfile(userId), loading: false });
}

supabase.auth.getSession().then(({ data }) => load(data.session?.user?.id ?? null));

supabase.auth.onAuthStateChange((_event, session) => {
  // Supabase holds an internal lock while this callback runs, and calling back
  // into the client from inside it deadlocks. Defer to the next tick.
  const id = session?.user?.id ?? null;
  setTimeout(() => load(id), 0);
});

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useProfile() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

// Write straight through after an edit (avatar, status, sharing switch) so every
// screen updates without a round-trip.
export function setProfile(profile: Profile) {
  loadedFor = profile.id;
  setState({ profile, loading: false });
}

// Forces a refetch -- used right after claiming a username, where the store's
// "already loaded null for this user" state is exactly what we need to discard.
export async function refreshProfile(userId: string) {
  loadedFor = userId;
  setState({ profile: await getMyProfile(userId), loading: false });
}
