import { ChevronLeft, Share, Heart, Star, ChevronRight } from "lucide-react";
import { Link, useParams } from "wouter";
import Screen from "@/components/Screen";
import { spots, menuPicks } from "@/lib/data";
import PhotoCarousel from "@/components/PhotoCarousel";
import { useFavorites, toggleFav } from "@/lib/favorites";

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const spot = spots.find((s) => s.id === id) ?? spots[0];
  const saved = useFavorites().includes(spot.id);
  return (
    <Screen className="pb-28">
      <div className="relative h-80">
        <PhotoCarousel imgs={[...spot.imgs].reverse()} alt={spot.name} auto className="h-full w-full" />
        <Link href="/" aria-label="Back"
          className="absolute left-4 top-4 grid size-11 place-items-center rounded-full bg-black/50 text-white">
          <ChevronLeft size={22} />
        </Link>
        <div className="absolute right-4 top-4 flex gap-2">
          <button aria-label="Share" className="grid size-11 place-items-center rounded-full bg-black/50"><Share size={18} /></button>
          <button aria-label={saved ? "Remove from saved" : "Save"} aria-pressed={saved}
            onClick={() => toggleFav(spot.id)}
            className="grid size-11 place-items-center rounded-full bg-black/50">
            <Heart size={18} className={saved ? "text-hot" : "text-white"} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-2">
          <span className="rounded bg-[#7c3aed] px-2 py-1 text-[11px] font-bold text-white">TRAIL PICK</span>
          <span className="rounded bg-accent px-2 py-1 text-[11px] font-bold text-white">DEAL</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold">{spot.name}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-[15px] text-zinc-400">
          <Star size={16} fill="currentColor" className="text-zinc-300" />
          <span className="text-zinc-200">{spot.rating}</span> · {spot.ratings} ratings · {spot.category}
        </p>

        <button className="mt-4 flex w-full items-center justify-between rounded-2xl border border-line px-4 py-3 text-left text-[15px] whitespace-nowrap">
          <span><span className="font-semibold text-mint">Open now</span> · Closes 12:00 AM</span>
          <span className="flex items-center gap-1 text-zinc-400">{spot.address} <ChevronRight size={14} /></span>
        </button>

        <Link href="/trail" className="mt-6 flex items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#2a2440]">
            <svg viewBox="0 0 40 40" className="h-full w-full">
              <rect width="40" height="40" fill="#252036" />
              <rect x="2" y="4" width="10" height="8" fill="#3d3357" /><rect x="16" y="2" width="9" height="10" fill="#3d3357" />
              <rect x="28" y="6" width="9" height="12" fill="#3d3357" /><rect x="4" y="24" width="12" height="10" fill="#1e3229" />
              <path d="M4 34 C 14 26, 18 18, 34 6" stroke="#c026d3" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">On the trail</h2>
            <p className="mt-1 text-[15px] text-zinc-400">{spot.walk} · Eastside Trail</p>
          </div>
        </Link>

        <h2 className="mt-8 text-xl font-bold">Menu picks</h2>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4">
          {menuPicks.map((m) => (
            <figure key={m.name} className="w-40 shrink-0">
              <img src={m.img} alt={m.name} className="h-32 w-full rounded-xl object-cover" loading="lazy" />
              <figcaption className="mt-2 text-sm">{m.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 bg-gradient-to-t from-ink via-ink/95 to-transparent p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Link href={`/reserve/${spot.id}`}
          className="block w-full rounded-full bg-[#5b2a86] py-4 text-center text-lg font-semibold">
          Reserve a table
        </Link>
      </div>
    </Screen>
  );
}
