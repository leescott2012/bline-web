import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { beltlineLoop } from "@/lib/data";
import { useMapStyle } from "@/lib/mapStyle";

// Enhanced 3D map with premium landmark styling, smooth transitions, and
// high-fidelity building extrusion. Designed for city-grade navigation.
const TREE_SPOTS = beltlineLoop.filter((_, i) => i % 2 === 0);

// What actually makes Google/Apple's 3D read as real is aerial imagery *under*
// extruded buildings -- flat vector fills give it away instantly. Their
// photogrammetry isn't available to us (Google's 3D Tiles run ~$0.50-1.50 per
// navigation session), so this approximates it with two free sources: Esri
// World Imagery for the ground, and Carto's vector tiles for building
// footprints and heights. The vector source URL is the one Carto's own
// published style declares, rather than a guessed tile path.
const PHOTOREAL_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Esri, Maxar, Earthstar Geographics",
    },
    carto: {
      type: "vector",
      url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json",
    },
  },
  layers: [
    { id: "imagery", type: "raster", source: "esri" },
    {
      // Buildings sit on the photography, shaded light-to-dark by height so the
      // skyline reads with depth instead of as one flat grey mass.
      id: "buildings-3d",
      type: "fill-extrusion",
      source: "carto",
      "source-layer": "building",
      minzoom: 14,
      paint: {
        // to-number is load-bearing: `interpolate` requires a numeric input and
        // coalesce(get(...)) types as `value`, which fails style validation and
        // takes the whole map down with it.
        "fill-extrusion-color": [
          "interpolate", ["linear"], ["to-number", ["coalesce", ["get", "render_height"], 10]],
          0, "#d8d3cb",
          20, "#c4bdb2",
          60, "#a89f92",
          150, "#8d8375",
        ],
        "fill-extrusion-height": ["to-number", ["coalesce", ["get", "render_height"], 10]],
        "fill-extrusion-base": ["to-number", ["coalesce", ["get", "render_min_height"], 0]],
        "fill-extrusion-opacity": 0.9,
        "fill-extrusion-vertical-gradient": true,
      },
    },
  ],
};

// Flagship landmarks that deserve special visual treatment
const LANDMARKS = {
  "ponce-city": { lng: -84.3657, lat: 33.7729, name: "Ponce City Market", emoji: "🏛️" },
  "krog-street": { lng: -84.3641, lat: 33.7569, name: "Krog Street Market", emoji: "🍽️" },
};

