import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Compass, Eye, Loader2, Maximize2, Minimize2, MoreHorizontal, Navigation2, X } from "lucide-react";
import { useLocation, useParams } from "wouter";
import Screen from "@/components/Screen";
import RealMapEnhanced from "@/components/RealMapEnhanced";
import { useSpots } from "@/lib/spots";
import { fetchRoute, cumulative, posAt, type RouteResult, type RouteStep } from "@/lib/routing";
import { sceneForPreview, type StreetPreviewMode, type StreetScene } from "@/lib/streetPreview";

// Pedestrian framing. Walking mode sits far closer and steeper than driving mode.
const WALK_ZOOM = 18.6;
const WALK_PITCH = 74;

function DemoCorridorImage({ expanded, freeLook }: { expanded: boolean; freeLook: boolean }) {
  return (
    <div
      className={`relative overflow-hidden bg-[linear-gradient(180deg,#91c6d4_0%,#d7e6d3_48%,#9b633f_49%,#75432e_100%)] ${expanded ? "h-64" : "h-40"}`}
      aria-label="Illustrative BeltLine corridor demo imagery"
    >
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,.2),transparent)]" />
      <div className="absolute left-4 top-10 size-16 rounded-full bg-[#2f704d]/80 blur-[1px]" />
      <div className="absolute left-12 top-6 size-20 rounded-full bg-[#3e8056]/85" />
      <div className="absolute right-6 top-8 size-20 rounded-full bg-[#32694c]/85" />
      <div className="absolute right-20 top-14 size-14 rounded-full bg-[#4b8d5a]/80" />
      <div className="absolute inset-x-[18%] bottom-[-35%] h-[105%] rotate-[5deg] rounded-[48%] bg-[#b77a4c] shadow-[inset_0_0_0_2px_rgba(255,255,255,.16)]" />
      <div className="absolute inset-x-[31%] bottom-[-28%] h-[94%] rotate-[5deg] rounded-[48%] bg-[#d0945a]" />
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
        <div className="flex gap-1">
          {[0, 1, 2].map((item) => <span key={item} className="size-3 rotate-45 bg-[#c026d3] shadow-[0_0_10px_rgba(192,38,211,.7)]" />)}
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80">{freeLook ? "Free look" : "Follow route"}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}

