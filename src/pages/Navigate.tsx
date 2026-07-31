import { useEffect, useRef, useState } from "react";
import { ArrowUp, CornerUpRight, CornerUpLeft, Flag, Navigation2, X } from "lucide-react";
import { useLocation, useParams } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMap from "@/components/RealMap";
import { navRoute, navSteps, distM, nearestPointOnSegment, spots } from "@/lib/data";
import { fetchRoute, type RouteResult } from "@/lib/routing";
import { useLiveLocation } from "@/lib/useLiveLocation";

const DEFAULT_DEST_ID = "krog-street"; // matches the old scripted demo's endpoint
const TOTAL_MI = 1.4, TOTAL_MIN = 28, DUR_MS = 40000; // scripted-fallback constants (no ORS key / request failed)

function cumulative(route: [number, number][]) {
  const cum: number[] = [0];
  for (let i = 1; i < route.length; i++) cum.push(cum[i - 1] + distM(route[i - 1], route[i]));
  return cum;
}

function bearing(a: [number, number], b: [number, number]) {
  const toR = Math.PI / 180, toD = 180 / Math.PI;
  const y = Math.sin((b[0] - a[0]) * toR) * Math.cos(b[1] * toR);
  const x = Math.cos(a[1] * toR) * Math.sin(b[1] * toR) - Math.sin(a[1] * toR) * Math.cos(b[1] * toR) * Math.cos((b[0] - a[0]) * toR);
  return (Math.atan2(y, x) * toD + 360) % 360;
}
// scripted-fallback: where along navRoute a given overall progress fraction lands
function posAt(p: number, route: [number, number][], cum: number[]): { pos: [number, number]; brg: number } {
  const total = cum[cum.length - 1];
  const d = p * total;
  let i = 0;
  while (i < cum.length - 2 && cum[i + 1] < d) i++;
  const seg = cum[i + 1] - cum[i] || 1;
  const t = (d - cum[i]) / seg;
  const a = route[i], b = route[i + 1];
  return { pos: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], brg: bearing(a, b) };
}
// real-GPS mode: project a live fix onto the route polyline -> progress fraction
function progressAlong(pos: [number, number], route: [number, number][], cum: number[]): number {
  const total = cum[cum.length - 1] || 1;
  let best = Infinity, bestDist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const proj = nearestPointOnSegment(pos, route[i], route[i + 1]);
    const d = distM(pos, proj);
    if (d < best) { best = d; bestDist = cum[i] + distM(route[i], proj); }
  }
  return bestDist / total;
}
const fmtClock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const stepIcon = { up: ArrowUp, right: CornerUpRight, left: CornerUpLeft, flag: Flag } as const;

