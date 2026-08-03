import { useEffect, useRef, useState } from "react";
import { Layers, LocateFixed } from "lucide-react";
import { Link } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMap from "@/components/RealMap";
import { useLiveLocation } from "@/lib/useLiveLocation";

// Map tab: just the map, like a navigation tab. Layers opens the style picker;
// the 3D control tilts into the extruded-building view.
//
// The 3D buildings layer has minzoom 15, so tilting from a city-wide zoom would
// show a slanted flat map and nothing else -- the toggle zooms in far enough for
// buildings to actually exist before pitching.
const BUILDINGS_MIN_ZOOM = 15.6;
const PITCH_3D = 60;

export default function MapView() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const meRef = useRef<maplibregl.Marker | null>(null);
  const [tracking, setTracking] = useState(false);
  const [threeD, setThreeD] = useState(false);
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

  const toggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    const next = !threeD;
    setThreeD(next);
    map.easeTo({
      pitch: next ? PITCH_3D : 0,
      zoom: next ? Math.max(map.getZoom(), BUILDINGS_MIN_ZOOM) : map.getZoom(),
      duration: 700,
    });
  };

  // Keep the label honest if a gesture flattens the map out from under us.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const sync = () => setThreeD(map.getPitch() > 10);
    map.on("pitchend", sync);
    return () => { map.off("pitchend", sync); };
  }, []);

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
      <RealMap zoom={12.1} autoPitch={false} onMap={(m) => (mapRef.current = m)} className="absolute inset-0" />
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

      {/* 3D / 2D toggle, Apple-Maps style: a labelled circle rather than a
          hidden gesture, so the extruded-building view is discoverable.
          Sits clear of FeedbackButton's edge tab (right-0 top-32 z-30), which
          otherwise sat on top of this and hid the "D". */}
      <button
        aria-label={threeD ? "Switch to 2D map" : "Switch to 3D map"}
        aria-pressed={threeD}
        onClick={toggle3D}
        className={`absolute right-3 top-[calc(max(0.75rem,env(safe-area-inset-top))+7.75rem)] z-10 grid size-12 place-items-center rounded-full backdrop-blur ${
          threeD ? "bg-[#c9187e] text-white" : "bg-[#101014]/90 text-white"
        }`}
      >
        <span className="text-[15px] font-bold tracking-tight">{threeD ? "2D" : "3D"}</span>
      </button>
      <button aria-label={tracking ? "Stop sharing location" : "Locate me"} onClick={toggleTracking}
        className={`absolute bottom-24 right-3 z-10 grid size-12 place-items-center rounded-full backdrop-blur ${tracking ? "bg-[#2f6bff]" : "bg-[#101014]/90"}`}>
        <LocateFixed size={20} className="text-white" />
      </button>
    </Screen>
  );
}
