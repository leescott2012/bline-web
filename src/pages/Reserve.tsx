import { useState } from "react";
import { ChevronLeft, Minus, Plus, Star } from "lucide-react";
import { Link, useParams } from "wouter";
import Screen from "@/components/Screen";
import { spots } from "@/lib/data";

const days = ["Today", "Fri 12", "Sat 13", "Sun 14"];
const times = ["6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"];

export default function Reserve() {
  const { id } = useParams<{ id: string }>();
  const spot = spots.find((s) => s.id === id) ?? spots[0];
  const [guests, setGuests] = useState(2);
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("7:00 PM");
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Screen className="pb-32">
      <header className="relative flex items-center justify-center px-4 py-5">
        <Link href={`/spot/${spot.id}`} aria-label="Back" className="absolute left-4"><ChevronLeft size={24} /></Link>
        <h1 className="text-2xl font-bold">Reserve a table</h1>
      </header>

      <div className="flex items-center gap-4 border-y border-line px-4 py-4">
        <img src={spot.img} alt="" className="size-20 rounded-xl object-cover" />
        <div>
          <h2 className="text-xl font-bold">{spot.name}</h2>
          <p className="mt-1 flex items-center gap-1 text-zinc-400">
            <Star size={14} fill="currentColor" /> {spot.rating} · {spot.category}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-5">
        <span className="text-xl">Party size</span>
        <div className="flex items-center overflow-hidden rounded-xl border border-line">
          <button aria-label="Fewer guests" className="px-4 py-2.5" onClick={() => setGuests(Math.max(1, guests - 1))}><Minus size={16} /></button>
          <span className="border-x border-line px-4 py-2.5">{guests} guests</span>
          <button aria-label="More guests" className="px-4 py-2.5" onClick={() => setGuests(guests + 1)}><Plus size={16} /></button>
        </div>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2">
        {days.map((d, i) => (
          <button key={d} onClick={() => setDay(i)}
            className={`shrink-0 rounded-full px-7 py-3.5 text-lg font-medium ${i === day ? "bg-accent" : "bg-[#3a3a42]"}`}>
            {d}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-line px-4 pt-5">
        <h2 className="text-xl">Available times</h2>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4">
          {times.map((t) => (
            <button key={t} onClick={() => setTime(t)}
              className={`shrink-0 rounded-full px-6 py-3.5 text-lg ${t === time ? "bg-accent font-semibold" : "bg-[#3a3a42]"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <img src={spots[1].img} alt="" className="mt-6 h-56 w-full object-cover" loading="lazy" />
      <p className="py-6 text-center text-zinc-500">Powered by OpenTable</p>

      <div className="absolute inset-x-0 bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button onClick={() => setConfirmed(true)}
          className="w-full rounded-full bg-[#5b2a86] py-4 text-lg font-semibold">
          {confirmed ? "Reserved ✓ See you at " + time : `Confirm reservation · ${time}`}
        </button>
      </div>
    </Screen>
  );
}
