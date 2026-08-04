import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Navigation2, Clock, MapPin, ChevronRight, MoreHorizontal } from "lucide-react";
import Screen from "@/components/Screen";
import RealMapEnhanced from "@/components/RealMapEnhanced";
import { spots, beltlineLoop } from "@/lib/data";

// Navigate3D: A high-fidelity prototype of the 3D turn-by-turn navigation
// as shown in the wireframes (Page 10). Features an aggressive 3D pitch,
// cinematic sky, and the signature "Purple Glow" route.

export default function Navigate3D({ params }: { params: { id: string } }) {
  const [, setLoc] = useLocation();
  const spot = spots.find((s) => s.id === params.id) || spots[0];
  const [progress, setProgress] = useState(0);
  const mapRef = useRef<any>(null);

  // Simulate progress along the route
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p < 100 ? p + 0.5 : 0));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <Screen className="overflow-hidden bg-black">
      {/* 3D Map Background */}
      <RealMapEnhanced
        zoom={17.5}
        center={[spot.lng, spot.lat]}
        autoPitch={false}
        onMap={(map) => {
          mapRef.current = map;
          map.setPitch(65);
          map.setBearing(-15);
          
          // Add the "Purple Glow" route
          map.on('load', () => {
            if (!map.getSource('route')) {
              map.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: beltlineLoop.slice(0, 20) // Simulated route segment
                  }
                }
              });

              map.addLayer({
                id: 'route-glow',
                type: 'line',
                source: 'route',
                paint: {
                  'line-color': '#d946ef',
                  'line-width': 12,
                  'line-opacity': 0.3,
                  'line-blur': 6
                }
              });

              map.addLayer({
                id: 'route-main',
                type: 'line',
                source: 'route',
                paint: {
                  'line-color': '#d946ef',
                  'line-width': 4,
                  'line-opacity': 0.9
                }
              });
            }
          });
        }}
        className="absolute inset-0"
      />

      {/* Top Instruction Banner (Wireframe Style) */}
      <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20">
        <div className="overflow-hidden rounded-3xl bg-black/90 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          {/* The distances and ETA below are illustrative -- this screen shows
              what 3D navigation will look like, it isn't following a real fix.
              Say so on screen rather than letting the numbers imply otherwise. */}
          <div className="flex items-center justify-center gap-1.5 bg-amber-400/15 py-1.5">
            <span className="size-1.5 rounded-full bg-amber-400" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Preview · illustrative route
            </p>
          </div>
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
              <Navigation2 size={32} fill="currentColor" className="rotate-45" />
            </div>
            <div className="flex-1">
              <p className="text-[22px] font-bold leading-tight tracking-tight text-white">
                350 ft
              </p>
              <p className="text-[17px] font-medium text-zinc-400">
                Continue on Eastside Trail
              </p>
            </div>
          </div>
          {/* Sub-instruction */}
          <div className="flex items-center gap-3 border-t border-white/5 bg-white/5 px-5 py-3">
            <ArrowLeft size={18} className="rotate-180 text-zinc-500" />
            <p className="text-[14px] font-semibold text-zinc-300">
              then bear right toward {spot.name}
            </p>
          </div>
          {/* Visual Hint (High-End Feature) */}
          <div className="flex items-center gap-2 bg-accent/10 px-5 py-2">
            <div className="size-2 rounded-full bg-accent animate-pulse" />
            <p className="text-[12px] font-bold uppercase tracking-wider text-accent">
              Look for the "Eyes" Mural on the bridge ahead
            </p>
          </div>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-white/10">
            <div 
              className="h-full bg-hot transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recenter Button */}
      <button className="absolute bottom-32 left-4 z-20 flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-black shadow-xl active:scale-95">
        <Navigation2 size={18} fill="currentColor" />
        Recenter
      </button>

      {/* Bottom Status Card (Wireframe Style) */}
      <div className="absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20">
        <div className="flex items-center justify-between rounded-[32px] bg-white/95 px-8 py-6 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <p className="text-[24px] font-black text-black">3:29</p>
            <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500">arrival</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-black text-black">3</p>
            <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500">min</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-black text-black">0.2</p>
            <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500">mi</p>
          </div>
          <button 
            onClick={() => setLoc("/map")}
            className="ml-4 flex size-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg active:scale-90"
          >
            <MoreHorizontal size={24} />
          </button>
        </div>
      </div>
    </Screen>
  );
}
