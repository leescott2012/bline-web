import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Screen from "@/components/Screen";
import { ArrowLeft, Navigation2, ArrowUp, CornerUpRight, Play, X } from "lucide-react";
import { useLocation } from "wouter";
import { cumulative, posAt } from "@/lib/routing";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// Sample route coordinates for Eastside Trail near Ponce
const ROUTE_COORDINATES: [number, number][] = [
  [-84.3657, 33.7729], // Ponce City Market
  [-84.3658, 33.7716],
  [-84.3659, 33.7703],
  [-84.3660, 33.7690],
  [-84.3662, 33.7675],
  [-84.3665, 33.7660],
  [-84.3668, 33.7645],
];

const ROUTE_STEPS = [
  { at: 0, text: "Continue on Eastside Trail", dist: "350 ft", next: "then bear right toward Ponce City Market" },
  { at: 0.4, text: "Keep left on Eastside Trail", dist: "0.1 mi", next: "passing Historic Fourth Ward Park" },
  { at: 0.8, text: "Approaching Krog Street", dist: "200 ft", next: "destination on your right" },
];

export default function Playground3D() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const puckRef = useRef<mapboxgl.Marker | null>(null);
  const [, setLoc] = useLocation();
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isRecentered, setIsRecentered] = useState(true);

  const cumDist = useRef(cumulative(ROUTE_COORDINATES));

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: ROUTE_COORDINATES[0],
      zoom: 18.2,
      pitch: 60,
      bearing: -15,
      antialias: true,
    });

    mapRef.current = map;

    map.on("style.load", () => {
      map.setConfigProperty('basemap', 'lightPreset', 'dusk');
      
      map.addSource("route", {
        type: "geojson",
        lineMetrics: true,
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: ROUTE_COORDINATES,
          },
        },
      });

      // Signature Purple Glow
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#d946ef",
          "line-width": 10,
          "line-opacity": 0.9,
          "line-gradient": [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0, "#d946ef",
            1, "#a21caf"
          ]
        },
      });

      map.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#d946ef",
          "line-width": 24,
          "line-opacity": 0.25,
          "line-blur": 12,
        },
      });

      // User Puck
      const puckEl = document.createElement("div");
      puckEl.className = "puck-container";
      puckEl.innerHTML = `
        <div class="flex size-14 items-center justify-center rounded-full bg-white shadow-2xl ring-1 ring-black/5">
          <div class="flex size-10 items-center justify-center rounded-full bg-blue-600 text-white transition-transform duration-300" id="puck-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>
        </div>
      `;
      
      puckRef.current = new mapboxgl.Marker({ element: puckEl, rotationAlignment: "map" })
        .setLngLat(ROUTE_COORDINATES[0])
        .addTo(map);

      // Murals
      const muralEl = document.createElement("div");
      muralEl.className = "mural-decal";
      muralEl.style.width = "120px";
      muralEl.style.height = "80px";
      muralEl.style.backgroundImage = `url(https://images.unsplash.com/photo-1561059488-916d69792237?w=400&q=80)`;
      muralEl.style.backgroundSize = "cover";
      muralEl.style.borderRadius = "4px";
      muralEl.style.transform = "rotateY(20deg)";
      
      new mapboxgl.Marker({ element: muralEl })
        .setLngLat([-84.3654, 33.7725])
        .addTo(map);

      // Landmark Label
      const landmarkEl = document.createElement("div");
      landmarkEl.innerHTML = `
        <div class="rounded-xl bg-white px-4 py-2 shadow-2xl ring-1 ring-black/5">
          <p class="text-sm font-black text-black text-center leading-none">Ponce City Market</p>
          <p class="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">🏛️ Landmark</p>
        </div>
      `;
      new mapboxgl.Marker({ element: landmarkEl, anchor: "bottom" })
        .setLngLat([-84.3657, 33.7729])
        .addTo(map);
    });

    map.on("dragstart", () => setIsRecentered(false));

    return () => map.remove();
  }, []);

  // Navigation Animation Loop
  useEffect(() => {
    if (!isNavigating || !mapRef.current || !puckRef.current) return;

    let startTime = Date.now();
    const duration = 20000; // 20 seconds for the demo trip

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);

      const { pos, brg } = posAt(p, ROUTE_COORDINATES, cumDist.current);
      
      puckRef.current?.setLngLat(pos);
      const arrow = puckRef.current?.getElement().querySelector("#puck-arrow") as HTMLElement;
      if (arrow) arrow.style.transform = `rotate(${brg}deg)`;

      if (isRecentered) {
        mapRef.current?.easeTo({
          center: pos,
          bearing: brg,
          duration: 0,
        });
      }

      if (p < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsNavigating(false);
      }
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isNavigating, isRecentered]);

  const currentStep = ROUTE_STEPS.reduce((prev, curr) => (progress >= curr.at ? curr : prev), ROUTE_STEPS[0]);

  return (
    <Screen className="bg-black overflow-hidden">
      {/* Top Banner */}
      <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20">
        <div className="overflow-hidden rounded-[2.5rem] bg-black/95 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
          <div className="flex items-center gap-5 px-6 py-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
              <ArrowUp size={40} strokeWidth={3} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[28px] font-black leading-tight tracking-tight text-white">
                {currentStep.dist}
              </p>
              <p className="truncate text-[20px] font-bold text-zinc-400">
                {currentStep.text}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-white/5 bg-white/5 px-6 py-4">
            <CornerUpRight size={22} className="text-zinc-500" />
            <p className="text-[17px] font-bold text-zinc-300">
              {currentStep.next}
            </p>
          </div>
          <div className="h-1.5 w-full bg-white/10">
            <div 
              className="h-full bg-[#d946ef] transition-all duration-300 ease-linear shadow-[0_0_12px_#d946ef]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Navigation Controls */}
      {!isNavigating && progress === 0 && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <button 
            onClick={() => setIsNavigating(true)}
            className="group flex flex-col items-center gap-4 active:scale-95 transition-transform"
          >
            <div className="flex size-24 items-center justify-center rounded-full bg-hot text-white shadow-[0_0_40px_rgba(255,59,48,0.5)] ring-4 ring-white/20">
              <Play size={40} fill="currentColor" className="ml-2" />
            </div>
            <p className="text-xl font-black text-white uppercase tracking-[0.2em] drop-shadow-lg">Start TBT</p>
          </button>
        </div>
      )}

      {isNavigating && (
        <button 
          onClick={() => { setIsNavigating(false); setProgress(0); puckRef.current?.setLngLat(ROUTE_COORDINATES[0]); }}
          className="absolute right-6 top-[300px] z-20 flex size-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md ring-1 ring-white/20 active:scale-90"
        >
          <X size={20} />
        </button>
      )}

      {/* Recenter */}
      {!isRecentered && isNavigating && (
        <button 
          onClick={() => setIsRecentered(true)}
          className="absolute bottom-40 left-6 z-20 flex items-center gap-2 rounded-full bg-white px-6 py-4 font-black text-blue-600 shadow-2xl active:scale-95 ring-1 ring-black/5"
        >
          <Navigation2 size={20} fill="currentColor" />
          Recenter
        </button>
      )}

      {/* Bottom Card */}
      <div className="absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20">
        <div className="flex items-center justify-between rounded-[3rem] bg-white/95 px-10 py-8 shadow-2xl backdrop-blur-md ring-1 ring-black/5">
          <div className="text-center">
            <p className="text-[32px] font-black text-black tracking-tighter">3:29</p>
            <p className="text-[14px] font-bold uppercase tracking-widest text-zinc-500">arrival</p>
          </div>
          <div className="text-center">
            <p className="text-[32px] font-black text-black tracking-tighter">{Math.max(0, Math.round(3 * (1 - progress)))}</p>
            <p className="text-[14px] font-bold uppercase tracking-widest text-zinc-500">min</p>
          </div>
          <div className="text-center">
            <p className="text-[32px] font-black text-black tracking-tighter">{(0.2 * (1 - progress)).toFixed(1)}</p>
            <p className="text-[14px] font-bold uppercase tracking-widest text-zinc-500">mi</p>
          </div>
        </div>
      </div>
      
      {/* Trail Label */}
      <div className="absolute left-1/2 top-[82%] z-20 -translate-x-1/2">
        <div className="rounded-lg bg-white/90 px-3 py-1 text-center shadow-lg backdrop-blur-sm ring-1 ring-black/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Eastside Trail</p>
        </div>
      </div>

      <button
        onClick={() => setLoc("/")}
        className="absolute left-4 top-4 z-50 flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md active:scale-90 ring-1 ring-white/10"
      >
        <ArrowLeft size={20} />
      </button>
    </Screen>
  );
}
