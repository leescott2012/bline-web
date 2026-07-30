import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { spots as staticSpots, type Spot } from "@/lib/data";

// ── Spots store ────────────────────────────────────────────────────────────
//
// Fetches spots from the Supabase `spots` table on first use and caches the
// result for the session. Falls back to the static data.ts array if the
// table doesn't exist yet, the fetch fails, or it times out — so the app
// is never broken while the migration is in progress.
//
// Uses the same module-store + useSyncExternalStore pattern as favorites.ts
// and mapStyle.ts so every consumer stays in sync without a React context.

type SpotsState = {
  spots: Spot[];
  loading: boolean;
  source: "supabase" | "static";
};

let state: SpotsState = {
  spots: staticSpots, // start with static data so first render is instant
  loading: false,
  source: "static",
};

const listeners = new Set<() => void>();

function emit(next: SpotsState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Track whether a fetch is already in flight so multiple hook instances
// don't trigger duplicate requests.
let fetchStarted = false;

async function fetchSpots() {
  if (fetchStarted) return;
  fetchStarted = true;

  emit({ ...state, loading: true });

  try {
    // 5-second timeout — if Supabase is slow, fall back to static data
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .eq("active", true)
      .order("id", { ascending: true })
      .abortSignal(controller.signal);

    clearTimeout(timeout);

    if (error) {
      // Table doesn't exist yet (PGRST205) or any other error — use static
      console.info("[spots] Supabase fetch failed, using static data:", error.message);
      emit({ spots: staticSpots, loading: false, source: "static" });
      return;
    }

    if (!data || data.length === 0) {
      // Table exists but is empty — use static data
      console.info("[spots] Supabase spots table is empty, using static data");
      emit({ spots: staticSpots, loading: false, source: "static" });
      return;
    }

    // Supabase returns numeric columns as strings in some configurations —
    // coerce the fields that the app reads as numbers.
    const coerced: Spot[] = data.map((row) => ({
      ...row,
      rating: typeof row.rating === "string" ? parseFloat(row.rating) : row.rating,
      loved: typeof row.loved === "string" ? parseInt(row.loved, 10) : row.loved,
      price: typeof row.price === "string" ? parseInt(row.price, 10) : row.price,
      wasPrice: typeof row.wasPrice === "string" ? parseInt(row.wasPrice, 10) : row.wasPrice,
      lng: typeof row.lng === "string" ? parseFloat(row.lng) : row.lng,
      lat: typeof row.lat === "string" ? parseFloat(row.lat) : row.lat,
      badges: Array.isArray(row.badges) ? row.badges : [],
      imgs: Array.isArray(row.imgs) ? row.imgs : [row.img],
    }));

    console.info(`[spots] Loaded ${coerced.length} spots from Supabase`);
    emit({ spots: coerced, loading: false, source: "supabase" });
  } catch (err) {
    // AbortError (timeout) or network error — fall back to static
    const msg = err instanceof Error ? err.message : String(err);
    console.info("[spots] Supabase fetch error, using static data:", msg);
    emit({ spots: staticSpots, loading: false, source: "static" });
  }
}

// Kick off the fetch immediately when this module is first imported.
// This means by the time the first component renders, the fetch is already
// in flight — and if it resolves quickly the UI shows live data on first
// meaningful paint.
fetchSpots();

// ── Public API ────────────────────────────────────────────────────────────

/** Returns the current spots array (Supabase or static fallback). */
export function useSpots(): Spot[] {
  return useSyncExternalStore(subscribe, () => state.spots, () => state.spots);
}

/** Returns the loading state and data source for debugging / UI hints. */
export function useSpotsState(): SpotsState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

/** Synchronous getter for use outside React (e.g. filter count in Filters page). */
export function getSpots(): Spot[] {
  return state.spots;
}

/** Force a re-fetch (e.g. after an admin edit). Resets the fetch guard. */
export function refetchSpots() {
  fetchStarted = false;
  fetchSpots();
}
