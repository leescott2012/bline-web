import { Search, SlidersHorizontal, Gift } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import DarkMap from "@/components/DarkMap";
import SpotCard from "@/components/SpotCard";
import { spots } from "@/lib/data";

export default function Home() {
  return (
    <Screen className="pb-24">
      <DarkMap circle className="absolute inset-x-0 top-0 h-96" />
      <div className="relative">
        <header className="m-3 rounded-2xl bg-[#101014]/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <Search size={20} className="shrink-0 text-white" />
            <Link href="/filters" className="flex flex-1 items-stretch justify-around text-left">
              <div>
                <p className="text-xs text-zinc-400">Where —</p>
                <p className="text-lg font-semibold">Eastside Trail</p>
              </div>
              <div className="w-px bg-line" />
              <div>
                <p className="text-xs text-zinc-400">When —</p>
                <p className="text-lg font-semibold">Open now</p>
              </div>
            </Link>
            <Link href="/filters" aria-label="Filters"
              className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-panel">
              <SlidersHorizontal size={18} />
            </Link>
          </div>
          <div className="mt-3 flex justify-center">
            <button className="rounded-full border border-zinc-600 px-5 py-1.5 text-sm text-zinc-200">
              Within a 10-min walk
            </button>
          </div>
        </header>

        <div className="h-52" /> {/* let the map show through */}

        <section className="space-y-4 px-3">
          {spots.slice(0, 2).map((s) => (
            <SpotCard key={s.id} spot={s} />
          ))}
        </section>

        <div className="mt-4 flex items-center justify-center gap-2 bg-[#1e3a8a] px-4 py-3 text-sm font-medium">
          <Gift size={16} /> New perk: earn trail rewards every check-in
        </div>
      </div>
      <TabBar />
    </Screen>
  );
}
