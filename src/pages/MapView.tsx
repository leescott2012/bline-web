import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Flame, Layers, LocateFixed, Toilet } from "lucide-react";
import { Link, useLocation } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMapEnhanced from "@/components/RealMapEnhanced";
import CrowdPanel, { CrowdMetrics } from "@/components/CrowdPanel";
import InterestSelector from "@/components/InterestSelector";
import { useSpots } from "@/lib/spots";
import { places, trailSegments } from "@/lib/places";
import { restrooms } from "@/lib/restrooms";
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
const HEAT_GLOW_LAYER = "crowd-ribbon-glow";
const HEAT_LAYER = "crowd-ribbon";

// The supplied density data is point-based, while the Figma reference calls
// for a traffic-style trail ribbon. Score the existing verified corridor
// segments against those points; this changes only presentation, not the data
// source or its live/seeded merge semantics.
function crowdRibbon(points: { lng: number; lat: number; weight: number }[]) {
  const RADIUS = 0.0035; // roughly a few walkable blocks at this latitude
  const raw = trailSegments.map((segment) => {
    const step = Math.max(1, Math.floor(segment.coords.length / 72));
    let total = 0;
    let samples = 0;
    for (let i = 0; i < segment.coords.length; i += step) {
      const [lng, lat] = segment.coords[i];
      const score = points.reduce((sum, point) => {
        const distance = Math.hypot(lng - point.lng, lat - point.lat);
        return distance >= RADIUS ? sum : sum + point.weight * (1 - distance / RADIUS);
      }, 0);
      total += score;
      samples += 1;
    }
    return { segment, score: samples ? total / samples : 0 };
  });
  const peak = Math.max(...raw.map((item) => item.score), 1);
  return {
    type: "FeatureCollection" as const,
    features: raw.map(({ segment, score }) => ({
      type: "Feature" as const,
      properties: { density: Math.max(0.08, score / peak) },
      geometry: { type: "LineString" as const, coordinates: segment.coords },
    })),
  };
}

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
  const openLandmarkScene = useCallback((id: string) => {
    if (id === "ponce-city") nav("/playground-3d?scene=ponce-corridor&autoplay=1");
  }, [nav]);
  const spots = useSpots();
  const interests = useMapInterests();
  const activeInterests = getActiveInterests(interests);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [threeD, setThreeD] = useState(false);
  const [heat, setHeat] = useState(false);
  const [restroomsVisible, setRestroomsVisible] = useState(false);
  const [open, setOpen] = useState(false);
  // Assigning a ref doesn't re-render, so map-dependent effects would run once
  // with `null` and never again. This flips when the map exists.
  const [mapReady, setMapReady] = useState(false);
  const [mapGeneration, setMapGeneration] = useState(0);
  // 120 pins over the whole city is a pile, not a map. They appear once you're
  // close enough for them to be distinguishable.
  const [zoom, setZoom] = useState(12.1);
  const [locateError, setLocateError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
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

    // Nothing shows unless it's selected. The map stays empty until you ask
    // for something -- but an empty map has to say so rather than just looking
    // broken, hence the prompt below.
    if (zoom < PIN_MIN_ZOOM || activeInterests.length === 0) return;
    for (const spot of spots) {
      const id = interestOf(spot.category);
      if (!activeInterests.includes(id)) continue;
      const el = document.createElement("button");
      el.className = "bline-spot-pin";
      el.style.background = INTERESTS[id].color;
      el.setAttribute("aria-label", `${spot.name} — ${spot.category}`);
      el.textContent = spot.rating.toFixed(1);
      el.onclick = (e) => { e.stopPropagation(); nav(`/spot/${spot.id}`); };
      pins.current.push(new maplibregl.Marker({ element: el }).setLngLat([spot.lng, spot.lat]).addTo(map));
    }

    // Parks, public art and trail access from Atlanta BeltLine Inc's public
    // ArcGIS (see scripts/fetch-places.mjs). These carry no rating -- inventing
    // one to match the spot pins would be fabricating data -- so they render as
    // a labelled dot instead of a number.
    for (const place of places) {
      if (!activeInterests.includes(place.kind)) continue;
      const el = document.createElement("button");
      el.className = "bline-place-pin";
      el.style.background = INTERESTS[place.kind].color;
      el.setAttribute("aria-label", place.detail ? `${place.name} — ${place.detail}` : place.name);
      el.title = place.detail ? `${place.name} — ${place.detail}` : place.name;
      el.onclick = (e) => {
        e.stopPropagation();
        map.easeTo({ center: [place.lng, place.lat], zoom: Math.max(map.getZoom(), 16), duration: 500 });
      };
      pins.current.push(new maplibregl.Marker({ element: el }).setLngLat([place.lng, place.lat]).addTo(map));
    }
    return () => { pins.current.forEach((m) => m.remove()); pins.current = []; };
  }, [spots, activeKey, nav, mapReady, mapGeneration, zoom]);

  // These units are announced by the City and BeltLine by locality only. Each
  // marker is intentionally labelled "near" because it uses a verified trail-
  // access anchor, not an invented exact unit coordinate.
  const restroomPins = useRef<maplibregl.Marker[]>([]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    restroomPins.current.forEach((marker) => marker.remove());
    restroomPins.current = [];
    if (!restroomsVisible) return;

    const bounds = new maplibregl.LngLatBounds();
    for (const restroom of restrooms) {
      bounds.extend([restroom.lng, restroom.lat]);
      const el = document.createElement("button");
      el.className = "bline-restroom-pin";
      el.setAttribute("aria-label", restroom.name);
      el.textContent = "WC";
      el.onclick = (event) => {
        event.stopPropagation();
        map.easeTo({ center: [restroom.lng, restroom.lat], zoom: Math.max(map.getZoom(), 15.5), duration: 500 });
        new maplibregl.Popup({ offset: 18, closeButton: false, maxWidth: "220px" })
          .setLngLat([restroom.lng, restroom.lat])
          .setHTML(`<strong>${restroom.name}</strong><p>${restroom.detail}</p><a href="${restroom.sourceUrl}" target="_blank" rel="noreferrer">Official location announcement</a>`)
          .addTo(map);
      };
      restroomPins.current.push(new maplibregl.Marker({ element: el }).setLngLat([restroom.lng, restroom.lat]).addTo(map));
    }
    // The four announced localities span the corridor. Bring them into the
    // actual mobile map viewport rather than leaving edge markers half outside
    // the frame at the default Eastside-focused camera position.
    map.fitBounds(bounds, {
      padding: { top: 112, right: 56, bottom: 136, left: 56 },
      maxZoom: 13.8,
      duration: 650,
    });

    return () => { restroomPins.current.forEach((marker) => marker.remove()); restroomPins.current = []; };
  }, [mapReady, mapGeneration, restroomsVisible]);

  // Toggling a filter below the pin threshold used to do nothing at all: the
  // map opens at 12.1 and pins need 13.2, so the control looked broken. Turning
  // one on now moves the map to where it actually applies.
  const firstFilterRender = useRef(true);
  useEffect(() => {
    if (firstFilterRender.current) { firstFilterRender.current = false; return; }
    const map = mapRef.current;
    if (!map || !activeKey || map.getZoom() >= PIN_MIN_ZOOM) return;
    map.easeTo({ zoom: PIN_MIN_ZOOM + 0.4, duration: 600 });
  }, [activeKey, mapReady, mapGeneration]);

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
  }, [mapReady, mapGeneration]);

  // Live crowd density is aggregated as points. In heat mode it is translated
  // into a trail-aligned ribbon, matching the Figma conditions view while
  // keeping the existing verified BeltLine geometry and density pipeline.
  const crowd = useCrowd(heat);

  useEffect(() => {
    const map = mapRef.current;
    // A style transition or component cleanup can briefly leave a MapLibre Map
    // instance in the ref after its internal style has been removed. Calling
    // getSource/getLayer in that interval throws from MapLibre's style object.
    // The next onMap callback advances mapGeneration once the replacement style
    // is loaded, which re-runs this effect safely.
    if (!map || !map.isStyleLoaded()) return;
    if (!heat) {
      [HEAT_LAYER, HEAT_GLOW_LAYER].forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
      if (map.getSource(HEAT_SOURCE)) map.removeSource(HEAT_SOURCE);
      return;
    }
    const data = crowdRibbon(crowd.points);
    const existing = map.getSource(HEAT_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (existing) {
      existing.setData(data);
      return;
    }

    map.addSource(HEAT_SOURCE, { type: "geojson", data });
    const color = ["interpolate", ["linear"], ["get", "density"], 0.08, "#5bd05b", 0.32, "#b8e84c", 0.54, "#ffd33d", 0.72, "#ff8a2a", 1, "#ef3b38"] as maplibregl.ExpressionSpecification;
    map.addLayer({
      id: HEAT_GLOW_LAYER,
      type: "line",
      source: HEAT_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": color, "line-width": 18, "line-opacity": 0.24, "line-blur": 8 },
    });
    map.addLayer({
      id: HEAT_LAYER,
      type: "line",
      source: HEAT_SOURCE,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": color, "line-width": 6, "line-opacity": 0.96 },
    });
  }, [heat, crowd, mapReady, mapGeneration]);

  const CONTROLS: Ctrl[] = [
    {
      key: "locate",
      label: "Recentre on my location",
      onPress: () =>
        navigator.geolocation.getCurrentPosition(
          ({ coords }) =>
            mapRef.current?.easeTo({ center: [coords.longitude, coords.latitude], zoom: 15, duration: 700 }),
          // Without a failure path this button silently does nothing when
          // location is denied or unavailable, which reads as a dead control.
          () => setLocateError(true),
        ),
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
          onClick={press} className={`${CTRL} ${threeD ? "bg-accent text-on-brand" : CTRL_OFF}`}>
          <span className="text-[15px] font-bold tracking-tight">{threeD ? "2D" : "3D"}</span>
        </button>
      ),
    },
    {
      key: "restrooms",
      label: "Public restrooms",
      onPress: () => setRestroomsVisible((visible) => !visible),
      render: (press) => (
        <button aria-label={restroomsVisible ? "Hide public restrooms" : "Show public restrooms"} aria-pressed={restroomsVisible}
          onClick={press} className={`${CTRL} ${restroomsVisible ? "bg-accent text-on-brand" : CTRL_OFF}`}>
          <Toilet size={20} />
        </button>
      ),
    },
    {
      key: "heat",
      label: "Crowd heatmap",
      onPress: () => setHeat((h) => !h),
      render: (press) => (
        <button aria-label={heat ? "Hide crowd heatmap" : "Show crowd heatmap"} aria-pressed={heat}
          onClick={press} className={`${CTRL} ${heat ? "bg-fuchsia-500 text-white" : CTRL_OFF}`}>
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
      <RealMapEnhanced
        zoom={12.1}
        autoPitch={false}
        onMap={(m) => { mapRef.current = m; setMapReady(true); setMapGeneration((generation) => generation + 1); }}
        onLandmarkClick={openLandmarkScene}
        className="absolute inset-0"
      />

      {/* Figma darkens the base map while preserving a readable, navigation-
          first corridor. An in-place veil avoids resetting the live MapLibre
          instance and does not modify the user's saved map-style preference. */}
      {heat && <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] bg-[#101827]/55" />}

      {/* Filters belong to the exploration map. Figma's crowd screen is a
          focused conditions view, so it deliberately removes competing chrome. */}
      {!heat && <InterestSelector open={filtersOpen} onOpenChange={setFiltersOpen} />}

      {heat ? (
        <section className="absolute inset-x-4 top-[max(0.75rem,env(safe-area-inset-top))] z-10">
          <div className="relative flex min-h-8 items-center pl-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            <button aria-label="Exit crowd-density view" onClick={() => setHeat(false)} className="absolute left-0 grid size-7 place-items-center">
              <ChevronLeft size={30} strokeWidth={2.5} aria-hidden="true" />
            </button>
            <h1 className="whitespace-nowrap text-[14px] font-extrabold tracking-[0.08em]">TRAIL CONDITIONS <span className="font-medium text-zinc-300">/ CROWD-DENSITY</span></h1>
          </div>
          <CrowdMetrics people={crowd.people} />
        </section>
      ) : (
        /* Right-anchored so it clears the filter chip on the left; gap-4 because
           shrink-wrapping ran the two labels together as "Eastside TrailWhen". */
        <header className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 max-w-[58%]">
          <div className="flex items-center gap-3 rounded-full bg-[#101014]/90 px-3.5 py-2.5 text-[13px] backdrop-blur">
            <p><span className="text-zinc-400">Where — </span><span className="font-bold">Eastside Trail</span></p>
            <p><span className="text-zinc-400">When — </span><span className="font-bold">Open now</span></p>
          </div>
        </header>
      )}

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

      {locateError && (
        <div className="absolute inset-x-0 z-20 flex justify-center"
          style={{ bottom: "calc(var(--bline-nav-space) + 4rem)" }}>
          <button onClick={() => setLocateError(false)}
            className="rounded-full bg-[#101014]/90 px-4 py-2 text-[13px] font-medium text-zinc-200 backdrop-blur">
            Location unavailable — check Settings
          </button>
        </div>
      )}

      {activeInterests.length === 0 && !heat && !restroomsVisible && (
        <div className="absolute inset-x-0 z-10 flex justify-center"
          style={{ bottom: "calc(var(--bline-nav-space) + 1rem)" }}>
          <button onClick={() => setFiltersOpen(true)}
            className="rounded-full bg-[#101014]/85 px-3.5 py-2 text-[13px] font-medium text-zinc-300 backdrop-blur">
            Choose what to show
          </button>
        </div>
      )}

      {activeInterests.length > 0 && zoom < PIN_MIN_ZOOM && !heat && !restroomsVisible && (
        <div className="absolute inset-x-0 z-10 flex justify-center"
          style={{ bottom: "calc(var(--bline-nav-space) + 1rem)" }}>
          <button
            onClick={() => mapRef.current?.easeTo({ zoom: PIN_MIN_ZOOM + 0.4, duration: 600 })}
            className="rounded-full bg-[#101014]/85 px-3.5 py-2 text-[13px] font-medium text-zinc-300 backdrop-blur">
            Zoom in to see spots
          </button>
        </div>
      )}

      {/* Heat swaps in the conditions that explain the overlay. There is no
          spot deck here any more -- the map tab shows the map. Browsing spots
          is Explore's job; tapping a pin here opens that spot directly. */}
      {heat && (
        <div className="absolute inset-x-0 z-10" style={{ bottom: "calc(var(--bline-nav-space) + 0.45rem)" }}>
          <CrowdPanel />
        </div>
      )}

    </Screen>
  );
}
