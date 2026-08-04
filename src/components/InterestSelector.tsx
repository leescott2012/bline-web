import { useState } from "react";
import { SlidersHorizontal, UtensilsCrossed, Trees, Palette, Footprints, X } from "lucide-react";
import { INTERESTS, useMapInterests, toggleInterest, interestOf, type Interest } from "@/lib/mapInterests";
import { useSpots } from "@/lib/spots";

// Filter chip for the map. It shipped as a 224px panel pinned open over the
// left half of the map, which drew two separate "maps tab is cluttered"
// reports -- on a screen whose entire job is the map. It's now a chip that
// opens a sheet, and closes again.
//
// Icons are lucide, not emoji: the rest of the app is lucide, and emoji
// silently degrade to tofu wherever the emoji font is missing (the iOS
// simulator runtime has no AppleColorEmoji, which is why these rendered as
// "?" boxes in QC).
const ICON: Record<Interest, typeof Trees> = {
  dining: UtensilsCrossed,
  parks: Trees,
  art: Palette,
  "trail-access": Footprints,
};

export default function InterestSelector() {
  const interests = useMapInterests();
  const spots = useSpots();
  // Offer only interests that actually match a spot. "Public Art" and "Trail
  // Access" match nothing in the current dataset, and a filter that can only
  // ever return an empty map is worse than no filter.
  const available = (Object.keys(INTERESTS) as Interest[]).filter((id) =>
    spots.some((s) => interestOf(s.category) === id));
  const [open, setOpen] = useState(false);
  const activeCount = Object.values(interests).filter(Boolean).length;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Filter map by interest"
        className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex items-center gap-2 rounded-full bg-[#101014]/90 px-3.5 py-2.5 text-[14px] font-semibold text-white shadow-lg backdrop-blur"
      >
        <SlidersHorizontal size={16} />
        {activeCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold">
            {activeCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="absolute left-3 right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 overflow-hidden rounded-2xl bg-[#101014]/95 shadow-xl backdrop-blur">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Show on map</p>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            {activeCount} of {available.length} selected
          </p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close filters"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2">
        {available.map((id) => {
          const def = INTERESTS[id];
          const Icon = ICON[id] ?? Trees;
          const isActive = interests[id];
          return (
            <button
              key={id}
              onClick={() => toggleInterest(id)}
              aria-pressed={isActive}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-left transition-colors ${
                isActive ? "bg-accent/25 text-white ring-1 ring-accent" : "bg-white/5 text-zinc-400"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <p className="min-w-0 truncate text-[14px] font-semibold">{def.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
