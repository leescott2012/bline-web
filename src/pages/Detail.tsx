import { useState } from "react";
import { ChevronLeft, Share, Heart, Star, ChevronRight, ExternalLink, Store } from "lucide-react";
import { Link, useParams } from "wouter";
import Screen from "@/components/Screen";
import { getBookingProvider, hasVerifiedRating, isOpenNow, closingTimeLabel } from "@/lib/data";
import { useSpots } from "@/lib/spots";
import { RICH_DATA } from "@/lib/richData";
import PhotoCarousel from "@/components/PhotoCarousel";
import TellUsSheet from "@/components/TellUsSheet";
import { useFavorites, toggleFav } from "@/lib/favorites";
import { openExternalLink } from "@/lib/external";

async function shareSpot(name: string) {
  const data = { title: name, text: `Check out ${name} on B-line`, url: location.href };
  try {
    if (navigator.share) await navigator.share(data);
    else await navigator.clipboard.writeText(data.url);
  } catch { /* share cancelled or clipboard unavailable — no-op */ }
}

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const spots = useSpots();
  const spot = spots.find((s) => s.id === id) ?? spots[0];
  const saved = useFavorites().includes(spot.id);
  const hasRating = hasVerifiedRating(spot);
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name}, ${spot.address}, Atlanta, GA`)}`;
  const bookingProvider = getBookingProvider(spot);
  const [claiming, setClaiming] = useState(false);
  // A park or a mural has no owner to claim it, so don't offer.
  const isBusiness = !/^park|public art|trail access/i.test(spot.category);
  return (
    <Screen className="pb-28">
      <div className="relative h-80">
        <PhotoCarousel imgs={[...spot.imgs].reverse()} alt={spot.name} auto className="h-full w-full" />
        <Link href="/" aria-label="Back"
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] grid size-11 place-items-center rounded-full bg-black/50 text-white">
          <ChevronLeft size={22} />
        </Link>
        <div className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] flex gap-2">
          <button aria-label="Share" onClick={() => shareSpot(spot.name)} className="grid size-11 place-items-center rounded-full bg-black/50"><Share size={18} /></button>
          <button aria-label={saved ? "Remove from saved" : "Save"} aria-pressed={saved}
            onClick={() => toggleFav(spot.id)}
            className="grid size-11 place-items-center rounded-full bg-black/50">
            <Heart size={18} className={saved ? "text-hot" : "text-white"} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {spot.badges.length > 0 && (
          <div className="flex gap-2">
            {spot.badges.map((b) => (
              <span key={b} className={`rounded px-2 py-1 text-[11px] font-bold text-on-brand ${b === "DEAL" ? "bg-accent" : "bg-teal"}`}>
                {b}
              </span>
            ))}
          </div>
        )}
        <h1 className="mt-3 text-3xl font-bold">{spot.name}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-[15px] text-zinc-400">
          {hasRating && (
            <>
              <Star size={16} fill="currentColor" className="text-zinc-300" />
              <span className="text-zinc-200">{spot.rating}</span> · {spot.ratings} ratings ·
            </>
          )}
          {spot.category}
        </p>

        <a
          href={mapSearchUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${spot.name} in maps`}
          onClick={(event) => { void openExternalLink(event, mapSearchUrl); }}
          className="mt-4 flex w-full items-center justify-between gap-2 rounded-2xl border border-line px-4 py-3 text-left text-[15px]"
        >
          <span className="shrink-0 whitespace-nowrap">
            {isOpenNow(spot) ? <span className="font-semibold text-mint">Open now</span> : <span className="font-semibold text-alert">Closed</span>}
            {" "}· Closes {closingTimeLabel(spot.openTill)}
          </span>
          <span className="flex min-w-0 items-center gap-1 text-zinc-400">
            <span className="truncate">{spot.address}</span>
            <ChevronRight size={14} className="shrink-0" />
          </span>
        </a>

        <Link href="/trail" className="mt-6 flex items-center gap-4">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-panel">
            <svg viewBox="0 0 40 40" className="h-full w-full">
              <rect width="40" height="40" fill="#16161b" />
              <rect x="2" y="4" width="10" height="8" fill="#2a2a33" /><rect x="16" y="2" width="9" height="10" fill="#2a2a33" />
              <rect x="28" y="6" width="9" height="12" fill="#2a2a33" /><rect x="4" y="24" width="12" height="10" fill="#0f2418" />
              <path d="M4 34 C 14 26, 18 18, 34 6" stroke="#60bb46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold">On the trail</h2>
            <p className="mt-1 text-[15px] text-zinc-400">{spot.walk} · Eastside Trail</p>
          </div>
        </Link>

        {/* "Menu picks" removed. `menuPicks` is a single shared list, so every
            venue that showed it advertised the same wood-fired pizza and New
            Realm Burger -- a juice bar included. Gating it by category only
            reduced how many places it misrepresented. Bring it back when spots
            carry their own menu data. */}
      </div>

      <div className="sticky bottom-0 z-20 flex gap-2 bg-gradient-to-t from-ink via-ink/95 to-transparent p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Link href={`/navigate/${spot.id}`}
          className="block flex-1 rounded-full border border-line py-4 text-center text-lg font-semibold">
          Directions
        </Link>
        {bookingProvider && spot.reservation_link && (
          <a
            href={spot.reservation_link}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => { void openExternalLink(event, spot.reservation_link!); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-teal py-4 text-center text-lg font-semibold"
          >
            Book on {bookingProvider} <ExternalLink size={17} aria-hidden="true" />
          </a>
        )}
      </div>

      {RICH_DATA[spot.id] && (
        <div className="px-4 pb-12">
          <div className="mt-8 rounded-2xl bg-panel p-5">
            <h2 className="text-xl font-bold">The Vibe</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">
              {RICH_DATA[spot.id].overview}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-bold">Why Visit</h2>
            <ul className="mt-3 space-y-2">
              {RICH_DATA[spot.id].whyVisit.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-[15px] text-zinc-300">
                  <div className="size-1.5 rounded-full bg-hot" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold">Insider Tips</h2>
            <div className="mt-3 space-y-3">
              {RICH_DATA[spot.id].insiderTips.map((tip, i) => (
                <div key={i} className="rounded-xl border border-line bg-ink p-4 text-[14px] italic text-zinc-400">
                  "{tip}"
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold">Nearby Walking Times</h2>
            <div className="mt-3 divide-y divide-line rounded-xl border border-line">
              {Object.entries(RICH_DATA[spot.id].walkingTimes).map(([place, time]) => (
                <div key={place} className="flex justify-between p-3.5 text-[15px]">
                  <span className="text-zinc-300">{place}</span>
                  <span className="font-semibold text-hot">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isBusiness && (
        <div className="px-4 pb-10">
          <button
            onClick={() => setClaiming(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-4 text-left"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-hot/15 text-hot">
              <Store size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">Is this your business?</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-zinc-400">
                Reach out and we'll get your hours, photos and details right.
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-zinc-500" />
          </button>
        </div>
      )}

      <TellUsSheet
        open={claiming}
        onClose={() => setClaiming(false)}
        title={`Claim ${spot.name}`}
        blurb="Tell us who you are and what we've got wrong — hours, photos, menu, anything."
        placeholder="I'm the owner/manager of this spot and…"
        source="claim-business"
        context={{ spotId: spot.id, spotName: spot.name, address: spot.address }}
      />
    </Screen>
  );
}
