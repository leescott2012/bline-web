import { useEffect, useRef } from "react";
import { ChevronLeft, Users, Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react";
import { Link } from "wouter";
import type maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMap from "@/components/RealMap";
import { crowdDensityPoints } from "@/lib/data";
import { useWeatherNow } from "@/lib/weather";

// 12-bar chart spanning 10 AM – 9 PM. Labels match the actual hours so the
// peak bar (index 6 = 4 PM) aligns with PEAK_WINDOW "4–6 PM".
const hours = ["10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const heights = [4, 5, 8, 14, 34, 48, 64, 52, 40, 22, 14, 10];
// single source of truth for the peak window — was two independently hardcoded
// strings (this heading + the "Peak until" stat chip) that could silently drift.
const PEAK_WINDOW = "4–6 PM";
const PEAK_ENDS = PEAK_WINDOW.split("–")[1].trim();

// crowd-level label derived from the real heatmap weight total (crowdDensityPoints),
// not hardcoded — shifts if the underlying density data changes.
const TOTAL_WEIGHT = crowdDensityPoints.reduce((s, p) => s + p.weight, 0);
const CROWD_LEVEL = TOTAL_WEIGHT < 30 ? "Light" : TOTAL_WEIGHT < 60 ? "Moderate" : "Busy";

// icon for the current WMO weather code — falls back to Sun if unmapped
function weatherIcon(code: number) {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Sun;
}

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

  const weather = useWeatherNow();
  const WeatherIcon = weather ? weatherIcon(weather.code) : Sun;
  // falls back to a static reading if the fetch fails (offline, blocked) or
  // hasn't resolved yet — never blocks or blanks the chip
  const weatherBig = weather ? `${weather.tempF}°F` : "72°F";
  const weatherSmall = weather ? weather.label : "clear";

  return (
    <Screen className="overflow-hidden">
      <header className="relative flex items-center px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link href="/profile" aria-label="Back" className="mr-3"><ChevronLeft size={22} /></Link>
        <h1 className="text-sm font-bold tracking-widest text-zinc-300">
          TRAIL CONDITIONS / <span className="text-white">CROWD-DENSITY</span>
        </h1>
      </header>

      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-3">
        {[
          { icon: Users, big: CROWD_LEVEL, small: "crowd" },
          { icon: WeatherIcon, big: weatherBig, small: weatherSmall },
          { icon: null, big: "Peak until", small: PEAK_ENDS },
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
        <h2 className="text-center text-lg font-bold">Eastside Trail · busiest {PEAK_WINDOW}</h2>
        <div className="mt-3 flex h-20 items-end justify-between gap-1.5">
          {heights.map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#d8b4e2] to-accent" style={{ height: `${h}px`, opacity: 0.5 + h / 130 }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          {hours.map((h, i) => <span key={i} className="flex-1 text-center">{h}</span>)}
        </div>
      </div>
      <div className="h-[var(--bline-nav-space)]" />
    </Screen>
  );
}
