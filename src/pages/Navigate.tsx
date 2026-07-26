import { useEffect, useRef, useState } from "react";
import { ArrowUp, CornerUpRight, CornerUpLeft, Flag, Navigation2, X } from "lucide-react";
import { useLocation } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMap from "@/components/RealMap";
import { navRoute, navSteps, distM } from "@/lib/data";

const TOTAL_MI = 1.4, TOTAL_MIN = 28, DUR_MS = 40000;

// cumulative distance along the route (meters)
const cum = navRoute.reduce<number[]>((acc, pt, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + distM(navRoute[i - 1], pt));
  return acc;
}, []);
const totalM = cum[cum.length - 1];

function bearing(a: [number, number], b: [number, number]) {
  const toR = Math.PI / 180, toD = 180 / Math.PI;
  const y = Math.sin((b[0] - a[0]) * toR) * Math.cos(b[1] * toR);
  const x = Math.cos(a[1] * toR) * Math.sin(b[1] * toR) - Math.sin(a[1] * toR) * Math.cos(b[1] * toR) * Math.cos((b[0] - a[0]) * toR);
  return (Math.atan2(y, x) * toD + 360) % 360;
}
function posAt(p: number): { pos: [number, number]; brg: number } {
  const d = p * totalM;
  let i = 0;
  while (i < cum.length - 2 && cum[i + 1] < d) i++;
  const seg = cum[i + 1] - cum[i] || 1;
  const t = (d - cum[i]) / seg;
  const a = navRoute[i], b = navRoute[i + 1];
  return { pos: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], brg: bearing(a, b) };
}
const fmtClock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const stepIcon = { up: ArrowUp, right: CornerUpRight, left: CornerUpLeft, flag: Flag } as const;

export default function Navigate() {
  const [, nav] = useLocation();
  const mapRef = useRef<maplibregl.Map | null>(null);
  const puckRef = useRef<maplibregl.Marker | null>(null);
  const follow = useRef(true);
  const raf = useRef(0);
  const prev = useRef({ si: -1, mi: "", min: -1 });

  const [step, setStep] = useState(navSteps[0]);
  const [eta, setEta] = useState({ mi: TOTAL_MI.toFixed(1), min: TOTAL_MIN, arr: "" });
  const [arrived, setArrived] = useState(false);
  const [recenterVisible, setRecenterVisible] = useState(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const start = () => {
      const maplibre = maplibregl;
      // route casing + line
      map.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: navRoute } } });
      map.addLayer({ id: "route-casing", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#7b1e86", "line-width": 12 } });
      map.addLayer({ id: "route-line", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#d946ef", "line-width": 6 } });

      // start dot + destination pin
      const dot = document.createElement("div");
      dot.className = "nav-dot";
      new maplibre.Marker({ element: dot }).setLngLat(navRoute[0]).addTo(map);
      const dest = document.createElement("div");
      dest.innerHTML = `<div class="nav-dest">📍</div>`;
      new maplibre.Marker({ element: dest, anchor: "bottom" }).setLngLat(navRoute[navRoute.length - 1]).addTo(map);

      // puck (always points up; the map rotates to heading)
      const puckEl = document.createElement("div");
      puckEl.innerHTML = `<div class="nav-puck"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2 L20 21 L12 16 L4 21 Z" fill="#fff"/></svg></div>`;
      puckRef.current = new maplibre.Marker({ element: puckEl, rotationAlignment: "viewport" }).setLngLat(navRoute[0]).addTo(map);

      const first = posAt(0);
      map.jumpTo({ center: first.pos, zoom: 15.5, pitch: 55, bearing: first.brg });
      map.on("dragstart", () => { follow.current = false; setRecenterVisible(true); });

      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / DUR_MS, 1);
        const { pos, brg } = posAt(p);
        puckRef.current!.setLngLat(pos);
        if (follow.current) map.easeTo({ center: pos, bearing: brg, duration: 120, easing: (x) => x });

        let si = 0;
        for (let k = 0; k < navSteps.length; k++) if (navSteps[k].at <= p) si = k;
        if (si !== prev.current.si) { prev.current.si = si; setStep(navSteps[si]); }
        const mi = ((1 - p) * TOTAL_MI).toFixed(1);
        const min = Math.max(0, Math.round((1 - p) * TOTAL_MIN));
        if (mi !== prev.current.mi || min !== prev.current.min) {
          prev.current.mi = mi; prev.current.min = min;
          setEta({ mi, min, arr: fmtClock(Date.now() + min * 60000) });
        }
        if (p < 1) raf.current = requestAnimationFrame(tick);
        else setArrived(true);
      };
      raf.current = requestAnimationFrame(tick);
    };

    if (map.isStyleLoaded()) start();
    else map.once("load", start);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const recenter = () => { follow.current = true; setRecenterVisible(false); };
  const StepIcon = stepIcon[step.icon];

  return (
    <Screen className="overflow-hidden bg-[#bcd9ea]">
      <RealMap interactive decorations={false} autoPitch={false} zoom={15.5} center={navRoute[0]} onMap={(m) => (mapRef.current = m)} className="absolute inset-0" />

      {/* top instruction banner */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-10">
        <div className="overflow-hidden rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 bg-black/90 p-4 text-white">
            <StepIcon size={38} strokeWidth={2.5} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-3xl font-bold leading-none">{step.dist}</p>
              <p className="mt-1 truncate text-lg text-zinc-300">{step.text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* recenter */}
      {recenterVisible && (
        <button onClick={recenter}
          className="absolute bottom-40 right-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 font-semibold text-blue-600 shadow-lg">
          <Navigation2 size={16} /> Recenter
        </button>
      )}

      {/* bottom ETA card */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="rounded-3xl bg-white/95 p-4 shadow-xl backdrop-blur">
          {arrived ? (
            <p className="py-2 text-center text-xl font-bold text-zinc-900">You've arrived at Krog Street Market 🎉</p>
          ) : (
            <div className="flex items-center justify-around text-center text-zinc-900">
              <div><p className="text-3xl font-bold">{eta.arr || "—"}</p><p className="text-sm text-zinc-500">arrival</p></div>
              <div><p className="text-3xl font-bold">{eta.min}</p><p className="text-sm text-zinc-500">min</p></div>
              <div><p className="text-3xl font-bold">{eta.mi}</p><p className="text-sm text-zinc-500">mi</p></div>
            </div>
          )}
          <button onClick={() => nav("/trail")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#c9187e] py-3 font-semibold text-white">
            <X size={18} /> End
          </button>
        </div>
      </div>
    </Screen>
  );
}
