import { useState } from "react";
import { ChevronLeft, Minus, Plus, Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Link, useParams } from "wouter";
import Screen from "@/components/Screen";
import { useSpots } from "@/lib/spots";
import { useAuth } from "@/lib/auth";

// Days relative to today — computed at render time so they're always current.
function buildDays(): { label: string; iso: string }[] {
  const days: { label: string; iso: string }[] = [];
  const now = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 4; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const label =
      i === 0
        ? "Today"
        : `${dayNames[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
    days.push({ label, iso: d.toISOString().slice(0, 10) });
  }
  return days;
}

const TIMES = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"];

type ReservationState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "confirmed"; id: string; time: string; day: string }
  | { phase: "error"; message: string };

async function submitReservation(payload: {
  spotId: string;
  spotName: string;
  guests: number;
  dayLabel: string;
  timeLabel: string;
  userId?: string; // passed when the user is signed in — stored as user_id in Supabase
}): Promise<{ id: string }> {
  const res = await fetch("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Server error ${res.status}`);
  }
  return res.json();
}

export default function Reserve() {
  const { id } = useParams<{ id: string }>();
  const spots = useSpots();
  const spot = spots.find((s) => s.id === id) ?? spots[0];
  const { user } = useAuth();



  const days = buildDays();
  const [guests, setGuests] = useState(2);
  const [dayIdx, setDayIdx] = useState(0);
  const [time, setTime] = useState("7:00 PM");
  const [state, setState] = useState<ReservationState>({ phase: "idle" });

  const handleConfirm = async () => {
    if (state.phase === "submitting" || state.phase === "confirmed") return;
    setState({ phase: "submitting" });
    try {
      const result = await submitReservation({
        spotId: spot.id,
        spotName: spot.name,
        guests,
        dayLabel: days[dayIdx].label,
        timeLabel: time,
        // Link the reservation to the signed-in user so it shows up in their
        // Profile → My Reservations list. Omitted for anonymous bookings.
        ...(user ? { userId: user.id } : {}),
      });
      setState({
        phase: "confirmed",
        id: result.id,
        time,
        day: days[dayIdx].label,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setState({ phase: "error", message: msg });
    }
  };

  // ── Confirmed state ──────────────────────────────────────────────────────
  if (state.phase === "confirmed") {
    return (
      <Screen className="flex flex-col items-center justify-center gap-6 px-8 text-center">
        <CheckCircle2 size={64} className="text-mint" />
        <div>
          <h1 className="text-2xl font-bold">You&apos;re booked!</h1>
          <p className="mt-2 text-zinc-400">
            {spot.name} · {state.day} · {state.time} · {guests}{" "}
            {guests === 1 ? "guest" : "guests"}
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-600">#{state.id.slice(0, 8)}</p>
        </div>
        <Link
          href={`/spot/${spot.id}`}
          className="mt-4 w-full rounded-full bg-teal py-3.5 text-center text-base font-semibold"
        >
          Back to {spot.name}
        </Link>
        <Link href="/" className="text-sm text-zinc-500 underline">
          Back to Explore
        </Link>
      </Screen>
    );
  }

  // ── Main reserve form ────────────────────────────────────────────────────
  return (
    <Screen className="pb-32">
      <header className="relative flex items-center justify-center px-4 py-5">
        <Link href={`/spot/${spot.id}`} aria-label="Back" className="absolute left-4">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Reserve a table</h1>
      </header>

      <div className="flex items-center gap-4 border-y border-line px-4 py-4">
        <img src={spot.img} alt="" className="size-20 rounded-xl object-cover" />
        <div>
          <h2 className="text-lg font-bold">{spot.name}</h2>
          <p className="mt-1 flex items-center gap-1 text-zinc-400">
            <Star size={14} fill="currentColor" /> {spot.rating} · {spot.category}
          </p>
        </div>
      </div>

      {/* Party size */}
      <div className="flex items-center justify-between px-4 py-5">
        <span className="text-lg">Party size</span>
        <div className="flex items-center overflow-hidden rounded-xl border border-line">
          <button
            aria-label="Fewer guests"
            className="px-4 py-2.5"
            onClick={() => setGuests(Math.max(1, guests - 1))}
          >
            <Minus size={16} />
          </button>
          <span className="border-x border-line px-4 py-2.5">
            {guests} {guests === 1 ? "guest" : "guests"}
          </span>
          <button
            aria-label="More guests"
            className="px-4 py-2.5"
            onClick={() => setGuests(Math.min(20, guests + 1))}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Day picker */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2">
        {days.map((d, i) => (
          <button
            key={d.iso}
            onClick={() => setDayIdx(i)}
            className={`shrink-0 rounded-full px-6 py-2.5 text-base font-medium ${
              i === dayIdx ? "bg-accent" : "bg-[#3a3a42]"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Time picker */}
      <div className="mt-4 border-t border-line px-4 pt-5">
        <h2 className="text-lg">Available times</h2>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4">
          {TIMES.map((t) => (
            <button
              key={t}
              onClick={() => setTime(t)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-base ${
                t === time ? "bg-accent font-semibold" : "bg-[#3a3a42]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <img
        src="/photos/ponce-wide.png"
        alt=""
        className="mt-6 h-56 w-full object-cover"
        loading="lazy"
      />

      {/* Error banner */}
      {state.phase === "error" && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl bg-red-950/60 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* Confirm CTA */}
      <div className="sticky bottom-0 z-20 bg-gradient-to-t from-ink via-ink/90 to-transparent p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="pb-3 text-center text-sm text-zinc-500">Powered by B-line</p>
        <button
          onClick={handleConfirm}
          disabled={state.phase === "submitting"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-teal py-3.5 text-base font-semibold disabled:opacity-60"
        >
          {state.phase === "submitting" ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Reserving&hellip;
            </>
          ) : (
            `Confirm reservation · ${time}`
          )}
        </button>
      </div>
    </Screen>
  );
}
