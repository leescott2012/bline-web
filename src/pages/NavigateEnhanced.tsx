import { useEffect, useRef, useState } from "react";
import { ArrowUp, CornerUpRight, CornerUpLeft, Flag, Navigation2, X, ChevronDown } from "lucide-react";
import { useLocation, useParams } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMapEnhanced from "@/components/RealMapEnhanced";
import { navRoute, navSteps, distM, nearestPointOnSegment } from "@/lib/data";
import { useSpots } from "@/lib/spots";
import { fetchRoute, cumulative, bearing, posAt, type RouteResult, type RouteStep } from "@/lib/routing";
import { useLiveLocation } from "@/lib/useLiveLocation";

const DEFAULT_DEST_ID = "krog-street";
const TOTAL_MI = 1.4,
  TOTAL_MIN = 28,
  DUR_MS = 40000;


function progressAlong(
  pos: [number, number],
  route: [number, number][],
  cum: number[]
): number {
  const total = cum[cum.length - 1] || 1;
  let best = Infinity,
    bestDist = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const proj = nearestPointOnSegment(pos, route[i], route[i + 1]);
    const d = distM(pos, proj);
    if (d < best) {
      best = d;
      bestDist = cum[i] + distM(route[i], proj);
    }
  }
  return bestDist / total;
}

const fmtClock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const stepIcon = { up: ArrowUp, right: CornerUpRight, left: CornerUpLeft, flag: Flag } as const;