export default function Navigate() {
  const { id } = useParams<{ id?: string }>();
  const [, nav] = useLocation();
  const destSpot = spots.find((s) => s.id === id) ?? spots.find((s) => s.id === DEFAULT_DEST_ID) ?? spots[0];

  const mapRef = useRef<maplibregl.Map | null>(null);
  const puckRef = useRef<maplibregl.Marker | null>(null);
  const follow = useRef(true);
  const raf = useRef(0);
  const prev = useRef({ si: -1, mi: "", min: -1 });
  const lastFix = useRef<[number, number] | null>(null);

  const [route, setRoute] = useState<RouteResult | null | undefined>(undefined); // undefined = still loading
  const [step, setStep] = useState(navSteps[0]);
  const [eta, setEta] = useState({ mi: TOTAL_MI.toFixed(1), min: TOTAL_MIN, arr: "" });
  const [arrived, setArrived] = useState(false);
  const [recenterVisible, setRecenterVisible] = useState(false);

  const live = useLiveLocation(route !== undefined); // start tracking once we know which mode we're in

  // fetch a real route once we have a starting fix (falls back to the scripted
  // demo route if there's no ORS key, the request fails, or location is denied)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const origin: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const r = await fetchRoute(origin, [destSpot.lng, destSpot.lat]);
        if (r) {
          // show the real route's numbers immediately -- don't wait on a live
          // GPS fix that may be delayed (or, for a stationary point, never come)
          setStep(r.steps[0] ?? navSteps[0]);
          setEta({ mi: r.distanceMi.toFixed(1), min: r.durationMin, arr: fmtClock(Date.now() + r.durationMin * 60000) });
        }
        setRoute(r);
      },
      async () => setRoute(await fetchRoute(navRoute[0], [destSpot.lng, destSpot.lat])),
      { enableHighAccuracy: true, timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const routeCoords = route?.coordinates ?? navRoute;
  const routeSteps = route?.steps ?? navSteps;
  const cum = useRef(cumulative(routeCoords));
  useEffect(() => { cum.current = cumulative(routeCoords); }, [routeCoords]);

  // draw the route line once the map + route are both ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || route === undefined) return;

    const draw = () => {
      if (map.getSource("route")) {
        (map.getSource("route") as maplibregl.GeoJSONSource).setData({
          type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routeCoords },
        });
      } else {
        map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: routeCoords } } });
        map.addLayer({ id: "route-casing", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#7b1e86", "line-width": 12 } });
        map.addLayer({ id: "route-line", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#d946ef", "line-width": 6 } });

        const dest = document.createElement("div");
        dest.innerHTML = `<div class="nav-dest">📍</div>`;
        new maplibregl.Marker({ element: dest, anchor: "bottom" }).setLngLat(routeCoords[routeCoords.length - 1]).addTo(map);

        const puckEl = document.createElement("div");
        puckEl.innerHTML = `<div class="nav-puck"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2 L20 21 L12 16 L4 21 Z" fill="#fff"/></svg></div>`;
        puckRef.current = new maplibregl.Marker({ element: puckEl, rotationAlignment: "viewport" }).setLngLat(routeCoords[0]).addTo(map);

        map.jumpTo({ center: routeCoords[0], zoom: 15.5, pitch: 55 });
        map.on("dragstart", () => { follow.current = false; setRecenterVisible(true); });
      }
    };
    if (map.isStyleLoaded()) draw(); else map.once("load", draw);
  }, [route, routeCoords]);

  // real-GPS mode: advance progress from live fixes
  useEffect(() => {
    if (route === undefined || !route || !live.position || !puckRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    const pos: [number, number] = [live.position.lng, live.position.lat];
    const brg = live.position.heading ?? (lastFix.current && distM(lastFix.current, pos) > 3 ? bearing(lastFix.current, pos) : undefined);
    if (distM(lastFix.current ?? pos, pos) > 1 || !lastFix.current) lastFix.current = pos;

    puckRef.current.setLngLat(pos);
    if (follow.current) map.easeTo({ center: pos, bearing: brg, duration: 400 });

    const p = Math.min(1, progressAlong(pos, routeCoords, cum.current));
    let si = 0;
    for (let k = 0; k < route.steps.length; k++) if (route.steps[k].at <= p) si = k;
    if (si !== prev.current.si) { prev.current.si = si; setStep(route.steps[si]); }
    const remainMi = route.distanceMi * (1 - p);
    const remainMin = Math.max(0, Math.round(route.durationMin * (1 - p)));
    setEta({ mi: remainMi.toFixed(1), min: remainMin, arr: fmtClock(Date.now() + remainMin * 60000) });
    if (p >= 0.97) setArrived(true);
  }, [live.position, route, routeCoords]);

  // scripted-demo fallback: only runs when no real route could be fetched
  useEffect(() => {
    if (route !== null) return; // null = confirmed fallback mode; undefined = still loading, truthy = real route
    const map = mapRef.current;
    if (!map || !puckRef.current) return;

    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / DUR_MS, 1);
      const { pos, brg } = posAt(p, navRoute, cum.current);
      puckRef.current!.setLngLat(pos);
      if (follow.current) map.easeTo({ center: pos, bearing: brg, duration: 120, easing: (x) => x });

      let si = 0;
      for (let k = 0; k < navSteps.length; k++) if (navSteps[k].at <= p) si = k;
      if (si !== prev.current.si) { prev.current.si = si; setStep(navSteps[si]); }
      const mi = ((1 - p) * TOTAL_MI).toFixed(1);
      const min = Math.max(0, Math.round((1 - p) * TOTAL_MIN));
      if (mi !== prev.current.mi || min !== prev.current.min) {
        prev.current.mi = mi; prev.current.min = min;
        setEta({ mi, min, arr: fmtClock(Date.now() + min * 60000) });
      }
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setArrived(true);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [route]);

  const recenter = () => { follow.current = true; setRecenterVisible(false); };
  const StepIcon = stepIcon[step.icon];

  return (
    <Screen className="overflow-hidden bg-[#bcd9ea]">
      <RealMap interactive decorations={false} autoPitch={false} zoom={15.5} center={routeCoords[0]} onMap={(m) => (mapRef.current = m)} className="absolute inset-0" />

      {/* top instruction banner */}
      <div className="pointer-events-none absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10">
        <div className="overflow-hidden rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 bg-black/90 p-4 text-white">
            <StepIcon size={38} strokeWidth={2.5} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-3xl font-bold leading-none">{step.dist}</p>
              <p className="mt-1 truncate text-lg text-zinc-300">{step.text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* recenter */}
      {recenterVisible && (
        <button onClick={recenter}
          className="absolute bottom-40 right-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 font-semibold text-blue-600 shadow-lg">
          <Navigation2 size={16} /> Recenter
        </button>
      )}

      {/* bottom ETA card */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="rounded-3xl bg-white/95 p-4 shadow-xl backdrop-blur">
          {arrived ? (
            <p className="py-2 text-center text-xl font-bold text-zinc-900">You've arrived at {destSpot.name} 🎉</p>
          ) : (
            <div className="flex items-center justify-around text-center text-zinc-900">
              <div><p className="text-3xl font-bold">{eta.arr || "—"}</p><p className="text-sm text-zinc-500">arrival</p></div>
              <div><p className="text-3xl font-bold">{eta.min}</p><p className="text-sm text-zinc-500">min</p></div>
              <div><p className="text-3xl font-bold">{eta.mi}</p><p className="text-sm text-zinc-500">mi</p></div>
            </div>
          )}
          <button onClick={() => nav("/trail")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#c9187e] py-3 font-semibold text-white">
            <X size={18} /> End
          </button>
        </div>
      </div>
    </Screen>
  );
}
