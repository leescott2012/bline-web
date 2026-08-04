import { useEffect, useRef, useState } from "react";
import { Flame, Layers, Navigation2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMapEnhanced from "@/components/RealMapEnhanced";
import SpotCard from "@/components/SpotCard";
import CrowdPanel from "@/components/CrowdPanel";
import InterestSelector from "@/components/InterestSelector";
import { useSpots } from "@/lib/spots";
import { useCrowd } from "@/lib/crowd";
import { useMapInterests, getActiveInterests } from "@/lib/mapInterests";

// Map tab. Controls sit in one right-side column in the thumb zone; a spot
// carousel runs along the bottom and drives the map -- scrolling to a card pans
// there and turns its pin white, mirroring the wireframe.
const BUILDINGS_MIN_ZOOM = 15.6;
const PITCH_3D = 60;
const CARD_ZOOM = 14.4;

const HEAT_SOURCE = "crowd-density";
const HEAT_LAYER = "crowd-heat";

// One shared shape for every map control so the column reads as a set.
const CTRL = "grid size-12 place-items-center rounded-full backdrop-blur transition-colors";
const CTRL_OFF = "bg-[#101014]/90 text-white";

export default function MapView() {
  const [, nav] = useLocation();
  const spots = useSpots();
  const interests = useMapInterests();
  const activeInterests = getActiveInterests(interests);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const activeMarker = useRef<maplibregl.Marker | null>(null);
  const activeRef = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [threeD, setThreeD] = useState(false);
  const [heat, setHeat] = useState(false);

  // Pan to a card's spot and mark it with the white "selected" pin -- the same
  // treatment Explore uses, so a spot looks identical wherever you meet it.
  const flyTo = (i: number) => {
    const map = mapRef.current;
    const s = spots[i];
    if (!map || !s) return;
    map.easeTo({ center: [s.lng, s.lat], zoom: Math.max(map.getZoom(), CARD_ZOOM), duration: 650 });
    if (!activeMarker.current) {
      const d = document.createElement("div");
      d.innerHTML = `<div class="bline-pin bline-pin-active"><span class="star">★</span> <b></b></div>`;
      activeMarker.current = new maplibregl.Marker({ element: d, anchor: "bottom" });
    }
    activeMarker.current.getElement().querySelector("b")!.textContent = s.rating.toFixed(1);
    activeMarker.current.setLngLat([s.lng, s.lat]).addTo(map);
  };

  const onCardScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!spots.length) return;
    const el = e.currentTarget;
    const i = Math.max(0, Math.min(spots.length - 1, Math.round(el.scrollLeft / (el.clientWidth * 0.86))));
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActiveIdx(i);
      flyTo(i);
    }
  };

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

  // Live crowd density: aggregated grid counts from everyone sharing right now,
  // layered over the seeded baseline so the map is never blank. Polls while the
  // heatmap is open -- see src/lib/crowd.ts.
  const crowd = useCrowd(heat);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!heat) {
      if (map.getLayer(HEAT_LAYER)) map.removeLayer(HEAT_LAYER);
      if (map.getSource(HEAT_SOURCE)) map.removeSource(HEAT_SOURCE);
      return;
    }
    const data: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: crowd.points.map((pt) => ({
        type: "Feature",
        properties: { weight: pt.weight },
        geometry: { type: "Point", coordinates: [pt.lng, pt.lat] },
      })),
    };
    const existing = map.getSource(HEAT_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (existing) { existing.setData(data); return; }

    map.addSource(HEAT_SOURCE, { type: "geojson", data });
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
  }, [heat, crowd]);

  const activeSpot = spots[activeIdx];

  return (
    <Screen className="overflow-hidden">
      <RealMapEnhanced zoom={12.1} autoPitch={false} onMap={(m) => (mapRef.current = m)} className="absolute inset-0" />

      {/* Interest Selector Sidebar */}
      <InterestSelector />

      <header className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 left-auto right-3">
        <div className="flex items-center justify-around rounded-full bg-[#101014]/90 px-5 py-3.5 backdrop-blur">
          <p><span className="text-zinc-400">Where — </span><span className="font-bold">Eastside Trail</span></p>
          <p><span className="text-zinc-400">When — </span><span className="font-bold">Open now</span></p>
        </div>
      </header>

      {/* Controls stack above the carousel so neither covers the other. */}
      <div className="absolute right-3 z-10 flex flex-col-reverse gap-2.5"
        style={{ bottom: "calc(var(--bline-nav-space) + 14.5rem)" }}>
        {/* Apple-Maps-style navigation arrow: starts turn-by-turn to whichever
            card is centred, rather than just recentring the camera. */}
        <button aria-label={activeSpot ? `Start navigation to ${activeSpot.name}` : "Start navigation"}
          onClick={() => activeSpot && nav(`/navigate/${activeSpot.id}`)}
          className={`${CTRL} bg-[#2f6bff] text-white`}>
          <Navigation2 size={20} fill="currentColor" />
        </button>

        <button aria-label={threeD ? "Switch to 2D map" : "Switch to 3D map"}
          aria-pressed={threeD} onClick={toggle3D}
          className={`${CTRL} ${threeD ? "bg-[#c9187e] text-white" : CTRL_OFF}`}>
          <span className="text-[15px] font-bold tracking-tight">{threeD ? "2D" : "3D"}</span>
        </button>

        <button aria-label={heat ? "Hide crowd heatmap" : "Show crowd heatmap"}
          aria-pressed={heat} onClick={() => setHeat((h) => !h)}
          className={`${CTRL} ${heat ? "bg-[#c9187e] text-white" : CTRL_OFF}`}>
          <Flame size={20} />
        </button>

        <Link href="/map-styles" aria-label="Map styles" className={`${CTRL} ${CTRL_OFF}`}>
          <Layers size={20} />
        </Link>
      </div>

      {/* Heat on swaps the spot carousel for the conditions that explain it --
          the numbers now live with the overlay instead of a separate screen. */}
      <div className="absolute inset-x-0 z-10" style={{ bottom: "var(--bline-nav-space)" }}>
        {heat && <CrowdPanel people={crowd.people} />}
        <div className={`no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 ${heat ? "hidden" : ""}`}
          onScroll={onCardScroll}>
          {spots.map((s, i) => (
            <div key={s.id} className="w-[86%] shrink-0 snap-center">
              <SpotCard spot={s} photoClass="aspect-[488/200]" autoPhotos={i === activeIdx} />
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
