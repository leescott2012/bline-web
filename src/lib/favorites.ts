import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";

// ── Favorites store ────────────────────────────────────────────────────────
//
// Dual-mode: when the user is signed in, favorites are persisted to the
// Supabase `favorites` table (one row per user+spot) so they sync across
// devices. When signed out, falls back to localStorage so guests still get
// a working heart button.
//
// The public API (toggleFav / isFav / useFavorites) is unchanged — callers
// don't need to know which backend is active.
//
// Table is created by supabase-favorites-migration.sql. The store degrades
// gracefully if the table doesn't exist yet (falls back to localStorage).
//
// Uses the same module-store + useSyncExternalStore pattern as spots.ts /
// mapStyle.ts so every heart and the Saved tab stay in sync without a
// React context.

// The cache is per account: one shared key used to merge user A's hearts into
// whoever signed in next on the same device. The old shared key is dropped.
const lsKey = (userId: string | null) => `bline:favs:${userId ?? "guest"}`;
try { localStorage.removeItem("bline:favs"); } catch { /* storage unavailable */ }

// ── In-memory state ──────────────────────────────────────────────────────
let currentUserId: string | null = null;
let favs: string[] = loadLocal();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// ── localStorage helpers ─────────────────────────────────────────────────
function loadLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(lsKey(currentUserId)) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(ids: string[]) {
  try {
    localStorage.setItem(lsKey(currentUserId), JSON.stringify(ids));
  } catch {
    // storage quota exceeded — ignore
  }
}

// ── Auth-aware init ──────────────────────────────────────────────────────
// On load, check whether the user is already signed in. If so, fetch their
// Supabase favorites and merge with this account's own offline cache.

supabase.auth.getSession().then(({ data }) => {
  const user = data.session?.user ?? null;
  if (user) {
    currentUserId = user.id;
    favs = loadLocal(); // this account's cache only, until Supabase answers
    emit();
    loadFromSupabase(user.id);
  }
});

// React to sign-in / sign-out events.
supabase.auth.onAuthStateChange((_event, session) => {
  const user = session?.user ?? null;
  if (user && user.id !== currentUserId) {
    // Signed in (or switched user) — fetch from Supabase and merge.
    currentUserId = user.id;
    favs = loadLocal(); // this account's cache only, until Supabase answers
    emit();
    loadFromSupabase(user.id);
  } else if (!user && currentUserId) {
    // Signed out — revert to localStorage.
    currentUserId = null;
    favs = loadLocal();
    emit();
  }
});

async function loadFromSupabase(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("spot_id")
    .eq("user_id", userId);
  if (currentUserId !== userId) return; // account switched while this was in flight

  if (error) {
    // Table doesn't exist yet or network error — keep localStorage state.
    console.info("[favorites] Supabase fetch failed, using localStorage:", error.message);
    return;
  }

  const remoteIds = (data ?? []).map((r: { spot_id: string }) => r.spot_id);
  const localIds = loadLocal();

  // Merge: anything in localStorage that isn't in Supabase yet gets upserted.
  const toSync = localIds.filter((id) => !remoteIds.includes(id));
  if (toSync.length > 0) {
    await supabase.from("favorites").upsert(
      toSync.map((spot_id) => ({ user_id: userId, spot_id })),
      { onConflict: "user_id,spot_id" }
    );
  }

  // Union of both sources is the authoritative set.
  const merged = Array.from(new Set([...remoteIds, ...localIds]));
  favs = merged;
  saveLocal(merged); // keep localStorage in sync as a cache
  emit();
}

// ── Public API ────────────────────────────────────────────────────────────

export async function toggleFav(id: string) {
  const adding = !favs.includes(id);
  // Optimistic update — UI responds immediately.
  favs = adding ? [...favs, id] : favs.filter((x) => x !== id);
  saveLocal(favs);
  emit();

  if (currentUserId) {
    if (adding) {
      const { error } = await supabase
        .from("favorites")
        .upsert({ user_id: currentUserId, spot_id: id }, { onConflict: "user_id,spot_id" });
      if (error) {
        console.warn("[favorites] upsert failed:", error.message);
        // Don't revert — localStorage still has it, and it'll sync next load.
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", currentUserId)
        .eq("spot_id", id);
      if (error) {
        console.warn("[favorites] delete failed:", error.message);
      }
    }
  }
}

export function isFav(id: string) {
  return favs.includes(id);
}

/** Returns the current favorites array (stable ref until it changes). */
export function useFavorites() {
  return useSyncExternalStore(subscribe, () => favs, () => favs);
}
