import { useMemo } from "react";
import { X } from "lucide-react";
import { Link, useLocation } from "wouter";
import Screen from "@/components/Screen";
import DarkMap from "@/components/DarkMap";
import { spots } from "@/lib/data";
import {
  CATEGORIES,
  applyFilters,
  resetFilters,
  setCategory,
  setMaxWalkMinutes,
  setMinRating,
  setOpenNow,
  useExploreFilters,
} from "@/lib/exploreFilters";

const ratingOptions = [
  { label: "4.0+", value: 4.0 },
  { label: "4.5+", value: 4.5 },
  { label: "Any", value: 0 },
];

export default function Filters() {
  const [, nav] = useLocation();
  const filters = useExploreFilters();
  const { category, minRating, maxWalkMinutes, openNow } = filters;
  const count = useMemo(() => applyFilters(spots, filters).length, [filters]);

  return (
    <Screen>
      <DarkMap className="absolute inset-x-0 top-0 h-72 opacity-60" />
      <div className="relative mt-40 rounded-t-3xl bg-panel pb-6">
        <div className="mx-auto mt-2 h-1 w-10 rounded bg-zinc-600" />
        <header className="relative flex items-center justify-center px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <Link href="/" aria-label="Close" className="absolute left-4"><X size={24} /></Link>
          <h1 className="text-2xl font-bold">Filters</h1>
          <button className="absolute right-4 text-zinc-300 underline"
            onClick={resetFilters}>
            Reset
          </button>
        </header>

        <div className="px-4">
          <h2 className="text-xl font-semibold">Category</h2>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(category === c ? null : c)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-lg ${c === category ? "bg-accent font-semibold" : "bg-[#3a3a42]"}`}>
                {c}
              </button>
            ))}
          </div>

          <h2 className="mt-7 text-xl font-semibold">Distance from trail</h2>
          <input type="range" min={2} max={17} value={maxWalkMinutes} onChange={(e) => setMaxWalkMinutes(+e.target.value)}
            className="mt-4 w-full accent-accent" aria-label="Distance from trail" />
          <p className="mt-1 text-zinc-400">Within {maxWalkMinutes}-min walk</p>

          <img src="/photos/ponce-wide.png" alt="" className="mt-5 h-40 w-full rounded-2xl object-cover" loading="lazy" />

          <h2 className="mt-6 text-xl font-semibold">Minimum rating</h2>
          <div className="mt-3 flex overflow-hidden rounded-full bg-[#3a3a42] text-center">
            {ratingOptions.map((r) => (
              <button key={r.label} onClick={() => setMinRating(r.value)}
                className={`flex-1 py-3 text-lg ${r.value === minRating ? "rounded-full bg-accent font-semibold" : ""}`}>
                {r.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xl">Open now</span>
            <button role="switch" aria-checked={openNow} onClick={() => setOpenNow(!openNow)}
              className={`h-8 w-14 rounded-full p-1 transition-colors ${openNow ? "bg-accent" : "bg-zinc-600"}`}>
              <span className={`block size-6 rounded-full bg-white transition-transform ${openNow ? "translate-x-6" : ""}`} />
            </button>
          </div>

          <button onClick={() => nav("/")}
            className="mt-7 w-full rounded-2xl bg-accent py-4 text-lg font-semibold">
            Show {count} spot{count === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </Screen>
  );
}
