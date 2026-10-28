import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapStyleDef } from "@/lib/mapStyle";

// Figma's smooth schematic BeltLine loop (not the real jagged street-following one —
// too fine to read at thumbnail size).
const LOOP = "M50 22 C 62 24, 68 34, 66 48 C 64 62, 56 72, 46 70 C 34 68, 30 56, 32 44 C 34 32, 40 24, 50 22 Z";

// Real, live, non-interactive mini-map per style — matches the Figma picker's
// realistic thumbnails: real basemap tiles + a bold "Atlanta" label + loop overlay.
export default function MapStylePreview({ def }: { def: MapStyleDef }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: def.style,
      center: [-84.373, 33.757],
      zoom: 11.6,
      interactive: false,
      attributionControl: { compact: true }, // required OSM/CARTO/Esri credits — never hide
    });
    // Non-interactive, so the credits never get the drag that collapses them to the
    // (i) button; collapse once settled ("idle" -- MapLibre expands it on sourcedata,
    // after "load") so the line doesn't cover the thumbnail.
    map.once("idle", () => el.current?.querySelector(".maplibregl-compact-show")?.classList.remove("maplibregl-compact-show"));
    // thumbnails mount before layout settles (0-height flex/scroll children) — keep the
    // canvas matched to its container once real dimensions land.
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el.current);
    return () => { ro.disconnect(); map.remove(); };
  }, [def.style]);

  return (
    <div className="relative h-full w-full">
      <div ref={el} className="h-full w-full" style={{ filter: def.filter, background: "#eae7e0" }} />
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full">
        <path d={LOOP} fill="none" stroke="#a855f7" strokeWidth="3" />
        <text x="50" y="52" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff"
          style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.45)", strokeWidth: 2.5, strokeLinejoin: "round" }}>
          Atlanta
        </text>
      </svg>
    </div>
  );
}