export default function Navigate3D() {
  const { id } = useParams<{ id: string }>();
  const [, setLoc] = useLocation();
  const spots = useSpots();
  const destSpot =
    spots.find((s) => s.id === id) ||
    spots.find((s) => s.id === "ponce-city") ||
    spots.find((s) => s.name.toLowerCase().includes("ponce city")) ||
    spots[0];
  const [route, setRoute] = useState<RouteResult | null | undefined>(undefined);
  const [step, setStep] = useState<RouteStep | null>(null);
  const [progress, setProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState<StreetPreviewMode>("closed");
  const mapRef = useRef<any>(null);

  const previewSpotId = destSpot?.name.toLowerCase().includes("ponce city") ? "ponce-city" : destSpot?.id;
  const previewScene = sceneForPreview(previewSpotId, progress / 100);
  const previewOpen = previewMode !== "closed";
  // Keep the last scene rendered while the panel animates out, so passing the
  // end of the pilot corridor fades the panel instead of snapping it away.
  const [lastScene, setLastScene] = useState<StreetScene | null>(null);
  const displayScene = previewScene ?? lastScene;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const origin: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        const r = await fetchRoute(origin, [destSpot.lng, destSpot.lat]);
        if (r) {
          setRoute(r);
          setStep(r.steps[0]);
        } else setRoute(null);
      },
      async () => {
        const origin: [number, number] = [-84.3657, 33.7729];
        const r = await fetchRoute(origin, [destSpot.lng, destSpot.lat]);
        if (r) {
          setRoute(r);
          setStep(r.steps[0]);
        } else setRoute(null);
      },
    );
  }, [destSpot]);

  useEffect(() => {
    const timer = setInterval(() => setProgress((p) => (p < 100 ? p + 0.2 : 0)), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previewScene) setLastScene(previewScene);
  }, [previewScene]);

  useEffect(() => {
    if (!previewScene && previewMode !== "closed") setPreviewMode("closed");
  }, [previewScene, previewMode]);

  const recenter = () => {
    const map = mapRef.current;
    if (!map || !route || cum.current.length < 2) return;
    const { pos, brg } = posAt(progress / 100, route.coordinates, cum.current);
    map.easeTo({ center: pos, bearing: brg, zoom: WALK_ZOOM, pitch: WALK_PITCH, duration: 400 });
  };

  const cum = useRef<number[]>([]);
  useEffect(() => {
    if (route) cum.current = cumulative(route.coordinates);
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route || cum.current.length < 2) return;
    const { pos, brg } = posAt(progress / 100, route.coordinates, cum.current);
    map.easeTo({ center: pos, bearing: brg, zoom: WALK_ZOOM, pitch: WALK_PITCH, duration: 100, easing: (x: number) => x });
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

  const expanded = previewMode === "immersive" || previewMode === "free-look";
  const freeLook = previewMode === "free-look";

  return (
    <Screen className="overflow-hidden bg-black">
      <RealMapEnhanced
        photoreal
        zoom={WALK_ZOOM}
        center={route?.coordinates?.[0] ?? [destSpot.lng, destSpot.lat]}
        autoPitch={false}
        onMap={(map) => {
          mapRef.current = map;
          map.setPitch(WALK_PITCH);
          if (route && !map.getSource("route")) {
            map.addSource("route", {
              type: "geojson",
              data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route.coordinates } },
            });
            map.addLayer({ id: "route-glow", type: "line", source: "route", paint: { "line-color": "#d946ef", "line-width": 12, "line-opacity": 0.3, "line-blur": 6 } });
            map.addLayer({ id: "route-main", type: "line", source: "route", paint: { "line-color": "#d946ef", "line-width": 4, "line-opacity": 0.9 } });
          }
        }}
        className="absolute inset-0"
      />

      <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20">
        <div className="overflow-hidden rounded-3xl bg-black/90 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white text-black shadow-lg">
              <Navigation2 size={32} fill="currentColor" className="rotate-45" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[22px] font-bold leading-tight tracking-tight text-white">{step?.dist ?? "--"}</p>
              <p className="truncate text-[17px] font-medium text-zinc-400">{step?.text ?? "Head toward destination"}</p>
            </div>
            <span className="shrink-0 self-start rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">3D preview</span>
          </div>
          <div className="flex items-center gap-3 border-t border-white/5 bg-white/5 px-5 py-3">
            <ArrowLeft size={18} className="rotate-180 text-zinc-500" />
            <p className="text-[14px] font-semibold text-zinc-300">then continue toward {destSpot.name}</p>
          </div>
          <div className="h-1 w-full bg-white/10"><div className="h-full bg-hot transition-all duration-300 ease-linear" style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      {previewScene && !previewOpen && (
        <button
          type="button"
          onClick={() => setPreviewMode("peek")}
          className="pointer-events-auto absolute bottom-[12.5rem] left-3 z-20 flex items-center gap-2 rounded-full bg-black/90 px-4 py-3 text-left text-white shadow-xl ring-1 ring-white/15 backdrop-blur-xl active:scale-95"
          aria-label="Open Street preview"
        >
          <Eye size={18} className="text-accent" />
          <span><strong className="block text-sm">Street preview</strong><span className="text-xs text-zinc-400">{previewScene.distanceLabel}</span></span>
        </button>
      )}

      {displayScene && (
        <section className={`absolute inset-x-3 bottom-[12.25rem] z-30 overflow-hidden rounded-[28px] bg-black/95 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl transition-[opacity,transform] duration-300 ease-out ${previewOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"} ${expanded ? "" : "max-h-[15rem]"}`} aria-hidden={!previewOpen} aria-label="Street preview panel">
          <div className="flex items-center justify-between px-4 py-3">
            <button type="button" onClick={() => setPreviewMode(expanded ? "peek" : "immersive")} className="flex min-w-0 items-center gap-3 text-left" aria-label={expanded ? "Collapse Street preview" : "Expand Street preview"}>
              {expanded ? <Minimize2 size={18} className="text-accent" /> : <Maximize2 size={18} className="text-accent" />}
              <span className="min-w-0"><strong className="block text-sm text-white">{displayScene.title}</strong><span className="block truncate text-xs text-zinc-400">{displayScene.distanceLabel} · {displayScene.captureLabel}</span></span>
            </button>
            <button type="button" onClick={() => setPreviewMode("closed")} className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Close Street preview"><X size={18} /></button>
          </div>
          <DemoCorridorImage expanded={expanded} freeLook={freeLook} />
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0"><p className="truncate text-[11px] font-semibold text-zinc-300">{displayScene.providerLabel}</p><p className="truncate text-[10px] text-zinc-500">{displayScene.note}</p></div>
            {freeLook ? (
              <button type="button" onClick={() => setPreviewMode("immersive")} className="shrink-0 rounded-full bg-accent px-3 py-2 text-xs font-bold text-on-brand">Follow route</button>
            ) : (
              <button type="button" onClick={() => setPreviewMode("free-look")} className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-white">Free look</button>
            )}
          </div>
        </section>
      )}

      <button type="button" className="pointer-events-auto absolute bottom-32 left-4 z-20 flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-black shadow-xl active:scale-95"><Compass size={18} /> Recenter</button>

      <div className="absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20">
        <div className="flex items-center justify-between rounded-[32px] bg-white/95 px-8 py-6 shadow-2xl backdrop-blur-md">
          <div className="text-center"><p className="text-[24px] font-black text-black">{route ? new Date(Date.now() + route.durationMin * 60_000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--"}</p><p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500">arrival</p></div>
          <div className="text-center"><p className="text-[24px] font-black text-black">{route ? Math.ceil(route.durationMin) : "--"}</p><p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500">min</p></div>
          <div className="text-center"><p className="text-[24px] font-black text-black">{route ? route.distanceMi.toFixed(1) : "--"}</p><p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500">mi</p></div>
          <button type="button" onClick={() => setLoc("/map")} className="ml-4 flex size-12 items-center justify-center rounded-full bg-red-500 text-white shadow-lg active:scale-90" aria-label="Exit navigation"><MoreHorizontal size={24} /></button>
        </div>
      </div>
    </Screen>
  );
}