export default function NavigateEnhanced() {
  const { id } = useParams<{ id?: string }>();
  const [, nav] = useLocation();
  const spots = useSpots();
  const destSpot =
    spots.find((s) => s.id === id) ??
    spots.find((s) => s.id === DEFAULT_DEST_ID) ??
    spots[0];

  const mapRef = useRef<maplibregl.Map | null>(null);
  const puckRef = useRef<maplibregl.Marker | null>(null);
  const follow = useRef(true);
  const raf = useRef(0);
  const prev = useRef({ si: -1, mi: "", min: -1 });
  const lastFix = useRef<[number, number] | null>(null);

  const [route, setRoute] = useState<RouteResult | null | undefined>(undefined);
  const [step, setStep] = useState<RouteStep>(navSteps[0]);
  const [stepIdx, setStepIdx] = useState(0);
  const [eta, setEta] = useState({ mi: TOTAL_MI.toFixed(1), min: TOTAL_MIN, arr: "" });
  const [arrived, setArrived] = useState(false);
  const [recenterVisible, setRecenterVisible] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState(false);
  const [progress, setProgress] = useState(0);

  const live = useLiveLocation(route !== undefined);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const origin: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const r = await fetchRoute(origin, [destSpot.lng, destSpot.lat]);
        if (r) {
          setStep(r.steps[0] ?? navSteps[0]);
          setStepIdx(0);
          setEta({
            mi: r.distanceMi.toFixed(1),
            min: r.durationMin,
            arr: fmtClock(Date.now() + r.durationMin * 60000),
          });
        }
        setRoute(r);
      },
      async () => setRoute(await fetchRoute(navRoute[0], [destSpot.lng, destSpot.lat])),
      { enableHighAccuracy: true, timeout: 8000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const routeCoords = route?.coordinates ?? navRoute;
  const routeSteps = route?.steps ?? navSteps;
  const cum = useRef(cumulative(routeCoords));
  useEffect(() => {
    cum.current = cumulative(routeCoords);
  }, [routeCoords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || route === undefined) return;

    const draw = () => {
      if (map.getSource("route")) {
        (map.getSource("route") as maplibregl.GeoJSONSource).setData({
          type: "Feature",
          properties: { name: step.name ?? "" },
          geometry: { type: "LineString", coordinates: routeCoords },
        });
      } else {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: { name: step.name ?? "" },
            geometry: { type: "LineString", coordinates: routeCoords },
          },
        });

        // Route casing (shadow/depth)
        map.addLayer({
          id: "route-casing",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#7b1e86", "line-width": 14, "line-opacity": 0.4 },
        });

        // Main route line (vibrant magenta)
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#d946ef", "line-width": 6, "line-opacity": 0.95 },
        });

        // Route label (street name)
        map.addLayer({
          id: "route-label",
          type: "symbol",
          source: "route",
          layout: {
            "symbol-placement": "line-center",
            "text-field": ["get", "name"],
            "text-size": 14,
            "text-font": ["Noto Sans Bold", "Open Sans Bold"],
            "text-padding": 8,
            "text-rotation-alignment": "map",
          },
          paint: {
            "text-color": "#3b0d43",
            "text-halo-color": "#ffffff",
            "text-halo-width": 2.5,
          },
        });

        // Destination marker
        const dest = document.createElement("div");
        dest.innerHTML = `<div style="font-size: 28px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));">📍</div>`;
        new maplibregl.Marker({ element: dest, anchor: "bottom" })
          .setLngLat(routeCoords[routeCoords.length - 1])
          .addTo(map);

        // User puck (navigation marker)
        const puckEl = document.createElement("div");
        puckEl.innerHTML = `<div class="nav-puck"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2 L20 21 L12 16 L4 21 Z" fill="#fff"/></svg></div>`;
        puckRef.current = new maplibregl.Marker({
          element: puckEl,
          rotationAlignment: "viewport",
        })
          .setLngLat(routeCoords[0])
          .addTo(map);

        map.jumpTo({ center: routeCoords[0], zoom: 15.5, pitch: 55 });
        map.on("dragstart", () => {
          follow.current = false;
          setRecenterVisible(true);
        });
      }
    };

    if (map.isStyleLoaded()) draw();
    else map.once("load", draw);
  }, [route, routeCoords]);

  useEffect(() => {
    const src = mapRef.current?.getSource("route") as maplibregl.GeoJSONSource | undefined;
    src?.setData({
      type: "Feature",
      properties: { name: step.name ?? "" },
      geometry: { type: "LineString", coordinates: routeCoords },
    });
  }, [step, routeCoords]);

  // Real GPS mode
  useEffect(() => {
    if (route === undefined || !route || !live.position || !puckRef.current) return;
    const map = mapRef.current;
    if (!map) return;

    const pos: [number, number] = [live.position.lng, live.position.lat];
    const brg =
      live.position.heading ??
      (lastFix.current && distM(lastFix.current, pos) > 3
        ? bearing(lastFix.current, pos)
        : undefined);

    if (distM(lastFix.current ?? pos, pos) > 1 || !lastFix.current)
      lastFix.current = pos;

    puckRef.current.setLngLat(pos);
    // Pass `bearing` only when we actually have one. MapLibre tests
    // `'bearing' in options`, so an explicit `undefined` is treated as a
    // supplied value and lands in the camera transform as NaN -- which throws
    // "Invalid LngLat (NaN, NaN)" and blanks the screen. brg is undefined for
    // any device that reports no heading and hasn't moved 3m, i.e. anyone
    // standing still.
    if (follow.current)
      map.easeTo({ center: pos, ...(brg == null ? {} : { bearing: brg }), duration: 400 });

    const p = Math.min(1, progressAlong(pos, routeCoords, cum.current));
    setProgress(p);

    let si = 0;
    for (let k = 0; k < route.steps.length; k++) if (route.steps[k].at <= p) si = k;
    if (si !== prev.current.si) {
      prev.current.si = si;
      setStep(route.steps[si]);
      setStepIdx(si);
    }

    const remainMi = route.distanceMi * (1 - p);
    const remainMin = Math.max(0, Math.round(route.durationMin * (1 - p)));
    setEta({
      mi: remainMi.toFixed(1),
      min: remainMin,
      arr: fmtClock(Date.now() + remainMin * 60000),
    });

    if (p >= 0.97) setArrived(true);
  }, [live.position, route, routeCoords]);

  // Scripted fallback
  useEffect(() => {
    if (route !== null) return;
    const map = mapRef.current;
    if (!map || !puckRef.current) return;

    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / DUR_MS, 1);
      setProgress(p);

      const { pos, brg } = posAt(p, navRoute, cum.current);
      puckRef.current!.setLngLat(pos);
      if (follow.current)
        map.easeTo({
          center: pos,
          ...(brg == null ? {} : { bearing: brg }),
          duration: 120,
          easing: (x) => x,
        });

      let si = 0;
      for (let k = 0; k < navSteps.length; k++) if (navSteps[k].at <= p) si = k;
      if (si !== prev.current.si) {
        prev.current.si = si;
        setStep(navSteps[si]);
        setStepIdx(si);
      }

      const mi = ((1 - p) * TOTAL_MI).toFixed(1);
      const min = Math.max(0, Math.round((1 - p) * TOTAL_MIN));
      if (mi !== prev.current.mi || min !== prev.current.min) {
        prev.current.mi = mi;
        prev.current.min = min;
        setEta({ mi, min, arr: fmtClock(Date.now() + min * 60000) });
      }

      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setArrived(true);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [route]);

  const recenter = () => {
    follow.current = true;
    setRecenterVisible(false);
  };

  const StepIcon = stepIcon[step.icon];
  const nextStep = routeSteps[stepIdx + 1];
  const NextIcon = nextStep ? stepIcon[nextStep.icon] : null;

  // Progress bar (0-100%)
  const progressPercent = Math.round(progress * 100);

  return (
    <Screen className="overflow-hidden bg-[#bcd9ea]">
      <RealMapEnhanced
        interactive
        decorations={false}
        autoPitch={false}
        zoom={15.5}
        center={routeCoords[0]}
        onMap={(m) => (mapRef.current = m)}
        className="absolute inset-0"
      />

      {/* ── Top instruction banner (premium styling) ── */}
      <div className="pointer-events-none absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10">
        <div className="overflow-hidden rounded-3xl shadow-2xl">
          {/* Main instruction */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-black/95 to-black/80 p-5 text-white">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-hot/20">
              <StepIcon size={24} strokeWidth={2.5} className="text-hot" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-300">In {step.dist}</p>
              <p className="mt-0.5 truncate text-2xl font-bold leading-none">{step.text}</p>
            </div>
          </div>

          {/* Next maneuver preview */}
          {NextIcon && nextStep && (
            <div className="flex items-center gap-3 border-t border-white/10 bg-black/70 px-5 py-3 text-zinc-300">
              <NextIcon size={18} strokeWidth={2.5} className="shrink-0 text-zinc-400" />
              <p className="min-w-0 truncate text-[14px]">
                <span className="text-zinc-500">then </span>
                {nextStep.text}
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div className="h-1 bg-black/30">
            <div
              className="h-full bg-gradient-to-r from-hot to-accent transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Steps list (collapsible) ── */}
      {expandedSteps && (
        <div className="pointer-events-auto absolute inset-x-3 top-[max(16rem,env(safe-area-inset-top))] z-10 max-h-64 overflow-y-auto rounded-2xl bg-black/90 shadow-2xl backdrop-blur">
          <div className="divide-y divide-zinc-700">
            {routeSteps.map((s, i) => {
              const StepIco = stepIcon[s.icon];
              const isActive = i === stepIdx;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    isActive ? "bg-hot/20" : "hover:bg-white/5"
                  }`}
                >
                  <StepIco size={16} className={isActive ? "text-hot" : "text-zinc-500"} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-400">{s.dist}</p>
                    <p className={`truncate text-sm ${isActive ? "font-bold text-white" : "text-zinc-300"}`}>
                      {s.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recenter button ── */}
      {recenterVisible && (
        <button
          onClick={recenter}
          className="pointer-events-auto absolute bottom-40 right-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 font-semibold text-blue-600 shadow-lg hover:bg-white"
        >
          <Navigation2 size={16} /> Recenter
        </button>
      )}

      {/* ── Bottom ETA card (premium) ── */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 space-y-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Steps toggle */}
        <button
          onClick={() => setExpandedSteps(!expandedSteps)}
          className="flex w-full items-center justify-between rounded-2xl bg-black/70 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/80"
        >
          <span>{routeSteps.length} steps</span>
          <ChevronDown
            size={18}
            className={`transition-transform ${expandedSteps ? "rotate-180" : ""}`}
          />
        </button>

        {/* ETA card */}
        <div className="rounded-3xl bg-white/95 p-5 shadow-xl backdrop-blur">
          {arrived ? (
            <div className="text-center">
              <p className="text-3xl font-bold text-zinc-900">🎉</p>
              <p className="mt-2 text-lg font-bold text-zinc-900">
                You've arrived at {destSpot.name}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Arrival
                  </p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900">{eta.arr || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Duration
                  </p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900">{eta.min}m</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Distance
                  </p>
                  <p className="mt-1 text-2xl font-bold text-zinc-900">{eta.mi}mi</p>
                </div>
              </div>
              <button
                onClick={() => nav("/trail")}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-hot to-accent py-3 font-semibold text-white hover:shadow-lg"
              >
                <X size={18} /> End Navigation
              </button>
            </>
          )}
        </div>
      </div>
    </Screen>
  );
}
