import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { crowdDensityPoints } from "./data";

// Crowd density for the map heatmap. The `locations` table is unreadable across
// users by design (RLS), so this goes through two security-definer functions
// that return aggregates only -- see supabase-crowd-migration.sql.

export interface CrowdCell { lng: number; lat: number; people: number }

export interface Crowd {
  /** Heatmap points: the seeded baseline with any live cells layered on top. */
  points: { lng: number; lat: number; weight: number }[];
  /** People on the trail in the last 30 min. 0 until B-line has real users. */
  people: number;
}

// Live cells outrank the seeded baseline, so a real cluster reads hotter than
// the demo data underneath it. Three people (the k-anonymity floor) lands at
// 0.5; six or more saturates.
const liveWeight = (people: number) => Math.min(1, people / 6);

// While the app has no real users the seeded points are all there is to draw,
// and an empty map would read as a broken feature rather than an empty trail.
// Nothing here claims to be live -- the "N on the trail" label in CrowdPanel is
// driven by `people`, which only ever counts real fixes.
const SEEDED = crowdDensityPoints;

const REFRESH_MS = 60_000;

export async function fetchCrowd(): Promise<Crowd> {
  const [cells, total] = await Promise.all([
    supabase.rpc("crowd_density"),
    supabase.rpc("trail_people_now"),
  ]);
  const live = (cells.data as CrowdCell[] | null) ?? [];
  return {
    points: [...SEEDED, ...live.map((c) => ({ lng: c.lng, lat: c.lat, weight: liveWeight(c.people) }))],
    people: (total.data as number | null) ?? 0,
  };
}

// Polls while the heatmap is on. No realtime subscription: `locations` only
// pushes rows you're allowed to read, which for the aggregate is nobody.
export function useCrowd(enabled: boolean): Crowd {
  const [crowd, setCrowd] = useState<Crowd>({ points: SEEDED, people: 0 });

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    const load = () => fetchCrowd().then((c) => { if (!stopped) setCrowd(c); });
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { stopped = true; clearInterval(id); };
  }, [enabled]);

  return crowd;
}
