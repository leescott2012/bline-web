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

// No email, no magic link, no SMS. An anonymous sign-in mints a real Supabase
// user (real uuid, real RLS) with no identifier at all -- the @username picked
// straight after IS the identity as far as other people are concerned.
//
// Tradeoff worth knowing: the session lives in this device's storage, so
// clearing site data or switching devices loses the account. Supabase supports
// attaching an email/phone to an anonymous user later, which is the upgrade
// path if account recovery ever matters.
export async function startAnonymousSession() {
  return supabase.auth.signInAnonymously();
}

export async function signOut() {
  await supabase.auth.signOut();
}
