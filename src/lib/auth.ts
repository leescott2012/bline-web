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

// The anonymous session lives in this device's storage, so signing out or
// switching phones used to lose the account outright -- there was no way back
// in. A password fixes that without introducing email anywhere in the UI.
//
// Supabase password auth needs an identifier, so the username is mapped to a
// synthetic one. Users only ever type a username and a password -- no email
// appears anywhere in the UI.
//
// `.invalid` (RFC 2606) would be the correct reserved TLD, but Supabase's own
// validator rejects it outright -- verified against the live project. `.local`
// passes validation and is equally non-routable, so no mail can ever reach a
// real inbox.
//
// REQUIRES "Confirm email" to be OFF in Supabase → Authentication → Sign In /
// Providers → Email. With it on, Supabase queues a confirmation to an address
// that cannot receive one and the account stays unusable. Verified: with it on,
// these calls return "email rate limit exceeded".
const identifierFor = (username: string) => `${username.trim().toLowerCase()}@bline.local`;

/** Give the account you already have a password, keeping the same @username. */
export async function attachPassword(username: string, password: string) {
  return supabase.auth.updateUser({ email: identifierFor(username), password });
}

/** Returning on a new device, or after signing out. */
export async function signInWithUsername(username: string, password: string) {
  return supabase.auth.signInWithPassword({ email: identifierFor(username), password });
}

/** Has this account been given a way back in yet? */
export function hasLogin(user: User | null) {
  return !!user?.email;
}

// ── passkeys ───────────────────────────────────────────────────────────────
// Face ID instead of a password: nothing to remember, nothing to type, and the
// credential syncs through iCloud Keychain so a new phone just works.
//
// WebAuthn binds a credential to a domain, and Capacitor serves the app from
// `capacitor://localhost`, which is not a domain WebAuthn will accept. So this
// is a web-first feature: supported in the browser build, hidden in the native
// app until Associated Domains + an apple-app-site-association file are set up.
// Offering a button that can only fail would be worse than not offering it.
export function passkeysAvailable() {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    !window.location.protocol.startsWith("capacitor")
  );
}

/** Add Face ID to the account you're already signed into. */
export async function addPasskey() {
  return (supabase.auth as unknown as {
    registerPasskey: () => Promise<{ data: unknown; error: { message: string } | null }>;
  }).registerPasskey();
}

/** Sign in with Face ID -- no username, no password. */
export async function signInWithPasskey() {
  return (supabase.auth as unknown as {
    signInWithPasskey: () => Promise<{ data: unknown; error: { message: string } | null }>;
  }).signInWithPasskey();
}
