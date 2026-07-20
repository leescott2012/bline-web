import { ThumbsUp, Heart } from "lucide-react";
import { Link } from "wouter";
import type { Spot } from "@/lib/data";
import PhotoCarousel from "@/components/PhotoCarousel";

// HT badge palette: first badge teal "SOLID"-style, deals magenta
const badgeColor = (b: string, first: boolean) =>
  b === "DEAL" || b === "PERKS" ? "bg-accent" : first ? "bg-[#0d7d84]" : "bg-[#7c3aed]";

export default function SpotCard({ spot, photoH = "h-56", autoPhotos = false }: { spot: Spot; photoH?: string; autoPhotos?: boolean }) {
  return (
    <Link href={`/spot/${spot.id}`} className="block overflow-hidden rounded-2xl bg-card">
      <div className={`relative ${photoH}`}>
        <PhotoCarousel imgs={spot.imgs} alt={spot.name} auto={autoPhotos} className="h-full w-full" />
        <button aria-label="Save" onClick={(e) => e.preventDefault()}
          className="absolute right-3 top-3 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          <Heart size={30} strokeWidth={1.8} />
        </button>
        <div className="absolute inset-x-3 bottom-3 flex justify-between">
          {spot.badges.map((b, idx) => (
            <span key={b} className={`rounded ${badgeColor(b, idx === 0)} px-2.5 py-1 text-xs font-bold tracking-wide text-white`}>
              {b}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="text-[22px] font-bold leading-tight">{spot.name}</h3>
          <p className="mt-2 flex items-center gap-2 text-[15px] text-zinc-300">
            <ThumbsUp size={15} /> {spot.loved}% | {spot.area}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[26px] font-bold leading-none">
            <span className="mr-1.5 font-semibold text-zinc-400 line-through decoration-2">${spot.wasPrice}</span>
            <span className="text-hot">${spot.price}</span>
          </p>
          <p className="mt-1.5 text-[15px] text-zinc-400">per night</p>
          <p className="mt-1 text-[15px] text-zinc-400 underline">Includes all fees</p>
        </div>
      </div>
    </Link>
  );
}
