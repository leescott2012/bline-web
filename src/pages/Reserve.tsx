import { ChevronLeft, ExternalLink, Star } from "lucide-react";
import { Link, useParams } from "wouter";
import Screen from "@/components/Screen";
import { getBookingProvider, hasVerifiedRating } from "@/lib/data";
import { useSpots } from "@/lib/spots";
import { openExternalLink } from "@/lib/external";

/**
 * This route is intentionally a provider handoff, not an internal reservation
 * form. Restaurant inventory and confirmation remain with the provider that
 * serves the venue, preventing B-line from creating a misleading local booking.
 */
export default function Reserve() {
  const { id } = useParams<{ id: string }>();
  const spots = useSpots();
  const spot = spots.find((s) => s.id === id) ?? spots[0];
  const bookingProvider = getBookingProvider(spot);
  const hasRating = hasVerifiedRating(spot);

  return (
    <Screen className="pb-12">
      <header className="relative flex items-center justify-center px-4 py-5">
        <Link href={`/spot/${spot.id}`} aria-label="Back" className="absolute left-4">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Book a table</h1>
      </header>

      <div className="flex items-center gap-4 border-y border-line px-4 py-4">
        <img src={spot.img} alt="" className="size-20 rounded-xl object-cover" />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{spot.name}</h2>
          <p className="mt-1 flex items-center gap-1 text-zinc-400">
            {hasRating && <><Star size={14} fill="currentColor" /> {spot.rating} ·</>} {spot.category}
          </p>
        </div>
      </div>

      {bookingProvider && spot.reservation_link ? (
        <main className="px-4 pt-8">
          <section className="rounded-3xl border border-line bg-panel p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">Live restaurant availability</p>
            <h2 className="mt-3 text-2xl font-bold">Continue to {bookingProvider}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
              {bookingProvider} shows the restaurant&apos;s current table availability and sends the final confirmation directly.
            </p>
            <a
              href={spot.reservation_link}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => { void openExternalLink(event, spot.reservation_link!); }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-teal py-4 text-base font-semibold text-on-brand"
            >
              View live times on {bookingProvider} <ExternalLink size={18} aria-hidden="true" />
            </a>
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              You&apos;ll leave B-line to complete your reservation with {bookingProvider}.
            </p>
          </section>
        </main>
      ) : (
        <main className="px-4 pt-8">
          <section className="rounded-3xl border border-line bg-panel p-6 text-center">
            <h2 className="text-2xl font-bold">Online booking isn&apos;t available here yet</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
              B-line only links to a restaurant&apos;s verified booking provider. We don&apos;t show local time slots when live availability has not been confirmed.
            </p>
            <Link
              href={`/navigate/${spot.id}`}
              className="mt-6 block w-full rounded-full border border-line py-4 text-center text-base font-semibold"
            >
              Get directions
            </Link>
          </section>
        </main>
      )}
    </Screen>
  );
}
