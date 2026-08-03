import { useEffect, useRef, useState } from "react";
import { Flame, Layers, LocateFixed } from "lucide-react";
import { Link } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMap from "@/components/RealMap";
import { useLiveLocation } from "@/lib/useLiveLocation";
import { crowdDensityPoints } from "@/lib/data";

// Map tab: just the map, like a navigation tab. Layers opens the style picker;
// the 3D control tilts into the extruded-building view.
//
// The 3D buildings layer has minzoom 15, so tilting from a city-wide zoom would
// show a slanted flat map and nothing else -- the toggle zooms in far enough for
// buildings to actually exist before pitching.
const BUILDINGS_MIN_ZOOM = 15.6;
const PITCH_3D = 60;

// Same crowd-density heatmap the Trail Conditions screen renders, surfaced here
// as an overlay so you don't have to leave the map to see how busy the trail is.
const HEAT_SOURCE = "crowd-density";
const HEAT_LAYER = "crowd-heat";

// One shared shape for every map control so the column reads as a set.
const CTRL = "grid size-12 place-items-center rounded-full backdrop-blur transition-colors";
const CTRL_OFF = "bg-[#101014]/90 text-white";

export default function MapView() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const meRef = useRef<maplibregl.Marker | null>(null);
  const [tracking, setTracking] = useState(false);
  const [threeD, setThreeD] = useState(false);
  const [heat, setHeat] = useState(false);
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

  const toggleHeat = () => {
    const map = mapRef.current;
    if (!map) return;
    const next = !heat;
    setHeat(next);
    if (!next) {
      if (map.getLayer(HEAT_LAYER)) map.removeLayer(HEAT_LAYER);
      if (map.getSource(HEAT_SOURCE)) map.removeSource(HEAT_SOURCE);
      return;
    }
    if (map.getSource(HEAT_SOURCE)) return;
    map.addSource(HEAT_SOURCE, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: crowdDensityPoints.map((pt) => ({
          type: "Feature" as const,
          properties: { weight: pt.weight },
          geometry: { type: "Point" as const, coordinates: [pt.lng, pt.lat] },
        })),
      },
    });
    map.addLayer({
      id: HEAT_LAYER,
      type: "heatmap",
      source: HEAT_SOURCE,
      paint: {
        "heatmap-weight": ["get", "weight"],
        "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 1, 16, 3],
        "heatmap-color": [
          "interpolate", ["linear"], ["heatmap-density"],
          0, "rgba(0,0,0,0)",
          0.2, "#4ade4a",
          0.4, "#facc15",
          0.6, "#fb923c",
          0.8, "#ef4444",
          1, "#b91c1c",
        ],
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 16, 16, 38],
        "heatmap-opacity": 0.72,
      },
    });
  };

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
      <header className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10">
        <div className="flex items-center justify-around rounded-full bg-[#101014]/90 px-5 py-3.5 backdrop-blur">
          <p><span className="text-zinc-400">Where — </span><span className="font-bold">Eastside Trail</span></p>
          <p><span className="text-zinc-400">When — </span><span className="font-bold">Open now</span></p>
        </div>
      </header>

      {/* Every map control in one right-side column, in the thumb zone.
          Layers used to live in the top header, which split the controls across
          two corners; grouping them reads as one set and keeps them reachable
          one-handed. Active states use brand pink so on/off is obvious. */}
      <div className="absolute bottom-24 right-3 z-10 flex flex-col-reverse gap-2.5">
        <button aria-label={tracking ? "Stop following my location" : "Locate me"}
          aria-pressed={tracking} onClick={toggleTracking}
          className={`${CTRL} ${tracking ? "bg-[#2f6bff] text-white" : CTRL_OFF}`}>
          <LocateFixed size={20} />
        </button>

        <button aria-label={threeD ? "Switch to 2D map" : "Switch to 3D map"}
          aria-pressed={threeD} onClick={toggle3D}
          className={`${CTRL} ${threeD ? "bg-[#c9187e] text-white" : CTRL_OFF}`}>
          <span className="text-[15px] font-bold tracking-tight">{threeD ? "2D" : "3D"}</span>
        </button>

        <button aria-label={heat ? "Hide crowd heatmap" : "Show crowd heatmap"}
          aria-pressed={heat} onClick={toggleHeat}
          className={`${CTRL} ${heat ? "bg-[#c9187e] text-white" : CTRL_OFF}`}>
          <Flame size={20} />
        </button>

        <Link href="/map-styles" aria-label="Map styles" className={`${CTRL} ${CTRL_OFF}`}>
          <Layers size={20} />
        </Link>
      </div>

    </Screen>
  );
}
