import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { beltlineLoop, geoPins } from "@/lib/data";

// Real 2D Atlanta map (Carto dark style, no API key). Fly-in + pin drop animations.
export default function RealMap({
  className = "",
  interactive = true,
  zoom = 12.6,
  center = [-84.381, 33.764] as [number, number],
  onMap,
}: {
  className?: string;
  interactive?: boolean;
  zoom?: number;
  center?: [number, number];
  onMap?: (m: maplibregl.Map) => void;
}) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!el.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center,
      zoom: zoom - 1.2,
      interactive,
      attributionControl: false,
    });

    onMap?.(map);
    map.on("load", () => {
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
    });

    return () => map.remove();
  }, [interactive, zoom, center[0], center[1]]);

  return (
    <div className={className}>
      <div ref={el} className="h-full w-full" />
    </div>
  );
}
