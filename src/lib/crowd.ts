import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// Crowd density for the map heatmap. The `locations` table is unreadable across
// users by design (RLS), so this goes through two security-definer functions
// that return aggregates only -- see supabase-crowd-migration.sql.

export interface CrowdCell { lng: number; lat: number; people: number }

export interface Crowd {
  /** Heatmap points: live cells only (each already past the k-anonymity floor). Never seeded. */
  points: { lng: number; lat: number; weight: number }[];
  /** B-line users sharing a location in the last 30 min -- not everyone on the trail. */
  people: number;
  /** "unavailable" when the RPCs fail; the UI must say so rather than draw anything. */
  status: "loading" | "live" | "unavailable";
}

// Three people (the k-anonymity floor) lands at 0.5; six or more saturates.
const liveWeight = (people: number) => Math.min(1, people / 6);

const REFRESH_MS = 60_000;

export async function fetchCrowd(): Promise<Crowd> {
  const [cells, total] = await Promise.all([
    supabase.rpc("crowd_density"),
    supabase.rpc("trail_people_now"),
  ]);
  if (cells.error || total.error) return { points: [], people: 0, status: "unavailable" };
  const live = (cells.data as CrowdCell[] | null) ?? [];
  return {
    points: live.map((c) => ({ lng: c.lng, lat: c.lat, weight: liveWeight(c.people) })),
    people: (total.data as number | null) ?? 0,
    status: "live",
  };
}

// Polls while the heatmap is on. No realtime subscription: `locations` only
// pushes rows you're allowed to read, which for the aggregate is nobody.
export function useCrowd(enabled: boolean): Crowd {
  const [crowd, setCrowd] = useState<Crowd>({ points: [], people: 0, status: "loading" });

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    const load = () => fetchCrowd()
      .catch((): Crowd => ({ points: [], people: 0, status: "unavailable" }))
      .then((c) => { if (!stopped) setCrowd(c); });
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { stopped = true; clearInterval(id); };
  }, [enabled]);

  return crowd;
}
