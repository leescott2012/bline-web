import { useEffect, useRef, useState } from "react";
import { Layers, LocateFixed } from "lucide-react";
import { Link } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMap from "@/components/RealMap";
import { useLiveLocation } from "@/lib/useLiveLocation";

// Map tab: just the map, like a navigation tab. Pinch/scroll in for street level —
// it auto-tilts to 3D with building extrusions. Layers icon opens the style picker.
export default function MapView() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const meRef = useRef<maplibregl.Marker | null>(null);
  const [tracking, setTracking] = useState(false);
  const firstFix = useRef(true);
  const live = useLiveLocation(tracking);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !live.position) return;
    const pos: [number, number] = [live.position.lng, live.position.lat];
    if (!meRef.current) {
      const d = document.createElement("div");
      d.className = "bline-me-dot";
      meRef.current = new maplibregl.Marker({ element: d });
    }
    meRef.current.setLngLat(pos).addTo(map);
    if (firstFix.current) {
      firstFix.current = false;
      map.easeTo({ center: pos, zoom: 15.5, duration: 800 });
    }
  }, [live.position]);

  const toggleTracking = () => {
    if (!navigator.geolocation) return;
    if (tracking) {
      setTracking(false);
      meRef.current?.remove();
      meRef.current = null;
      firstFix.current = true;
    } else {
      setTracking(true);
    }
  };

  return (
    <Screen className="overflow-hidden">
      <RealMap zoom={12.1} onMap={(m) => (mapRef.current = m)} className="absolute inset-0" />
      <header className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex items-center gap-2">
        <div className="flex flex-1 items-center justify-around rounded-full bg-[#101014]/90 px-5 py-3.5 backdrop-blur">
          <p><span className="text-zinc-400">Where — </span><span className="font-bold">Eastside Trail</span></p>
          <p><span className="text-zinc-400">When — </span><span className="font-bold">Open now</span></p>
        </div>
        <Link href="/map-styles" aria-label="Map styles"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-[#101014]/90 backdrop-blur">
          <Layers size={20} className="text-white" />
        </Link>
      </header>
      <button aria-label={tracking ? "Stop sharing location" : "Locate me"} onClick={toggleTracking}
        className={`absolute bottom-24 right-3 z-10 grid size-12 place-items-center rounded-full backdrop-blur ${tracking ? "bg-[#2f6bff]" : "bg-[#101014]/90"}`}>
        <LocateFixed size={20} className="text-white" />
      </button>
    </Screen>
  );
}
