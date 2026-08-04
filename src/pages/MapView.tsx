import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Layers, LocateFixed } from "lucide-react";
import { Link, useLocation } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMapEnhanced from "@/components/RealMapEnhanced";
import CrowdPanel from "@/components/CrowdPanel";
import InterestSelector from "@/components/InterestSelector";
import { useSpots } from "@/lib/spots";
import { useCrowd } from "@/lib/crowd";
import { useMapInterests, getActiveInterests, interestOf, INTERESTS } from "@/lib/mapInterests";

// Map tab. The map is the content: no spot deck, no panel pinned over it --
// two separate reports said it was cluttered and that the cards clashed with
// the controls. Browsing spots belongs to Explore. Controls sit in one
// right-side column in the thumb zone.
const BUILDINGS_MIN_ZOOM = 15.6;
const PIN_MIN_ZOOM = 13.2;
const PITCH_3D = 60;

const HEAT_SOURCE = "crowd-density";
const HEAT_LAYER = "crowd-heat";

// One shared shape for every map control so the column reads as a set.
const CTRL = "grid size-12 place-items-center rounded-full backdrop-blur transition-colors";
const CTRL_OFF = "bg-[#101014]/90 text-white";

// One entry per control. Collapsed, every button just opens the stack; the
// real action only fires once it's open, so a half-seen circle can't toggle 3D.
type Ctrl = {
  key: string;
  label: string;
  onPress: () => void;
  render: (press: () => void, open: boolean) => React.ReactNode;
};

