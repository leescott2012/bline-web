import { ThumbsUp, Heart } from "lucide-react";
import { Link } from "wouter";
import type { Spot } from "@/lib/data";
import PhotoCarousel from "@/components/PhotoCarousel";

const badgeColor = (b: string) =>
  b === "DEAL" || b === "PERKS" ? "bg-accent" : "bg-[#7c3aed]";

export default function SpotCard({ spot }: { spot: Spot }) {
  return (
    <Link href={`/spot/${spot.id}`} className="block overflow-hidden rounded-2xl bg-card">
      <div className="relative h-48">
        <PhotoCarousel imgs={spot.imgs} alt={spot.name} className="h-full w-full" />
        <button
          aria-label="Save"
          className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white"
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={18} />
        </button>
        <div className="absolute inset-x-3 bottom-3 flex justify-between">
          {spot.badges.map((b) => (
            <span key={b} className={`rounded ${badgeColor(b)} px-2 py-1 text-[10px] font-bold tracking-wide text-white`}>
              {b}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-start justify-between p-4">
        <div>
          <h3 className="text-lg font-bold">{spot.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
            <ThumbsUp size={14} /> {spot.loved}% · {spot.area}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">{spot.ratings} ratings</p>
          <p className="text-3xl font-bold text-hot">{spot.rating}</p>
          <p className="text-xs text-zinc-400 underline">Open till {spot.openTill}</p>
        </div>
      </div>
    </Link>
  );
}
