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
  listeners.forEach((listener) => listener());
}

supabase.auth.getSession().then(({ data }) => {
  setState({ user: data.session?.user ?? null, loading: false });
});

supabase.auth.onAuthStateChange((_event, session) => {
  setState({ user: session?.user ?? null, loading: false });
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAuth() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export type OtpChannel = "email" | "phone";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return phone.trim().replace(/[\s().-]/g, "");
}

/**
 * Send a six-digit one-time code. Supabase owns delivery, expiration, and
 * throttling; this client never generates or stores authentication codes.
 */
export function requestOtp(channel: OtpChannel, identifier: string) {
  if (channel === "email") {
    return supabase.auth.signInWithOtp({
      email: normalizeEmail(identifier),
      options: { shouldCreateUser: true },
    });
  }

  return supabase.auth.signInWithOtp({
    phone: normalizePhone(identifier),
    options: { shouldCreateUser: true },
  });
}

/** Verify the code sent by Supabase for the selected delivery channel. */
export function verifyOtp(channel: OtpChannel, identifier: string, token: string) {
  if (channel === "email") {
    return supabase.auth.verifyOtp({
      email: normalizeEmail(identifier),
      token: token.trim(),
      type: "email",
    });
  }

  return supabase.auth.verifyOtp({
    phone: normalizePhone(identifier),
    token: token.trim(),
    type: "sms",
  });
}

// Kept for existing users and older call sites while the app moves to verified
// identifiers. New onboarding does not create anonymous sessions or PINs.
export async function startAnonymousSession() {
  return supabase.auth.signInAnonymously();
}

export async function signOut() {
  await supabase.auth.signOut();
}

const identifierFor = (username: string) => `${username.trim().toLowerCase()}@bline.local`;

/** Legacy username/PIN migration helpers; do not use for new accounts. */
export async function attachPassword(username: string, password: string) {
  return supabase.auth.updateUser({ email: identifierFor(username), password });
}

/** Legacy username/PIN migration helper; do not use for new accounts. */
export async function signInWithUsername(username: string, password: string) {
  return supabase.auth.signInWithPassword({ email: identifierFor(username), password });
}

export function hasLogin(user: User | null) {
  return Boolean(user?.email || user?.phone);
}

// Face ID / passkeys remain available for web users who previously enrolled.
// WebAuthn cannot be used from Capacitor's capacitor://localhost origin.
export function passkeysAvailable() {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    !window.location.protocol.startsWith("capacitor")
  );
}

export async function addPasskey() {
  return (supabase.auth as unknown as {
    registerPasskey: () => Promise<{ data: unknown; error: { message: string } | null }>;
  }).registerPasskey();
}

export async function signInWithPasskey() {
  return (supabase.auth as unknown as {
    signInWithPasskey: () => Promise<{ data: unknown; error: { message: string } | null }>;
  }).signInWithPasskey();
}