export default function MapView() {
  const [, nav] = useLocation();
  const spots = useSpots();
  const interests = useMapInterests();
  const activeInterests = getActiveInterests(interests);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [threeD, setThreeD] = useState(false);
  const [heat, setHeat] = useState(false);
  const [open, setOpen] = useState(false);
  // Assigning a ref doesn't re-render, so map-dependent effects would run once
  // with `null` and never again. This flips when the map exists.
  const [mapReady, setMapReady] = useState(false);
  // 120 pins over the whole city is a pile, not a map. They appear once you're
  // close enough for them to be distinguishable.
  const [zoom, setZoom] = useState(12.1);
  const reduce = useReducedMotion();

  // Expanded is a transient state: five seconds after the last press the deck
  // folds itself back up, so the map isn't left with four circles over it
  // because someone tapped once and walked away.
  const idle = useRef<number | undefined>(undefined);
  const armIdle = () => {
    clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setOpen(false), 5000);
  };
  useEffect(() => {
    if (!open) return;
    armIdle();
    return () => clearTimeout(idle.current);
  }, [open]);

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

  // Render the real spots, filtered by the active interests. Until now the map
  // drew ~8 hardcoded `geoPins` from data.ts and `activeInterests` was computed
  // but never read -- so the filter toggled state nothing consumed, and none of
  // the 120 actual spots were ever on the map.
  const pins = useRef<maplibregl.Marker[]>([]);
  const activeKey = activeInterests.join(",");
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    pins.current.forEach((m) => m.remove());
    pins.current = [];

    // An empty selection means "no filter", not "show nothing". A persisted
    // all-false state was leaving the map with zero pins and no way to tell
    // why -- a filter that can hide everything needs an off state, not a
    // silent empty result.
    const showAll = activeInterests.length === 0;
    if (zoom < PIN_MIN_ZOOM) return;
    for (const spot of spots) {
      const id = interestOf(spot.category);
      if (!showAll && !activeInterests.includes(id)) continue;
      const el = document.createElement("button");
      el.className = "bline-spot-pin";
      el.style.background = INTERESTS[id].color;
      el.setAttribute("aria-label", `${spot.name} — ${spot.category}`);
      el.textContent = spot.rating.toFixed(1);
      el.onclick = (e) => { e.stopPropagation(); nav(`/spot/${spot.id}`); };
      pins.current.push(new maplibregl.Marker({ element: el }).setLngLat([spot.lng, spot.lat]).addTo(map));
    }
    return () => { pins.current.forEach((m) => m.remove()); pins.current = []; };
  }, [spots, activeKey, nav, mapReady, zoom]);

  // Keep the label honest if a gesture flattens the map out from under us.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const sync = () => setThreeD(map.getPitch() > 10);
    // Dragging the map collapses the stack: if you're moving the map you're not
    // reaching for a control, and the chrome should retreat.
    const collapse = () => setOpen(false);
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoomend", onZoom);
    map.on("pitchend", sync);
    map.on("dragstart", collapse);
    return () => { map.off("pitchend", sync); map.off("dragstart", collapse); map.off("zoomend", onZoom); };
  }, [mapReady]);

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
  }, [heat, crowd, mapReady]);

  const CONTROLS: Ctrl[] = [
    {
      key: "locate",
      label: "Recentre on my location",
      onPress: () =>
        navigator.geolocation.getCurrentPosition(({ coords }) =>
          mapRef.current?.easeTo({ center: [coords.longitude, coords.latitude], zoom: 15, duration: 700 })),
      render: (press) => (
        <button aria-label="Recentre on my location" onClick={press}
          className={`${CTRL} bg-[#2f6bff] text-white`}>
          <LocateFixed size={20} />
        </button>
      ),
    },
    {
      key: "3d",
      label: "3D",
      onPress: toggle3D,
      render: (press) => (
        <button aria-label={threeD ? "Switch to 2D map" : "Switch to 3D map"} aria-pressed={threeD}
          onClick={press} className={`${CTRL} ${threeD ? "bg-[#c9187e] text-white" : CTRL_OFF}`}>
          <span className="text-[15px] font-bold tracking-tight">{threeD ? "2D" : "3D"}</span>
        </button>
      ),
    },
    {
      key: "heat",
      label: "Crowd heatmap",
      onPress: () => setHeat((h) => !h),
      render: (press) => (
        <button aria-label={heat ? "Hide crowd heatmap" : "Show crowd heatmap"} aria-pressed={heat}
          onClick={press} className={`${CTRL} ${heat ? "bg-[#c9187e] text-white" : CTRL_OFF}`}>
          <Flame size={20} />
        </button>
      ),
    },
    {
      key: "styles",
      label: "Map styles",
      onPress: () => nav("/map-styles"),
      render: (press) => (
        <button aria-label="Map styles" onClick={press} className={`${CTRL} ${CTRL_OFF}`}>
          <Layers size={20} />
        </button>
      ),
    },
  ];

  return (
    <Screen className="overflow-hidden">
      <RealMapEnhanced zoom={12.1} autoPitch={false} onMap={(m) => { mapRef.current = m; setMapReady(true); }} className="absolute inset-0" />

      {/* Filter chip -- opens a sheet, does not sit over the map. */}
      <InterestSelector />

      {/* right-anchored so it clears the filter chip on the left; gap-4 because
          shrink-wrapping ran the two labels together as "Eastside TrailWhen". */}
      <header className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 max-w-[58%]">
        <div className="flex items-center gap-3 rounded-full bg-[#101014]/90 px-3.5 py-2.5 text-[13px] backdrop-blur">
          <p><span className="text-zinc-400">Where — </span><span className="font-bold">Eastside Trail</span></p>
          <p><span className="text-zinc-400">When — </span><span className="font-bold">Open now</span></p>
        </div>
      </header>

      {/* Idle, the controls compact into a staggered stack -- one thumb-sized
          target instead of four circles down the edge of the map. Tap it and
          they fan out. Dragging the map collapses them again, so the map is
          never competing with its own chrome. */}
      <div className="absolute right-3 z-10 flex flex-col-reverse items-end"
        style={{ bottom: "calc(var(--bline-nav-space) + 1rem)" }}>
        {CONTROLS.map(({ key, label, render, onPress }, i) => (
          <motion.div
            key={key}
            initial={false}
            animate={
              open
                ? { marginTop: 10, x: 0, scale: 1, opacity: 1 }
                : // Collapsed: a vertical deck. Each circle sits a little higher
                  // and a little smaller than the one in front, so the stack
                  // reads as depth without drifting sideways off the edge.
                  { marginTop: -34 - i * 3, x: 0, scale: 1 - i * 0.08, opacity: 1 - i * 0.2 }
            }
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
            style={{ zIndex: CONTROLS.length - i }}
          >
            {render(
              open ? () => { onPress(); armIdle(); } : () => setOpen(true),
              open,
            )}
          </motion.div>
        ))}
      </div>

      {zoom < PIN_MIN_ZOOM && !heat && (
        <div className="pointer-events-none absolute inset-x-0 z-10 flex justify-center"
          style={{ bottom: "calc(var(--bline-nav-space) + 1rem)" }}>
          <p className="rounded-full bg-[#101014]/85 px-3.5 py-2 text-[13px] font-medium text-zinc-300 backdrop-blur">
            Zoom in to see spots
          </p>
        </div>
      )}

      {/* Heat swaps in the conditions that explain the overlay. There is no
          spot deck here any more -- the map tab shows the map. Browsing spots
          is Explore's job; tapping a pin here opens that spot directly. */}
      {heat && (
        <div className="absolute inset-x-0 z-10" style={{ bottom: "var(--bline-nav-space)" }}>
          <CrowdPanel people={crowd.people} />
        </div>
      )}

    </Screen>
  );
}
