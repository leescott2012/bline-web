import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { beltlineLoop, geoPins } from "@/lib/data";

// Real 2D Atlanta map (Carto Voyager street style, no API key). Fly-in + pin drop.
// styleUrl lets the Map-styles screen swap basemaps (voyager/positron/dark/satellite).
export const MAP_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

export default function RealMap({
  className = "",
  interactive = true,
  zoom = 12.6,
  center = [-84.381, 33.764] as [number, number],
  styleUrl = MAP_STYLE,
  decorations = true,
  onMap,
}: {
  className?: string;
  interactive?: boolean;
  zoom?: number;
  center?: [number, number];
  styleUrl?: string;
  decorations?: boolean;
  onMap?: (m: maplibregl.Map) => void;
}) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: styleUrl,
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
      }
    });

    return () => { ro.disconnect(); map.remove(); };
  }, [interactive, zoom, center[0], center[1], styleUrl, decorations]);

  return (
    <div className={className}>
      <div ref={el} className="h-full w-full" style={{ background: "#eae7e0" }} />
    </div>
  );
}
