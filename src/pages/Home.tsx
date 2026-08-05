import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X, SearchX, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import maplibregl from "maplibre-gl";
import Screen from "@/components/Screen";
import RealMap from "@/components/RealMap";
import SpotCard from "@/components/SpotCard";
import { useSpots } from "@/lib/spots";
import { useExploreFilters, applyFilters, setQuery, setSort, type SortKey } from "@/lib/exploreFilters";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "rating", label: "Highest rated" },
  { key: "nearest", label: "Nearest" },
];

// Explore: map locked behind; sheet swipes between full list and single-card
// mode. In card mode the map pans to the active card's spot.
export default function Home() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"list" | "cards">("list");
  const [hdr, setHdr] = useState(1);
  const [activeIdx, setActiveIdx] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const activeRef = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const spots = useSpots();
  const filters = useExploreFilters();
  const filtered = useMemo(() => applyFilters(spots, filters), [spots, filters]);

  const activeMarker = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // filters/search changed the visible list — snap back to its first card so
  // activeIdx/flyTo/onCardScroll never index past the end of `filtered`.
  useEffect(() => {
    activeRef.current = 0;
    setActiveIdx(0);
    if (mode === "cards" && filtered.length) flyTo(0);
    else if (!filtered.length) activeMarker.current?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  const flyTo = (i: number) => {
    const map = mapRef.current;
    const s = filtered[i];
    if (!map || !s) return;
    map.easeTo({ center: [s.lng, s.lat], zoom: 13.6, duration: 700 });
    // white "active" pin, HT-style
    if (!activeMarker.current) {
      const d = document.createElement("div");
      d.innerHTML = `<div class="bline-pin bline-pin-active"><span class="star">★</span> <b></b></div>`;
      activeMarker.current = new maplibregl.Marker({ element: d, anchor: "bottom" });
    }
    activeMarker.current.getElement().querySelector("b")!.textContent = s.rating.toFixed(1);
    activeMarker.current.setLngLat([s.lng, s.lat]).addTo(map);
  };

  const onCardScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!filtered.length) return;
    const el = e.currentTarget;
    const i = Math.max(0, Math.min(filtered.length - 1, Math.round(el.scrollLeft / (el.clientWidth * 0.86))));
    if (i !== activeRef.current) {
      activeRef.current = i;
      setActiveIdx(i);
      flyTo(i);
    }
  };

  const setSheet = (m: "list" | "cards") => {
    setMode(m);
    setHdr(1);
    if (m === "cards") flyTo(activeRef.current);
    else activeMarker.current?.remove();
  };

  // pull DOWN on the list (while scrolled to the top) → single-card mode
  const pullY = useRef<number | null>(null);
  const onListTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    pullY.current = e.currentTarget.scrollTop <= 0 ? e.touches[0].clientY : null;
  };
  const onListTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (pullY.current == null) return;
    if (e.touches[0].clientY - pullY.current > 48) {
      pullY.current = null;
      setSheet("cards");
    }
  };

  return (
    <Screen className="overflow-hidden">
      {/* tapping the background map switches to the dedicated Map tab, same as
          swiping down on a single card below -- one "go full map" gesture */}
      <div onClick={() => setLocation("/map")} className="absolute inset-0">
        {/* Wider than the Map tab on purpose: this is the backdrop behind the card
            list, so it wants the whole corridor in frame rather than a
            neighbourhood. autoPitch off keeps it flat -- a tilted backdrop
            fights the cards sitting on top of it. */}
        <RealMap zoom={12.1} autoPitch={false} onMap={(m) => (mapRef.current = m)} className="h-full w-full" />
      </div>

      {/* header fixed over the map; fades + lifts away as the list scrolls up.
          z-20 (not z-10) so it stays clickable above the list/cards sheet,
          which shares z-10 and would otherwise win hit-testing by DOM order. */}
      <header
        className="absolute inset-x-3 top-[max(0.5rem,env(safe-area-inset-top))] z-20 overflow-hidden rounded-2xl bg-[#0e0e12]/95 shadow-2xl backdrop-blur transition-none"
        style={{ opacity: hdr, transform: `translateY(${(hdr - 1) * 16}px)`, pointerEvents: hdr < 0.1 ? "none" : "auto" }}
      >
        <div className="flex items-center gap-2 px-4 pb-2 pt-3">
          <button
            aria-label={searchOpen ? "Close search" : "Search"}
            onClick={() => { if (searchOpen) setQuery(""); setSearchOpen((v) => !v); }}
            className="shrink-0 text-white"
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          {searchOpen ? (
            <input
              ref={searchRef}
              value={filters.query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search spots or categories"
              aria-label="Search spots"
              className="flex-1 bg-transparent text-[16px] text-white placeholder:text-zinc-500 outline-none"
            />
          ) : (
            <Link href="/filters" className="flex flex-1 items-center justify-around text-center">
              <div>
                <p className="text-[11px] text-zinc-400">Where</p>
                <p className="text-[16px] font-semibold leading-tight truncate max-w-[100px]">
                  {filters.category || "All Trails"}
                </p>
              </div>
              <div className="h-8 w-px bg-line" />
              <div>
                <p className="text-[11px] text-zinc-400">When</p>
                <p className="text-[16px] font-semibold leading-tight">
                  {filters.openNow ? "Open now" : "Anytime"}
                </p>
              </div>
            </Link>
          )}
          <Link href="/filters" aria-label="Filters"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-zinc-600">
            <SlidersHorizontal size={16} />
          </Link>
        </div>
        <div className="flex border-t border-white/10 bg-[#17171d]/70">
          <button className="flex-1 py-2 text-center text-[14px] font-medium text-zinc-100">
            Within a 10-min walk ▾
          </button>
          <div className="relative flex-1">
            <button
              onClick={() => setSortOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              className="flex w-full items-center justify-center gap-1.5 border-l border-zinc-700/60 py-2 text-center text-[14px] font-medium text-zinc-100"
            >
              <ArrowUpDown size={13} /> {SORTS.find((s) => s.key === filters.sort)?.label}
            </button>
            {sortOpen && (
              <div role="listbox" className="absolute inset-x-2 top-full z-20 mt-1 overflow-hidden rounded-xl bg-[#17171d] shadow-lg">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    role="option"
                    aria-selected={s.key === filters.sort}
                    onClick={() => { setSort(s.key); setSortOpen(false); }}
                    className={`block w-full px-4 py-2.5 text-left text-[14px] ${s.key === filters.sort ? "bg-accent font-semibold" : "text-zinc-200"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* bottom stack: sheet + banner + tabs */}
      {filtered.length === 0 ? (
        <div className="no-scrollbar absolute inset-0 z-10 overflow-y-auto overscroll-contain">
          <div className="h-[44vh] shrink-0" />
          <div className="min-h-full rounded-t-2xl bg-ink px-4 pb-40 pt-6">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-panel px-6 py-10 text-center text-zinc-400">
              <SearchX size={32} />
              <p>No spots match.<br />Try a different search or filter.</p>
            </div>
          </div>
        </div>
      ) : mode === "list" ? (
        /* LIST MODE — cards rest low so the map breathes, then scroll up over it */
        <div
          className="no-scrollbar absolute inset-0 z-10 overflow-y-auto overscroll-contain"
          onScroll={(e) => { const p = Math.min(e.currentTarget.scrollTop / 140, 1); setHdr(1 - p); }}
          onTouchStart={onListTouchStart}
          onTouchMove={onListTouchMove}
        >
          {/* transparent spacer keeps the map open above the first card (HT-style);
              also doubles as the tap target for "tap the map -> Map tab" since it's
              the topmost element over the visible map in list mode */}
          <div className="h-[44vh] shrink-0" onClick={() => setLocation("/map")} />
          <div className="min-h-full space-y-2.5 rounded-t-2xl bg-ink px-2 pb-40 pt-1">
            <button className="flex w-full cursor-grab justify-center py-1.5" onClick={() => setSheet("cards")} aria-label="Single-card view">
              <span className="h-1.5 w-12 rounded-full bg-zinc-500" />
            </button>
            {filtered.map((s) => (
              <SpotCard key={s.id} spot={s} />
            ))}
          </div>
        </div>
      ) : (
        /* CARD MODE — one card at a time, map pans to the active pin */
        <div className="absolute inset-x-0 bottom-0 z-10 pb-[92px]">
          <motion.div
            className="flex h-9 cursor-grab touch-none select-none items-center justify-center"
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.y < -24 || info.velocity.y < -250) setSheet("list");
              else if (info.offset.y > 24 || info.velocity.y > 250) setLocation("/map");
            }}
            onClick={() => setSheet("list")}
          >
            <span className="h-1.5 w-12 rounded-full bg-white/70 shadow" />
          </motion.div>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-3"
            onScroll={onCardScroll}>
            {filtered.map((s, i) => (
              <div key={s.id} className="w-[86%] shrink-0 snap-center">
                <SpotCard spot={s} photoClass="aspect-[2/1]" autoPhotos={i === activeIdx} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* fixed bottom chrome */}
    </Screen>
  );
}
