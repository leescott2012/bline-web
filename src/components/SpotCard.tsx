import { ThumbsUp, Heart } from "lucide-react";
import { Link } from "wouter";
import type { Spot } from "@/lib/data";
import PhotoCarousel from "@/components/PhotoCarousel";

// HT badge palette: first badge teal "SOLID"-style, deals magenta
const badgeColor = (b: string, first: boolean) =>
  b === "DEAL" || b === "PERKS" ? "bg-accent" : first ? "bg-[#0d7d84]" : "bg-[#7c3aed]";

export default function SpotCard({ spot, photoClass = "aspect-[386/220]", autoPhotos = false }: { spot: Spot; photoClass?: string; autoPhotos?: boolean }) {
  return (
    <Link href={`/spot/${spot.id}`} className="block overflow-hidden bg-card">
      <div className={`relative ${photoClass}`}>
        <PhotoCarousel imgs={spot.imgs} alt={spot.name} auto={autoPhotos} className="h-full w-full" />
        <button aria-label="Save" onClick={(e) => e.preventDefault()}
          className="absolute right-3 top-3 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          <Heart size={22} strokeWidth={1.8} />
        </button>
        <div className="absolute inset-x-3 bottom-3 flex justify-between">
          {spot.badges.map((b, idx) => (
            <span key={b} className={`${badgeColor(b, idx === 0)} px-2 py-1 text-[10px] font-bold tracking-wide text-white`}>
              {b}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 px-3.5 py-3">
        <div className="min-w-0">
          <h3 className="text-[18px] font-bold leading-tight">{spot.name}</h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-zinc-300">
            <ThumbsUp size={13} /> {spot.loved}% | {spot.area}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[28px] font-bold leading-none">
            <span className="mr-1 text-[15px] font-semibold text-zinc-400 line-through decoration-2">${spot.wasPrice}</span>
            <span className="text-hot">${spot.price}</span>
          </p>
          <p className="mt-1 text-[13px] text-zinc-400">per night</p>
          <p className="mt-0.5 text-[13px] text-zinc-400 underline">Includes all fees</p>
        </div>
      </div>
    </Link>
  );
}
