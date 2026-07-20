import { useRef, useState } from "react";
import { Search, SlidersHorizontal, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import type maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import RealMap from "@/components/RealMap";
import SpotCard from "@/components/SpotCard";
import { spots } from "@/lib/data";

// Explore: map locked behind; sheet swipes between full list and single-card
// mode. In card mode the map pans to the active card's spot.
export default function Home() {
  const [mode, setMode] = useState<"list" | "cards">("list");
  const mapRef = useRef<maplibregl.Map | null>(null);
  const activeRef = useRef(0);

  const flyTo = (i: number) => {
    const s = spots[i];
    mapRef.current?.easeTo({ center: [s.lng, s.lat], zoom: 13.6, duration: 700 });
  };

  const onCardScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const i = Math.max(0, Math.min(spots.length - 1, Math.round(el.scrollLeft / (el.clientWidth * 0.86))));
    if (i !== activeRef.current) {
      activeRef.current = i;
      flyTo(i);
    }
  };

  const setSheet = (m: "list" | "cards") => {
    setMode(m);
    if (m === "cards") flyTo(activeRef.current);
  };

  return (
    <Screen className="overflow-hidden">
      <RealMap zoom={12.1} onMap={(m) => (mapRef.current = m)} className="absolute inset-0" />

      {/* header stays fixed over the map */}
      <header className="absolute inset-x-0 top-0 z-10 m-2 rounded-2xl bg-[#101014]/95 p-3 shadow-lg backdrop-blur">
        <div className="flex items-center gap-3">
          <Search size={20} className="shrink-0 text-white" />
          <Link href="/filters" className="flex flex-1 items-stretch justify-around text-left">
            <div>
              <p className="text-xs text-zinc-400">Where —</p>
              <p className="text-lg font-semibold">Eastside Trail</p>
            </div>
            <div className="w-px bg-line" />
            <div>
              <p className="text-xs text-zinc-400">When —</p>
              <p className="text-lg font-semibold">Open now</p>
            </div>
          </Link>
          <Link href="/filters" aria-label="Filters"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-panel">
            <SlidersHorizontal size={18} />
          </Link>
        </div>
        <div className="mt-2.5 flex justify-center">
          <button className="rounded-full border border-zinc-600 px-5 py-1 text-sm text-zinc-200">
            Within a 10-min walk
          </button>
        </div>
      </header>

      {/* bottom stack: sheet + banner + tabs */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex max-h-full flex-col justify-end">
        {/* grab handle — swipe up for list, down for single cards */}
        <motion.div
          className="flex h-10 cursor-grab touch-none select-none items-center justify-center"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (info.offset.y > 24 || info.velocity.y > 250) setSheet("cards");
            else if (info.offset.y < -24 || info.velocity.y < -250) setSheet("list");
          }}
          onClick={() => setSheet(mode === "list" ? "cards" : "list")}
        >
          <span className="h-1.5 w-12 rounded-full bg-white/70 shadow" />
        </motion.div>

        {mode === "list" ? (
          <div className="max-h-[62vh] space-y-4 overflow-y-auto px-3 pb-3">
            {spots.map((s) => (
              <SpotCard key={s.id} spot={s} />
            ))}
          </div>
        ) : (
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-3"
            onScroll={onCardScroll}>
            {spots.map((s) => (
              <div key={s.id} className="w-[86%] shrink-0 snap-center">
                <SpotCard spot={s} photoH="h-44" />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 bg-[#1e3a8a] px-4 py-2.5 text-sm font-medium">
          <Gift size={16} /> New perk: earn trail rewards every check-in
        </div>
        <TabBar />
      </div>
    </Screen>
  );
}
