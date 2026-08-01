import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Module store + useSyncExternalStore (same pattern as favorites.ts/spots.ts) so
// every screen reacts to sign-in/out without prop drilling. Backed by Supabase's
// own session persistence -- we just mirror whatever it reports.
let state: { user: User | null; loading: boolean } = { user: null, loading: true };
const listeners = new Set<() => void>();

function setState(patch: Partial<typeof state>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

supabase.auth.getSession().then(({ data }) => {
  setState({ user: data.session?.user ?? null, loading: false });
});

supabase.auth.onAuthStateChange((_event, session) => {
  setState({ user: session?.user ?? null, loading: false });
});

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAuth() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

// Magic-link (OTP) sign-in -- no password. Supabase emails a link back to
// emailRedirectTo; the client auto-detects the token in the URL on load.
export async function signInWithEmail(email: string) {
  return supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
}

export async function signOut() {
  await supabase.auth.signOut();
}
