import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getMapStyleDef } from "@/lib/mapStyle";
import Screen from "@/components/Screen";
import { ArrowLeft, ArrowUp, CornerUpRight, Navigation2, Play, X } from "lucide-react";
import { useLocation } from "wouter";
import { cumulative, posAt } from "@/lib/routing";
import {
  PONCE_SCENE,
  PONCE_TRAIL_ROUTE,
} from "@/lib/ponceScene";

// The 3D playground uses the same free, keyless Esri imagery style as the
// production Map selector. It deliberately does not require a paid Mapbox token.
const SATELLITE_STYLE = getMapStyleDef("satellite").style;
const METERS_TO_MILES = 0.000621371;
const WALKING_MPH = 3;

function formatDistance(miles: number) {
  if (miles < 0.15) return `${Math.max(50, Math.round(miles * 5280 / 25) * 25)} ft`;
  return `${miles.toFixed(1)} mi`;
}

function formatArrival(minutes: number) {
  const arrival = new Date(Date.now() + minutes * 60_000);
  return arrival.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(" ", "");
}

function createTreeMarker() {
  const tree = document.createElement("div");
  tree.setAttribute("aria-hidden", "true");
  tree.style.cssText = [
    "width:26px",
    "height:36px",
    "position:relative",
    "filter:drop-shadow(0 3px 3px rgba(0,0,0,.22))",
    "pointer-events:none",
  ].join(";");
  tree.innerHTML = `
    <span style="position:absolute;left:11px;bottom:0;width:4px;height:15px;border-radius:4px;background:#59412d"></span>
    <span style="position:absolute;left:1px;top:9px;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 35% 27%,#b4d867 0 10%,#4e9c4d 42%,#226a3b 100%);box-shadow:-6px 5px 0 -1px #347a42,6px 5px 0 -1px #5fa84d,0 -5px 0 0 #71b85b"></span>
  `;
  return tree;
}

function createPuck() {
  const puck = document.createElement("div");
  puck.setAttribute("aria-label", "Navigation position");
  puck.innerHTML = `
    <div style="display:grid;place-items:center;width:52px;height:52px;border-radius:999px;background:#fff;box-shadow:0 10px 24px rgba(0,0,0,.35),0 0 0 1px rgba(0,0,0,.12)">
      <div id="puck-arrow" style="display:grid;place-items:center;width:40px;height:40px;border-radius:999px;background:#1976f3;color:#fff;transition:transform 120ms linear">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2Z"/></svg>
      </div>
    </div>
  `;
  return puck;
}

