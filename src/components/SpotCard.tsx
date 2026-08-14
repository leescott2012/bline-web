import { MapPin, Heart } from "lucide-react";
import { Link } from "wouter";
import { hasVerifiedRating, type Spot } from "@/lib/data";
import PhotoCarousel from "@/components/PhotoCarousel";
import { useFavorites, toggleFav } from "@/lib/favorites";

// HT badge palette: first badge teal "SOLID"-style, deals magenta
const badgeColor = (b: string, first: boolean) =>
  b === "DEAL" || b === "PERKS" ? "bg-accent" : first ? "bg-brand-blue" : "bg-teal";

export default function SpotCard({ spot, photoClass = "aspect-[488/200]", autoPhotos = false }: { spot: Spot; photoClass?: string; autoPhotos?: boolean }) {
  const favs = useFavorites();
  const saved = favs.includes(spot.id);
  const hasRating = hasVerifiedRating(spot);
  return (
    <Link href={`/spot/${spot.id}`} className="block overflow-hidden rounded-2xl bg-card">
      <div className={`relative ${photoClass}`}>
        <PhotoCarousel imgs={spot.imgs} alt={spot.name} auto={autoPhotos} className="h-full w-full" />
        <button aria-label={saved ? "Remove from saved" : "Save"} aria-pressed={saved}
          onClick={(e) => { e.preventDefault(); toggleFav(spot.id); }}
          className="absolute right-3 top-3 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          <Heart size={22} strokeWidth={1.8} className={saved ? "text-hot" : ""} fill={saved ? "currentColor" : "none"} />
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
            <MapPin size={13} /> On the BeltLine · {spot.area}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {hasRating ? (
            <>
              <p className="text-[26px] font-bold leading-none text-hot">{spot.rating}</p>
              <p className="mt-1.5 text-[13px] text-zinc-400">{spot.ratings} ratings</p>
            </>
          ) : (
            <p className="text-[13px] text-zinc-400">Rating unavailable</p>
          )}
          <p className={`${hasRating ? "mt-0.5" : "mt-1.5"} text-[13px] text-zinc-400 underline`}>Open till {spot.openTill}</p>
        </div>
      </div>
    </Link>
  );
}
