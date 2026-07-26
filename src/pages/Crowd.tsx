import { useEffect, useRef } from "react";
import { ChevronLeft, Users, Sun } from "lucide-react";
import { Link } from "wouter";
import type maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import RealMap from "@/components/RealMap";
import { crowdDensityPoints } from "@/lib/data";

const hours = ["0", "1", "2", "3", "4", "6", "7", "8", "9", "10", "1", "2"];
const heights = [4, 5, 8, 14, 34, 48, 64, 52, 40, 22, 14, 10];

const radiusByZoom = (mult: number) =>
  ["interpolate", ["linear"], ["zoom"], 10, 16 * mult, 16, 38 * mult] as maplibregl.ExpressionSpecification;

export default function Crowd() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const start = () => {
      map.addSource("crowd-density", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: crowdDensityPoints.map((p) => ({
            type: "Feature",
            properties: { weight: p.weight },
            geometry: { type: "Point", coordinates: [p.lng, p.lat] },
          })),
        },
      });
      map.addLayer({
        id: "crowd-heat",
        type: "heatmap",
        source: "crowd-density",
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
          "heatmap-radius": radiusByZoom(1),
          "heatmap-opacity": 0.72,
        },
      });

      // live glow/pulse — two offset sine waves so opacity and radius breathe
      // out of phase, reads as a fluid glow rather than a rigid blink.
      const t0 = performance.now();
      const tick = (t: number) => {
        const dt = (t - t0) / 1000;
        const opacity = 0.62 + 0.18 * Math.sin(dt * 1.1);
        const radiusMult = 1 + 0.12 * Math.sin(dt * 0.8 + 1.2);
        if (map.getLayer("crowd-heat")) {
          map.setPaintProperty("crowd-heat", "heatmap-opacity", opacity);
          map.setPaintProperty("crowd-heat", "heatmap-radius", radiusByZoom(radiusMult));
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    if (map.isStyleLoaded()) start();
    else map.once("load", start);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <Screen className="overflow-hidden">
      <header className="relative flex items-center px-4 py-4">
        <Link href="/profile" aria-label="Back" className="mr-3"><ChevronLeft size={22} /></Link>
        <h1 className="text-sm font-bold tracking-widest text-zinc-300">
          TRAIL CONDITIONS / <span className="text-white">CROWD-DENSITY</span>
        </h1>
      </header>

      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-3">
        {[
          { icon: Users, big: "Moderate", small: "crowd" },
          { icon: Sun, big: "72°F", small: "clear" },
          { icon: null, big: "Peak until", small: "6 PM" },
        ].map(({ icon: Icon, big, small }, i) => (
          <div key={i} className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-accent bg-[#f3e3f3] px-4 py-2.5 text-zinc-900">
            {Icon && <Icon size={20} className="text-accent" />}
            <div><p className="font-bold leading-tight">{big}</p><p className="text-sm leading-tight">{small}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mx-0 h-[55%] overflow-hidden">
        <RealMap decorations={false} zoom={13.6} center={[-84.3665, 33.7723]}
          onMap={(m) => (mapRef.current = m)} className="absolute inset-0" />
      </div>

      <div className="mx-4 mt-3 rounded-3xl border-2 border-accent bg-white p-4 text-zinc-900">
        <h2 className="text-center text-lg font-bold">Eastside Trail · busiest 4–6 PM</h2>
        <div className="mt-3 flex h-20 items-end justify-between gap-1.5">
          {heights.map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#d8b4e2] to-accent" style={{ height: `${h}px`, opacity: 0.5 + h / 130 }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          {hours.map((h, i) => <span key={i} className="flex-1 text-center">{h}</span>)}
        </div>
      </div>
      <div className="h-24" />
      <TabBar />
    </Screen>
  );
}
