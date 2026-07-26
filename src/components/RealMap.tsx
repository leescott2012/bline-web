import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { beltlineLoop, geoPins } from "@/lib/data";
import { useMapStyle } from "@/lib/mapStyle";

// Sample every Nth loop point for tree markers so close-zoom/3D views feel alive
// without cluttering the map at city-wide zoom.
const TREE_SPOTS = beltlineLoop.filter((_, i) => i % 2 === 0);

// Real 2D/3D Atlanta map. Basemap is global (set on the Map tab's style picker,
// persisted, and shared by every instance — Explore, Map tab, Navigate).
export default function RealMap({
  className = "",
  interactive = true,
  zoom = 12.6,
  center = [-84.381, 33.764] as [number, number],
  decorations = true,
  autoPitch = true,
  onMap,
}: {
  className?: string;
  interactive?: boolean;
  zoom?: number;
  center?: [number, number];
  decorations?: boolean;
  autoPitch?: boolean; // auto-tilt to 3D at close zoom, Apple/Google-Maps style
  onMap?: (m: maplibregl.Map) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapStyle = useMapStyle();

  useEffect(() => {
    if (!el.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: mapStyle.style,
      center,
      zoom: zoom - 1.2,
      interactive,
      attributionControl: false,
    });

    onMap?.(map);
    // keep the canvas matched to its container (it can init before layout settles)
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el.current);

    map.on("load", () => {
      map.resize();
      if (decorations) {
        map.addSource("beltline", {
          type: "geojson",
          data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: beltlineLoop } },
        });
        map.addLayer({
          id: "beltline-line",
          type: "line",
          source: "beltline",
          paint: { "line-color": "#c026d3", "line-width": 3.5, "line-dasharray": [1.4, 1.6] },
        });
        // fly-in
        map.easeTo({ zoom, duration: 1600, essential: true });
        // pins drop in, staggered
        geoPins.forEach((p, i) => {
          const d = document.createElement("div");
          d.innerHTML = `<div class="bline-pin" style="animation-delay:${300 + i * 90}ms"><span class="star">★</span> ${p.r.toFixed(1)}</div>`;
          new maplibregl.Marker({ element: d, anchor: "bottom" }).setLngLat([p.lng, p.lat]).addTo(map);
        });

        // trees along the trail — dormant at city zoom, wake up once you're close
        const trees: HTMLDivElement[] = TREE_SPOTS.map((pt) => {
          const t = document.createElement("div");
          t.className = "bline-tree";
          t.textContent = "🌳";
          new maplibregl.Marker({ element: t, anchor: "bottom" }).setLngLat(pt).addTo(map);
          return t;
        });
        map.on("zoom", () => {
          const show = map.getZoom() >= 13.5;
          trees.forEach((t) => { t.style.display = show ? "block" : "none"; });
        });
      }

      // Best-effort 3D buildings: extrude the vector style's building layer when one
      // exists. The free tileset has no per-building height, so most blocks fall back
      // to a constant height — real footprints, approximate massing.
      try {
        const style = map.getStyle();
        const buildingLayer = style?.layers?.find((l) => (l as { "source-layer"?: string })["source-layer"] === "building");
        if (buildingLayer && !map.getLayer("bline-3d-buildings")) {
          map.addLayer(
            {
              id: "bline-3d-buildings",
              type: "fill-extrusion",
              source: (buildingLayer as { source: string }).source,
              "source-layer": "building",
              minzoom: 15,
              paint: {
                // height-tinted instead of flat gray: low buildings warm, tall ones cool —
                // gives the skyline some of the wireframe's colorful-mural character.
                "fill-extrusion-color": [
                  "interpolate", ["linear"],
                  ["coalesce", ["get", "render_height"], ["get", "height"], 12],
                  0, "#fbcfe8",
                  20, "#c4b5fd",
                  60, "#818cf8",
                ],
                "fill-extrusion-height": ["coalesce", ["get", "render_height"], ["get", "height"], 12],
                "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
                "fill-extrusion-opacity": 0.88,
              },
            },
            buildingLayer.id,
          );
        }
      } catch {
        /* raster styles (satellite/terrain) have no vector building layer to extrude */
      }

      // warm sunset sky — only visible once autoPitch tilts the camera
      try {
        map.setSky({
          "sky-color": "#7fc2f0",
          "horizon-color": "#f6a8b8",
          "fog-color": "#fde7c7",
          "sky-horizon-blend": 0.5,
          "horizon-fog-blend": 0.5,
          "fog-ground-blend": 0.5,
        });
      } catch {
        /* sky unsupported on this style — harmless no-op */
      }
    });

    // Apple/Google-style auto-tilt: pitch in once zoomed to street level, flatten back out.
    if (autoPitch) {
      let bucket = 0;
      map.on("zoom", () => {
        const z = map.getZoom();
        const next = z >= 16 ? 2 : z >= 14.5 ? 1 : 0;
        if (next !== bucket) {
          bucket = next;
          map.easeTo({ pitch: next === 2 ? 55 : next === 1 ? 30 : 0, duration: 500 });
        }
      });
    }

    return () => { ro.disconnect(); map.remove(); };
  }, [interactive, zoom, center[0], center[1], decorations, autoPitch, mapStyle.key]);

  return (
    <div className={className}>
      <div ref={el} className="h-full w-full" style={{ background: "#eae7e0", filter: mapStyle.filter }} />
    </div>
  );
}
