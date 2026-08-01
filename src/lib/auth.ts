import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { supabase } from "./supabase";

// Module store + useSyncExternalStore (same pattern as favorites.ts/spots.ts) so
// every screen reacts to sign-in/out without prop drilling. Backed by Supabase's
// own session persistence -- we just mirror whatever it reports.
let state: { user: User | null; loading: boolean; callbackError: string | null } = {
  user: null,
  loading: true,
  callbackError: null,
};
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

const isNative = Capacitor.isNativePlatform();

// Native can't use window.location.origin (it's capacitor://localhost, which a
// magic link in Mail can't reach) -- a custom scheme registered in Info.plist
// (CFBundleURLTypes) reopens the app instead. Both values must be allowlisted
// in Supabase: Authentication > URL Configuration > Redirect URLs.
const REDIRECT_TO = isNative ? "bline://auth-callback" : `${window.location.origin}/friends`;

// Magic-link (OTP) sign-in -- no password.
export async function signInWithEmail(email: string) {
  return supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: REDIRECT_TO } });
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Native only: the magic link reopens the app at bline://auth-callback?code=...
// (PKCE) or #access_token=... (implicit). The web build handles this itself via
// supabase-js's detectSessionInUrl, which never fires for a custom scheme.
if (isNative) {
  App.addListener("appUrlOpen", async ({ url }) => {
    if (!url.startsWith("bline://auth-callback")) return;
    setState({ callbackError: null });
    try {
      // Custom schemes don't parse as http(s) URLs everywhere -- normalize first.
      const normalized = new URL(url.replace("bline://", "https://bline.invalid/"));
      const code = normalized.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) setState({ callbackError: error.message });
        return;
      }
      const hash = new URLSearchParams(normalized.hash.replace(/^#/, ""));
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) setState({ callbackError: error.message });
      } else {
        setState({ callbackError: "That sign-in link was missing its token. Request a new one." });
      }
    } catch (e) {
      // Expired/reused link, or opened on a different device than it was
      // requested from (PKCE verifier lives in this device's storage).
      setState({ callbackError: e instanceof Error ? e.message : "That sign-in link didn't work. Request a new one." });
    }
  });
}
