import { useRef, useState } from "react";
import { Search, SlidersHorizontal, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import maplibregl from "maplibre-gl";
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

  const activeMarker = useRef<maplibregl.Marker | null>(null);

  const flyTo = (i: number) => {
    const map = mapRef.current;
    if (!map) return;
    const s = spots[i];
    map.easeTo({ center: [s.lng, s.lat], zoom: 13.6, duration: 700 });
    // white "active" pin, HT-style
    if (!activeMarker.current) {
      const d = document.createElement("div");
      d.innerHTML = `<div class="bline-pin bline-pin-active"><span class="star">★</span> <b></b></div>`;
      activeMarker.current = new maplibregl.Marker({ element: d, anchor: "bottom" });
    }
    activeMarker.current.getElement().querySelector("b")!.textContent = spots[i].rating.toFixed(1);
    activeMarker.current.setLngLat([s.lng, s.lat]).addTo(map);
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
    else activeMarker.current?.remove();
  };

  return (
    <Screen className="overflow-hidden">
      <RealMap zoom={12.1} onMap={(m) => (mapRef.current = m)} className="absolute inset-0" />

      {/* header stays fixed over the map */}
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="flex items-center gap-2 bg-[#0e0e12] px-4 py-2">
          <Search size={20} className="shrink-0 text-white" />
          <Link href="/filters" className="flex flex-1 items-center justify-around text-center">
            <div>
              <p className="text-[13px] text-zinc-400">Where</p>
              <p className="text-[17px] font-semibold leading-tight">Eastside Trail</p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div>
              <p className="text-[13px] text-zinc-400">When</p>
              <p className="text-[17px] font-semibold leading-tight">Open now</p>
            </div>
          </Link>
          <Link href="/filters" aria-label="Filters"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-zinc-600">
            <SlidersHorizontal size={16} />
          </Link>
        </div>
        <button className="w-full bg-[#17171d]/95 py-2 text-center text-[15px] font-medium text-zinc-100">
          Within a 10-min walk ▾
        </button>
      </header>

      {/* bottom stack: sheet + banner + tabs */}
      {/* LIST MODE — cards rest low so the map breathes, then scroll up over it */}
      {mode === "list" && (
        <div className="no-scrollbar absolute inset-0 z-10 overflow-y-auto overscroll-contain">
          {/* transparent spacer keeps the map open above the first card (HT-style) */}
          <div className="h-[33vh] shrink-0" />
          <div className="min-h-full space-y-3 rounded-t-2xl bg-ink px-2 pb-40 pt-1">
            <div className="flex cursor-grab justify-center py-1.5" onClick={() => setSheet("cards")}>
              <span className="h-1.5 w-12 rounded-full bg-zinc-500" />
            </div>
            {spots.map((s) => (
              <SpotCard key={s.id} spot={s} />
            ))}
          </div>
        </div>
      )}

      {/* CARD MODE — one card at a time, map pans to the active pin */}
      {mode === "cards" && (
        <div className="absolute inset-x-0 bottom-0 z-10 pb-[92px]">
          <motion.div
            className="flex h-9 cursor-grab touch-none select-none items-center justify-center"
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.08}
            onDragEnd={(_, info) => { if (info.offset.y < -24 || info.velocity.y < -250) setSheet("list"); }}
            onClick={() => setSheet("list")}
          >
            <span className="h-1.5 w-12 rounded-full bg-white/70 shadow" />
          </motion.div>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-3"
            onScroll={onCardScroll}>
            {spots.map((s) => (
              <div key={s.id} className="w-[86%] shrink-0 snap-center">
                <SpotCard spot={s} photoH="h-44" autoPhotos />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* fixed bottom chrome */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="flex items-center justify-center gap-2 bg-[#1e3a8a] px-4 py-2.5 text-sm font-medium">
          <Gift size={16} /> New perk: earn trail rewards every check-in
        </div>
        <TabBar />
      </div>
    </Screen>
  );
}
