import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Screen from "@/components/Screen";
import { ArrowLeft, Navigation2, ArrowUp, CornerUpRight, Play } from "lucide-react";
import { useLocation } from "wouter";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function Playground3D() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [, setLoc] = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [-84.3657, 33.7729], // Ponce City Market
      zoom: 18.2,
      pitch: 60,
      bearing: -15,
      antialias: true,
    });

    mapRef.current = map;

    map.on("style.load", () => {
      // 1. Set Cinematic Lighting (Dusk/Golden Hour)
      map.setConfigProperty('basemap', 'lightPreset', 'dusk');
      
      // 2. Add the Signature "Purple Glow" Route
      const routeCoords = [
        [-84.3657, 33.7729],
        [-84.3658, 33.7716],
        [-84.3659, 33.7703],
        [-84.3660, 33.7690],
      ];

      map.addSource("route", {
        type: "geojson",
        lineMetrics: true, // Required for gradients
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoords,
          },
        },
      });

      // The "Signature Purple Glow" Path
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

      // Outer Blur Glow
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

      // 3. Add Mural Decals (Simulated via Markers on building faces)
      const muralPositions = [
        { lng: -84.3654, lat: 33.7725, img: "/photos/ponce-wide.png" },
        { lng: -84.3655, lat: 33.7718, img: "https://images.unsplash.com/photo-1561059488-916d69792237?w=400&q=80" }
      ];

      muralPositions.forEach((m, i) => {
        const el = document.createElement("div");
        el.className = "mural-decal";
        el.style.width = "120px";
        el.style.height = "80px";
        el.style.backgroundImage = `url(${m.img})`;
        el.style.backgroundSize = "cover";
        el.style.borderRadius = "4px";
        el.style.border = "2px solid rgba(255,255,255,0.2)";
        el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5)";
        el.style.transform = "rotateY(20deg)"; // Perspective tilt
        
        new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([m.lng, m.lat])
          .addTo(map);
      });

      // 4. Add 3D Landmark Labels
      const landmarkEl = document.createElement("div");
      landmarkEl.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="rounded-xl bg-white px-4 py-2 shadow-2xl ring-1 ring-black/5 transition-transform group-hover:scale-105">
            <p class="text-sm font-black text-black text-center leading-none">Ponce City Market</p>
            <p class="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">🏛️ Landmark</p>
          </div>
          <div class="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-white shadow-lg" />
        </div>
      `;
      new mapboxgl.Marker({ element: landmarkEl, anchor: "bottom" })
        .setLngLat([-84.3657, 33.7729])
        .addTo(map);
    });

    // Simulate progress
    const timer = setInterval(() => {
      setProgress((p) => (p < 100 ? p + 0.1 : 0));
    }, 100);

    return () => {
      clearInterval(timer);
      map.remove();
    };
  }, []);

  return (
    <Screen className="bg-black overflow-hidden">
      {/* Back Button */}
      <div className="absolute left-4 top-4 z-50">
        <button
          onClick={() => setLoc("/")}
          className="flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md active:scale-90 ring-1 ring-white/10"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Top Instruction Banner (Pixel-Perfect to Screenshot) */}
      <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20">
        <div className="overflow-hidden rounded-[2.5rem] bg-black/95 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10">
          <div className="flex items-center gap-5 px-6 py-6">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
              <ArrowUp size={40} strokeWidth={3} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[28px] font-black leading-tight tracking-tight text-white">
                350 ft
              </p>
              <p className="truncate text-[20px] font-bold text-zinc-400">
                Continue on Eastside Trail
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-white/5 bg-white/5 px-6 py-4">
            <CornerUpRight size={22} className="text-zinc-500" />
            <p className="text-[17px] font-bold text-zinc-300">
              then bear right toward Ponce City Market
            </p>
          </div>
          {/* Signature Purple Progress Bar */}
          <div className="h-1.5 w-full bg-white/10">
            <div 
              className="h-full bg-[#d946ef] transition-all duration-300 ease-linear shadow-[0_0_12px_#d946ef]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mapbox Container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* 3D Tour Button (Strategy Bridge) */}
      <button 
        onClick={() => setLoc("/trail")}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex size-14 items-center justify-center rounded-full bg-hot text-white shadow-2xl ring-4 ring-hot/20 active:scale-90"
      >
        <Play size={24} fill="currentColor" />
      </button>

      {/* Recenter Button */}
      <button className="absolute bottom-40 left-6 z-20 flex items-center gap-2 rounded-full bg-white px-6 py-4 font-black text-blue-600 shadow-2xl active:scale-95 ring-1 ring-black/5">
        <Navigation2 size={20} fill="currentColor" />
        Recenter
      </button>

      {/* Bottom Status Card (Pixel-Perfect) */}
      <div className="absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20">
        <div className="flex items-center justify-between rounded-[3rem] bg-white/95 px-10 py-8 shadow-2xl backdrop-blur-md ring-1 ring-black/5">
          <div className="text-center">
            <p className="text-[32px] font-black text-black tracking-tighter">3:29</p>
            <p className="text-[14px] font-bold uppercase tracking-widest text-zinc-500">arrival</p>
          </div>
          <div className="text-center">
            <p className="text-[32px] font-black text-black tracking-tighter">3</p>
            <p className="text-[14px] font-bold uppercase tracking-widest text-zinc-500">min</p>
          </div>
          <div className="text-center">
            <p className="text-[32px] font-black text-black tracking-tighter">0.2</p>
            <p className="text-[14px] font-bold uppercase tracking-widest text-zinc-500">mi</p>
          </div>
        </div>
      </div>
      
      {/* User Puck (Blue) */}
      <div className="absolute left-1/2 top-[75%] z-20 -translate-x-1/2 -translate-y-1/2">
        <div className="flex size-14 items-center justify-center rounded-full bg-white shadow-2xl ring-1 ring-black/5">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-600 text-white">
            <Navigation2 size={24} fill="currentColor" />
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-white/90 px-3 py-1 text-center shadow-lg backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Eastside Trail</p>
        </div>
      </div>
    </Screen>
  );
}