export default function Playground3D() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const puckRef = useRef<maplibregl.Marker | null>(null);
  const animationRef = useRef<number | null>(null);
  const [, setLocation] = useLocation();
  const startsActive = new URLSearchParams(window.location.search).get("autoplay") === "1";
  const [isNavigating, setIsNavigating] = useState(startsActive);
  const [progress, setProgress] = useState(0);
  const [isRecentered, setIsRecentered] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const cumulativeDistance = useMemo(() => cumulative(PONCE_TRAIL_ROUTE), []);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      // Keyless satellite imagery provides real ground context without a paid
      // Mapbox dependency or a client-visible access token.
      style: SATELLITE_STYLE,
      center: PONCE_TRAIL_ROUTE[0],
      zoom: PONCE_SCENE.camera.zoom,
      pitch: PONCE_SCENE.camera.pitch,
      bearing: PONCE_SCENE.camera.bearing,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    // The route view must remain full-bleed while Screen completes its mobile
    // transition and whenever its viewport changes. Without this observer,
    // the map canvas can retain a short initial height and leave a dark empty lower half.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(mapContainerRef.current);

    map.on("style.load", () => {
      map.resize();
      // Do not impersonate PCM with a generic 3D facade. Satellite ground is
      // the honest baseline until a licensed scan or verified PCM 3D model is
      // available; the real route and landmark markers remain explicit.

      map.addSource("ponce-route", {
        type: "geojson",
        lineMetrics: true,
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: PONCE_TRAIL_ROUTE },
        },
      });
      // The user requested a bright green route ribbon. The wide translucent
      // layer creates the route's ground-level glow without faking pavement.
      map.addLayer({
        id: "ponce-route-glow",
        type: "line",
        source: "ponce-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#30ff47", "line-width": 26, "line-opacity": 0.28, "line-blur": 9 },
      });
      map.addLayer({
        id: "ponce-route-core",
        type: "line",
        source: "ponce-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": 9,
          "line-opacity": 0.98,
          "line-gradient": [
            "interpolate", ["linear"], ["line-progress"],
            0, "#d8ff47",
            0.52, "#30ff47",
            1, "#00b933",
          ],
        },
      });

      const buildingLabel = document.createElement("button");
      buildingLabel.type = "button";
      buildingLabel.setAttribute("aria-label", "Ponce City Market landmark");
      buildingLabel.style.cssText = "border:0;border-radius:12px;background:rgba(255,255,255,.95);padding:8px 12px;box-shadow:0 8px 22px rgba(0,0,0,.28);font:800 13px/1.1 system-ui;color:#1c1917;cursor:default";
      buildingLabel.textContent = "Ponce City Market";
      new maplibregl.Marker({ element: buildingLabel, anchor: "bottom" })
        .setLngLat([-84.36535, 33.77282])
        .addTo(map);

      puckRef.current = new maplibregl.Marker({ element: createPuck(), anchor: "center", rotationAlignment: "map" })
        .setLngLat(PONCE_TRAIL_ROUTE[0])
        .addTo(map);
      setMapReady(true);
    });

    map.on("dragstart", () => setIsRecentered(false));
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!isNavigating || !mapReady || !mapRef.current || !puckRef.current) return;
    const startedAt = performance.now();
    const demoDuration = 22_000;

    const animate = (now: number) => {
      const nextProgress = Math.min((now - startedAt) / demoDuration, 1);
      setProgress(nextProgress);
      const { pos, brg } = posAt(nextProgress, PONCE_TRAIL_ROUTE, cumulativeDistance);
      puckRef.current?.setLngLat(pos);
      const arrow = puckRef.current?.getElement().querySelector("#puck-arrow") as HTMLElement | null;
      if (arrow) arrow.style.transform = `rotate(${brg}deg)`;

      if (isRecentered) {
        mapRef.current?.jumpTo({ center: pos, bearing: brg, pitch: PONCE_SCENE.camera.pitch });
      }
      if (nextProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsNavigating(false);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [cumulativeDistance, isNavigating, isRecentered, mapReady]);

  const routeMiles = cumulativeDistance[cumulativeDistance.length - 1] * METERS_TO_MILES;
  const totalMinutes = Math.max(1, Math.ceil((routeMiles / WALKING_MPH) * 60));
  const remainingMiles = routeMiles * (1 - progress);
  const remainingMinutes = Math.max(0, Math.ceil(totalMinutes * (1 - progress)));
  const approaching = progress >= 0.72;
  const primaryInstruction = approaching ? "Ponce City Market ahead" : "Continue on Eastside Trail";
  const secondaryInstruction = approaching ? "destination beside the trail" : "brick corridor and park edge ahead";

  const resetPreview = () => {
    setIsNavigating(false);
    setProgress(0);
    setIsRecentered(true);
    puckRef.current?.setLngLat(PONCE_TRAIL_ROUTE[0]);
    mapRef.current?.easeTo({
      center: PONCE_TRAIL_ROUTE[0],
      zoom: PONCE_SCENE.camera.zoom,
      pitch: PONCE_SCENE.camera.pitch,
      bearing: PONCE_SCENE.camera.bearing,
      duration: 650,
    });
  };

  return (
    <Screen className="overflow-hidden bg-[#1e2722]" style={{ height: "100dvh" }}>
      <div ref={mapContainerRef} className="absolute inset-0 [--bline-map-ctrl-bottom:calc(6.5rem+max(1rem,env(safe-area-inset-bottom)))]" style={{ height: "100dvh" }} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(5,12,8,.18)_100%)]" />

      <button
        aria-label="Back to map"
        onClick={() => setLocation("/map")}
        className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-30 grid size-10 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-md ring-1 ring-white/15 active:scale-95"
      >
        <ArrowLeft size={19} />
      </button>

      <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 px-12">
        <div className="overflow-hidden rounded-[2rem] bg-black/[.93] shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-black shadow-lg">
              <ArrowUp size={35} strokeWidth={3} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[27px] font-black leading-none tracking-tight text-white">{formatDistance(remainingMiles)}</p>
              <p className="mt-1 truncate text-[17px] font-semibold text-zinc-400">{primaryInstruction}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 bg-white/[.06] px-5 py-3">
            <CornerUpRight size={19} className="shrink-0 text-zinc-500" />
            <p className="truncate text-[14px] font-semibold text-zinc-300">{secondaryInstruction}</p>
          </div>
          <div className="h-1.5 bg-white/10">
            <div className="h-full bg-[#30ff47] shadow-[0_0_14px_#30ff47] transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>

      {!isNavigating && progress === 0 && (
        <div className="absolute inset-0 z-25 grid place-items-center bg-black/10">
          <button onClick={() => setIsNavigating(true)} className="grid place-items-center gap-3 active:scale-95">
            <span className="grid size-20 place-items-center rounded-full bg-[#30e85a] text-[#062c10] shadow-[0_0_35px_rgba(48,232,90,.55)] ring-4 ring-white/30">
              <Play size={33} fill="currentColor" />
            </span>
            <span className="rounded-full bg-black/65 px-4 py-2 text-[13px] font-black uppercase tracking-[.17em] text-white backdrop-blur-md">Start TBT preview</span>
          </button>
        </div>
      )}

      {isNavigating && (
        <button
          aria-label="Exit turn-by-turn preview"
          onClick={resetPreview}
          className="absolute right-5 top-[232px] z-20 grid size-11 place-items-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur-md ring-1 ring-white/15 active:scale-95"
        >
          <X size={20} />
        </button>
      )}

      {!isRecentered && (
        <button
          onClick={() => setIsRecentered(true)}
          className="absolute bottom-40 left-5 z-20 flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-blue-600 shadow-2xl active:scale-95"
        >
          <Navigation2 size={18} fill="currentColor" />
          Recenter
        </button>
      )}

      <div className="absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20">
        <div className="grid grid-cols-3 rounded-[2rem] bg-white/[.96] px-7 py-5 text-center shadow-2xl ring-1 ring-black/5 backdrop-blur-md">
          <div>
            <p className="text-[28px] font-black leading-none tracking-tighter text-zinc-950">{formatArrival(remainingMinutes)}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[.13em] text-zinc-500">arrival</p>
          </div>
          <div>
            <p className="text-[28px] font-black leading-none tracking-tighter text-zinc-950">{remainingMinutes}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[.13em] text-zinc-500">min</p>
          </div>
          <div>
            <p className="text-[28px] font-black leading-none tracking-tighter text-zinc-950">{remainingMiles.toFixed(1)}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[.13em] text-zinc-500">mi</p>
          </div>
        </div>
      </div>
    </Screen>
  );
}