export default function RealMapEnhanced({
  className = "",
  interactive = true,
  zoom = 12.6,
  center = [-84.381, 33.764] as [number, number],
  decorations = true,
  autoPitch = true,
  photoreal = false,
  onMap,
}: {
  className?: string;
  interactive?: boolean;
  zoom?: number;
  center?: [number, number];
  decorations?: boolean;
  autoPitch?: boolean;
  /** Aerial imagery under extruded buildings, the way Google/Apple render 3D. */
  photoreal?: boolean;
  onMap?: (m: maplibregl.Map) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const mapStyle = useMapStyle();

  useEffect(() => {
    if (!el.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: photoreal ? PHOTOREAL_STYLE : mapStyle.style,
      center,
      zoom: zoom - 1.2,
      interactive,
      attributionControl: false,
      // Omit the key entirely rather than passing undefined: MapLibre treats a
      // present-but-undefined `pitch` as a supplied value, which lands in the
      // camera transform as NaN and throws "Invalid LngLat (NaN, NaN)". Same
      // trap as `bearing` in NavigateEnhanced.
      ...(autoPitch ? { pitch: 0 } : {}),
    });

    onMap?.(map);
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el.current);

    map.on("load", () => {
      map.resize();
      if (decorations) {
        // ── Trail line with enhanced styling ──
        map.addSource("beltline", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: beltlineLoop },
          },
        });

        // Glow effect: thick, semi-transparent base layer
        map.addLayer({
          id: "beltline-glow",
          type: "line",
          source: "beltline",
          paint: {
            "line-color": "#c026d3",
            "line-width": 8,
            "line-opacity": 0.2,
            "line-blur": 4,
          },
        });

        // Main trail line: sharp, vibrant magenta
        map.addLayer({
          id: "beltline-line",
          type: "line",
          source: "beltline",
          paint: {
            "line-color": "#c026d3",
            "line-width": 3.5,
            "line-dasharray": [1.4, 1.6],
            "line-opacity": 0.95,
          },
        });

        // Fly-in animation
        map.easeTo({ zoom, duration: 1600, essential: true });

        // ── Flagship landmarks with custom styling ──
        Object.entries(LANDMARKS).forEach(([id, landmark]) => {
          const d = document.createElement("div");
          // Was an emoji, which renders as a tofu box wherever the emoji font
          // is missing. A styled marker is legible everywhere.
          d.innerHTML = `<div class="bline-landmark" style="width:14px;height:14px;border-radius:9999px;background:#c026d3;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.45)"></div>`;
          d.title = landmark.name;
          new maplibregl.Marker({ element: d, anchor: "bottom" })
            .setLngLat([landmark.lng, landmark.lat])
            .addTo(map);
        });

        // Spot pins are drawn by MapView from the real spot list, filtered
        // by interest -- these were hardcoded stand-ins from data.ts and only
        // duplicated them.

        // ── Trees (dormant until close zoom) ──
        const trees: HTMLDivElement[] = TREE_SPOTS.map((pt) => {
          const t = document.createElement("div");
          t.className = "bline-tree";
          t.textContent = "🌳";
          new maplibregl.Marker({ element: t, anchor: "bottom" })
            .setLngLat(pt)
            .addTo(map);
          return t;
        });

        map.on("zoom", () => {
          const show = map.getZoom() >= 13.5;
          trees.forEach((t) => {
            t.style.display = show ? "block" : "none";
          });
        });
      }

      // ── Premium 3D building extrusion ──
      // Photoreal mode already ships its own extrusion layer over the imagery,
      // so skip this or we stack two sets of buildings on the same footprints.
      try {
        const style = photoreal ? null : map.getStyle();
        const buildingLayer = style?.layers?.find(
          (l) => (l as { "source-layer"?: string })["source-layer"] === "building"
        );

        if (buildingLayer && !map.getLayer("bline-3d-buildings")) {
          map.addLayer(
            {
              id: "bline-3d-buildings",
              type: "fill-extrusion",
              source: (buildingLayer as { source: string }).source,
              "source-layer": "building",
              minzoom: 14,
              paint: {
                // Height-tinted gradient: warm (low) to cool (tall)
                // Gives the skyline a sophisticated, colorful character
                "fill-extrusion-color": [
                  "interpolate",
                  ["linear"],
                  ["coalesce", ["get", "render_height"], ["get", "height"], 12],
                  0,
                  "#fcd34d", // warm gold for low buildings
                  20,
                  "#c4b5fd", // soft purple
                  60,
                  "#818cf8", // deep indigo for tall buildings
                ],
                "fill-extrusion-height": [
                  "coalesce",
                  ["get", "render_height"],
                  ["get", "height"],
                  12,
                ],
                "fill-extrusion-base": [
                  "coalesce",
                  ["get", "render_min_height"],
                  ["get", "min_height"],
                  0,
                ],
                "fill-extrusion-opacity": 0.92,
              },
            },
            buildingLayer.id
          );
        }
      } catch {
        /* raster styles have no vector building layer */
      }

      // ── Premium sky gradient ──
      try {
        map.setSky({
          "sky-color": "#87ceeb",
          "horizon-color": "#f4a460",
          "fog-color": "#ffe4b5",
          "sky-horizon-blend": 0.6,
          "horizon-fog-blend": 0.5,
          "fog-ground-blend": 0.4,
        });
      } catch {
        /* sky unsupported */
      }
    });

    // ── Auto-pitch: smooth 3D tilt on zoom ──
    if (autoPitch) {
      let bucket = 0;
      map.on("zoom", () => {
        const z = map.getZoom();
        const next = z >= 16 ? 2 : z >= 14.5 ? 1 : 0;
        if (next !== bucket) {
          bucket = next;
          const pitch = next === 2 ? 60 : next === 1 ? 35 : 0;
          map.easeTo({ pitch, duration: 600, easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t });
        }
      });
    }

    return () => {
      ro.disconnect();
      map.remove();
    };
  }, [interactive, zoom, center[0], center[1], decorations, autoPitch, photoreal, mapStyle.key]);

  return (
    <div className={className}>
      <div
        ref={el}
        className="h-full w-full"
        style={{ background: "#eae7e0", filter: mapStyle.filter }}
      />
    </div>
  );
}
