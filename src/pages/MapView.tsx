import { RotateCw, ThumbsUp, Heart } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import RealMap from "@/components/RealMap";
import { spots } from "@/lib/data";

export default function MapView() {
  return (
    <Screen>
      <RealMap zoom={12.1} className="absolute inset-0" />
      <div className="pointer-events-none relative flex h-full flex-col [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_header]:pointer-events-auto">
        <header className="m-3 flex items-center justify-around rounded-full bg-[#101014]/90 px-5 py-4 backdrop-blur">
          <p><span className="text-zinc-400">Where — </span><span className="font-bold">Eastside Trail</span></p>
          <p><span className="text-zinc-400">When — </span><span className="font-bold">Open now</span></p>
        </header>

        <div className="mt-auto flex justify-center gap-3 px-4 pb-4">
          <button className="flex items-center gap-2 rounded-xl bg-[#101014]/90 px-5 py-3 font-medium backdrop-blur">
            <RotateCw size={16} /> Redo Search
          </button>
          <Link href="/" className="rounded-xl bg-[#101014]/90 px-5 py-3 font-medium backdrop-blur">
            Back to list
          </Link>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-24">
          {spots.map((s) => (
            <Link key={s.id} href={`/spot/${s.id}`}
              className="w-[85%] shrink-0 overflow-hidden rounded-2xl bg-card">
              <div className="relative h-44">
                <img src={s.img} alt={s.name} className="h-full w-full object-cover" loading="lazy" />
                <Heart size={20} className="absolute right-3 top-3 text-white" />
                <span className="absolute bottom-3 left-3 rounded bg-[#7c3aed] px-2 py-1 text-[10px] font-bold">
                  {s.badges[0]}
                </span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <h3 className="text-lg font-bold">{s.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
                    <ThumbsUp size={13} /> {s.loved}% loved · {s.area}
                  </p>
                </div>
                <span className="rounded-lg bg-accent px-3 py-1.5 font-bold">★ {s.rating}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <TabBar />
    </Screen>
  );
}
