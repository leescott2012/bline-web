import { useSyncExternalStore } from "react";
import type { StyleSpecification } from "maplibre-gl";

export type MapStyleKey = "standard" | "trail" | "satellite" | "night" | "minimal" | "terrain";

export interface MapStyleDef {
  key: MapStyleKey;
  name: string;
  description: string;
  // URL styles (CARTO) declare their own OSM/CARTO attribution; inline styles must set it per source.
  style: string | StyleSpecification;
  filter?: string; // cheap CSS-filter variant when there's no distinct free vector style
}

// Esri World Imagery — free, keyless raster basemap. Note: tile URL is z/y/x (Esri's own order).
const esriImagery: StyleSpecification = {
  version: 8,
  sources: {
    esri: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      attribution: "Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "esri-imagery", type: "raster", source: "esri" }],
};

// OpenTopoMap — free, keyless contour/terrain raster basemap.
const openTopo: StyleSpecification = {
  version: 8,
  sources: {
    otm: {
      type: "raster",
      tiles: [
        "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
        "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
        "https://c.tile.opentopomap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors, SRTM | Style &copy; OpenTopoMap (CC-BY-SA)",
    },
  },
  layers: [{ id: "otm", type: "raster", source: "otm" }],
};

export const MAP_STYLES: MapStyleDef[] = [
  {
    key: "standard",
    name: "Standard",
    description: "Balanced and easy to read.",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
  {
    key: "trail",
    name: "Trail",
    description: "Perfect for walking and biking.",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    filter: "saturate(1.35) hue-rotate(55deg) brightness(1.02)",
  },
  {
    key: "satellite",
    name: "Satellite",
    description: "See real aerial imagery.",
    style: esriImagery,
  },
  {
    key: "night",
    name: "Night",
    description: "Easy on the eyes after dark.",
    style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  {
    key: "minimal",
    name: "Minimal",
    description: "Clean, distraction-free view.",
    style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  {
    key: "terrain",
    name: "Terrain",
    description: "Elevation and trail contours.",
    style: openTopo,
  },
];

const STORAGE_KEY = "bline:mapStyle";
let current: MapStyleKey = (localStorage.getItem(STORAGE_KEY) as MapStyleKey) || "standard";
const listeners = new Set<() => void>();

export function setMapStyle(key: MapStyleKey) {
  current = key;
  localStorage.setItem(STORAGE_KEY, key);
  listeners.forEach((l) => l());
}

export function getMapStyleDef(key: MapStyleKey): MapStyleDef {
  return MAP_STYLES.find((s) => s.key === key) ?? MAP_STYLES[0];
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Global map style, shared by every RealMap instance (Explore, Map tab, Navigate).
export function useMapStyle(): MapStyleDef {
  const key = useSyncExternalStore(subscribe, () => current, () => current);
  return getMapStyleDef(key);
}
