// Real turn-by-turn directions via OpenRouteService (free API key, foot-walking
// profile -- routes on actual trail/path data, not just roads). Falls back to
// null (caller decides what to show instead) when no key is configured or the
// request fails, so the app degrades gracefully rather than crashing.

export interface RouteStep {
  at: number; // fraction of total distance where this step begins (0..1)
  icon: "up" | "right" | "left" | "flag";
  dist: string;
  text: string;
  name?: string; // street/trail name, drawn along the route line
}

export interface RouteResult {
  coordinates: [number, number][];
  steps: RouteStep[];
  distanceMi: number;
  durationMin: number;
}

interface OrsStep {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name?: string;
}

interface OrsResponse {
  features?: {
    geometry?: { coordinates: [number, number][] };
    properties?: { segments?: { distance: number; duration: number; steps: OrsStep[] }[] };
  }[];
}

const ORS_KEY = import.meta.env.VITE_ORS_API_KEY as string | undefined;
const M_TO_MI = 0.000621371;

// ORS maneuver types -> our icon set. Anything not a clear left/right/arrival
// reads as "continue straight".
const STEP_ICON: Record<number, RouteStep["icon"]> = {
  0: "left", 2: "left", 4: "left", 12: "left",
  1: "right", 3: "right", 5: "right", 13: "right",
  10: "flag",
};

function formatDist(m: number): string {
  const mi = m * M_TO_MI;
  if (mi < 0.1) return `${Math.round(m * 3.28084)} ft`;
  return `${mi.toFixed(1)} mi`;
}

export async function fetchRoute(from: [number, number], to: [number, number]): Promise<RouteResult | null> {
  if (!ORS_KEY) return null;
  try {
    const res = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
      method: "POST",
      headers: { Authorization: ORS_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: [from, to] }),
    });
    if (!res.ok) return null;
    const data: OrsResponse = await res.json();
    const feature = data.features?.[0];
    const coordinates = feature?.geometry?.coordinates;
    const segment = feature?.properties?.segments?.[0];
    if (!coordinates?.length || !segment) return null;

    const totalM = segment.distance;
    let cum = 0;
    const steps: RouteStep[] = segment.steps.map((s) => {
      const at = totalM > 0 ? cum / totalM : 0;
      cum += s.distance;
      return {
        at,
        icon: STEP_ICON[s.type] ?? "up",
        dist: s.type === 10 ? "Arrive" : formatDist(s.distance),
        text: s.instruction,
        // ORS uses "-" for unnamed paths; treat that as no label at all.
        name: s.name && s.name !== "-" ? s.name : undefined,
      };
    });

    return { coordinates, steps, distanceMi: totalM * M_TO_MI, durationMin: Math.round(segment.duration / 60) };
  } catch {
    return null;
  }
}
