import { useRef, useState } from "react";
import { Check, ChevronLeft, Map as MapIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, useMotionValue, useTransform, animate, useReducedMotion, type PanInfo } from "framer-motion";
import Screen from "@/components/Screen";
import MapStylePreview from "@/components/MapStylePreview";
import { MAP_STYLES, useMapStyle, setMapStyle } from "@/lib/mapStyle";

const N = MAP_STYLES.length;
const wrap = (i: number) => ((i % N) + N) % N;
const DRAG_RANGE = 190; // px of drag that equals one full card-to-card swap
const SPRING = { type: "spring", stiffness: 300, damping: 28 } as const;

function vibrate(ms: number) {
  // best-effort: Vibration API is Android-Chrome-only — iOS Safari/WKWebView has
  // no web haptics API at all, so this silently no-ops there.
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
}

// slot: -1 = left peek, 0 = center, 1 = right peek. `t` is live drag progress (-1..1).
function useSlotStyle(slot: number, t: import("framer-motion").MotionValue<number>, reduced: boolean) {
  const dist = useTransform(t, (v) => slot - v);
  const x = useTransform(dist, [-1, 0, 1], [-118, 0, 118]);
  const scale = useTransform(dist, [-1, 0, 1], [0.82, 1, 0.82]);
  const rotateY = useTransform(dist, [-1, 0, 1], reduced ? [0, 0, 0] : [18, 0, -18]);
  const opacity = useTransform(dist, [-1.4, 0, 1.4], [0, 1, 0]);
  const filter = useTransform(dist, (d) => (reduced ? "none" : `blur(${Math.min(2, Math.abs(d) * 1.6)}px)`));
  const zIndex = useTransform(dist, (d) => Math.round(10 - Math.abs(d) * 5));
  return { x, scale, rotateY, opacity, filter, zIndex };
}

function StyleCard({ slot, def, t, isActive, reduced, onTap }: {
  slot: number;
  def: (typeof MAP_STYLES)[number];
  t: import("framer-motion").MotionValue<number>;
  isActive: boolean;
  reduced: boolean;
  onTap: () => void;
}) {
  const s = useSlotStyle(slot, t, reduced);
  const isCenter = slot === 0;

  return (
    <motion.button onClick={onTap}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ zIndex: s.zIndex, perspective: 1000 }}>
      <motion.div
        style={{ x: s.x, scale: s.scale, rotateY: s.rotateY, opacity: s.opacity, filter: s.filter }}
        animate={!reduced && isCenter ? { y: [0, -9, 0] } : { y: 0 }}
        transition={!reduced && isCenter ? { y: { duration: 5, repeat: Infinity, ease: "easeInOut" } } : undefined}
        className={`relative overflow-hidden bg-zinc-900 shadow-2xl ${isCenter ? "h-[390px] w-[220px] rounded-[34px] border-4 border-accent shadow-[0_20px_50px_rgba(168,85,247,0.35)]" : "h-[320px] w-[175px] rounded-[34px]"}`}>
        <MapStylePreview def={def} />
        {isCenter && isActive && (
          <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-accent text-white shadow-lg">
            <Check size={16} strokeWidth={3} />
          </motion.span>
        )}
      </motion.div>
    </motion.button>
  );
}

export default function MapStyles() {
  const active = useMapStyle();
  const [, nav] = useLocation();
  const reducedMotionPref = useReducedMotion();
  const reduced = !!reducedMotionPref;
  const [current, setCurrent] = useState(() => Math.max(0, MAP_STYLES.findIndex((s) => s.key === active.key)));
  const t = useMotionValue(0);
  const lastBucket = useRef(0);
  const dragging = useRef(false);
  const centerDef = MAP_STYLES[current];

  const commit = (dir: 1 | -1) => {
    vibrate(20);
    setCurrent((c) => wrap(c + dir));
    t.set(0);
  };

  const onDrag = (_: unknown, info: PanInfo) => {
    const v = -info.offset.x / DRAG_RANGE;
    t.set(v);
    const bucket = v > 0.5 ? 1 : v < -0.5 ? -1 : 0;
    if (bucket !== lastBucket.current) { lastBucket.current = bucket; if (bucket !== 0) vibrate(8); }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    dragging.current = false;
    lastBucket.current = 0;
    const threshold = DRAG_RANGE * 0.32;
    if (info.offset.x < -threshold || info.velocity.x < -600) commit(1);
    else if (info.offset.x > threshold || info.velocity.x > 600) commit(-1);
    else animate(t, 0, SPRING);
  };

  const tapSide = (dir: 1 | -1) => commit(dir);

  const previewStyle = () => {
    setMapStyle(centerDef.key);
    nav("/map");
  };

  return (
    <Screen className="overflow-hidden bg-gradient-to-b from-white via-[#f2effa] to-white text-zinc-900">
      <header className="grid grid-cols-[40px_1fr_40px] items-center px-4 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Link href="/map" aria-label="Back"><ChevronLeft size={24} /></Link>
        <h1 className="text-center text-2xl font-bold leading-tight">Choose your map style</h1>
      </header>
      <p className="pb-4 text-center text-sm font-bold tracking-widest text-zinc-600">MAP STYLES</p>

      <motion.div
        className="relative h-[420px] touch-none"
        style={{ perspective: 1000 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragStart={() => (dragging.current = true)}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
      >
        {[-1, 0, 1].map((slot) => (
          <StyleCard key={slot} slot={slot} def={MAP_STYLES[wrap(current + slot)]} t={t}
            isActive={active.key === MAP_STYLES[wrap(current + slot)].key} reduced={reduced}
            onTap={() => { if (!dragging.current && slot !== 0) tapSide(slot as 1 | -1); }} />
        ))}
      </motion.div>

      <div className="mt-2 flex justify-center gap-2">
        {[-1, 0, 1].map((slot) => (
          <span key={slot} className={`h-2 w-2 rounded-full transition-colors ${slot === 0 ? "bg-accent" : "bg-zinc-300"}`} />
        ))}
      </div>

      <div className="mt-5 px-6 text-center">
        <h2 className="text-4xl font-extrabold">{centerDef.name}</h2>
        <p className="mt-1.5 text-lg text-zinc-500">{centerDef.description}</p>
        <button onClick={previewStyle}
          className="mx-auto mt-5 flex h-14 items-center gap-2 rounded-full bg-white px-7 font-semibold text-zinc-900 shadow-lg">
          <MapIcon size={18} /> Preview Style
        </button>
      </div>
    </Screen>
  );
}
