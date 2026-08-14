import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Navigation2, MoreHorizontal, Loader2 } from "lucide-react";
import Screen from "@/components/Screen";
import RealMapEnhanced from "@/components/RealMapEnhanced";
import { useSpots } from "@/lib/spots";
import { fetchRoute, cumulative, posAt, type RouteResult, type RouteStep } from "@/lib/routing";

// Pedestrian framing. Google/Apple walking mode sits far closer and steeper
// than driving mode -- you want the next 100m of footpath, not the block.
const WALK_ZOOM = 18.6;
const WALK_PITCH = 74;

export default function Navigate3D() {
  const { id } = useParams<{ id: string }>();
  const [, setLoc] = useLocation();
  const spots = useSpots();
  const destSpot = spots.find((s) => s.id === id) || spots[0];
  const [route, setRoute] = useState<RouteResult | null | undefined>(undefined);
  const [step, setStep] = useState<RouteStep | null>(null);
  const [progress, setProgress] = useState(0);
  const mapRef = useRef<any>(null);

  // Fetch real route from user's current position
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const origin: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const r = await fetchRoute(origin, [destSpot.lng, destSpot.lat]);
        if (r) {
          setRoute(r);
          setStep(r.steps[0]);
        } else {
          setRoute(null);
        }
      },
      async () => {
        // Fallback: PCM as origin if geolocation fails
        const origin: [number, number] = [-84.3657, 33.7729];
        const r = await fetchRoute(origin, [destSpot.lng, destSpot.lat]);
        if (r) {
          setRoute(r);
          setStep(r.steps[0]);
        } else {
          setRoute(null);
        }
      }
    );
  }, [destSpot]);

  // Simulate progress for the preview
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p < 100 ? p + 0.2 : 0));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Walk the camera along the route. This is a footpath, not a road: the
  // camera sits at WALK_ZOOM (~eye height over the trail, close enough to read
  // doorways and murals) and pitches near the horizon so you're looking *down
  // the path* rather than at a rooftop plan. It was framed at zoom 16.8 /
  // pitch 65 over the destination, which reads as driving.
  const cum = useRef<number[]>([]);
  useEffect(() => {
    if (route) cum.current = cumulative(route.coordinates);
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route || cum.current.length < 2) return;
    const { pos, brg } = posAt(progress / 100, route.coordinates, cum.current);
    map.easeTo({
      center: pos,
      bearing: brg,
      zoom: WALK_ZOOM,
      pitch: WALK_PITCH,
      duration: 100,
      easing: (x: number) => x,
    });

    // Keep the banner instruction in step with where the camera actually is.
    const p = progress / 100;
    let current = route.steps[0];
    for (const st of route.steps) if (st.at <= p) current = st;
    setStep(current);
  }, [progress, route]);

  if (route === undefined) {
    return (
      <Screen className="flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="mx-auto size-12 animate-spin text-accent" />
          <p className="mt-4 font-bold text-white">Calculating 3D Route...</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen className="overflow-hidden bg-black">
      <RealMapEnhanced
        photoreal
        zoom={WALK_ZOOM}
        center={route?.coordinates?.[0] ?? [destSpot.lng, destSpot.lat]}
        autoPitch={false}
        onMap={(map) => {
          // RealMapEnhanced calls onMap only after this style has loaded. Adding
          // another `load` listener here misses the already-dispatching event,
          // leaving the 3D route absent. Initialize against the ready map now.
          mapRef.current = map;
          map.setPitch(WALK_PITCH);
          if (route && !map.getSource('route')) {
            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: route.coordinates,
                },
              },
            });

            map.addLayer({
              id: 'route-glow',
              type: 'line',
              source: 'route',
              paint: {
                'line-color': '#d946ef',
                'line-width': 12,
                'line-opacity': 0.3,
                'line-blur': 6,
              },
            });

            map.addLayer({
              id: 'route-main',
              type: 'line',
              source: 'route',
              paint: {
                'line-color': '#d946ef',
                'line-width': 4,
                'line-opacity': 0.9,
              },
            });
          }
        }}
        className="absolute inset-0"
      />

      {/* Top Instruction Banner */}
      <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20">
        <div className="overflow-hidden rounded-3xl bg-black/90 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
              <Navigation2 size={32} fill="currentColor" className="rotate-45" />
            </div>
            <div className="min-w-0 flex-1">
              {/* The route, distance and ETA are real (OpenRouteService). What's
                  approximate is the 3D scene -- aerial imagery with extruded
                  footprints, not photogrammetry. So label the rendering a
                  preview, and don't call a real route "illustrative". */}
              <p className="text-[22px] font-bold leading-tight tracking-tight text-white">
                {step?.dist ?? "--"}
              </p>
              <p className="truncate text-[17px] font-medium text-zinc-400">
                {step?.text ?? "Head toward destination"}
              </p>
            </div>
            <span className="shrink-0 self-start rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              3D preview
            </span>
          </div>
          {/* Sub-instruction */}
          <div className="flex items-center gap-3 border-t border-white/5 bg-white/5 px-5 py-3">
            <ArrowLeft size={18} className="rotate-180 text-zinc-500" />
            <p className="text-[14px] font-semibold text-zinc-300">
              then continue toward {destSpot.name}
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

      {/* Bottom Status Card */}
      <div className="absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20">
        <div className="flex items-center justify-between rounded-[32px] bg-white/95 px-8 py-6 shadow-2xl backdrop-blur-md">
          <div className="text-center">
            <p className="text-[24px] font-black text-black">
              {route
                ? new Date(Date.now() + route.durationMin * 60_000).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "--"}
            </p>
            <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500">arrival</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-black text-black">{route ? Math.ceil(route.durationMin) : "--"}</p>
            <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500">min</p>
          </div>
          <div className="text-center">
            <p className="text-[24px] font-black text-black">{route ? route.distanceMi.toFixed(1) : "--"}</p>
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
