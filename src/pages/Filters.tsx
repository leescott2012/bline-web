import { useState } from "react";
import { X } from "lucide-react";
import { Link, useLocation } from "wouter";
import Screen from "@/components/Screen";
import DarkMap from "@/components/DarkMap";
import { spots } from "@/lib/data";

const categories = ["Breweries", "Eats", "Coffee", "Bars", "Art & Murals"];
const ratings = ["4.0+", "4.5+", "Any"];

export default function Filters() {
  const [, nav] = useLocation();
  const [cat, setCat] = useState("Breweries");
  const [dist, setDist] = useState(60);
  const [minRating, setMinRating] = useState("4.5+");
  const [openNow, setOpenNow] = useState(true);

  return (
    <Screen>
      <DarkMap className="absolute inset-x-0 top-0 h-72 opacity-60" />
      <div className="relative mt-40 rounded-t-3xl bg-panel pb-6">
        <div className="mx-auto mt-2 h-1 w-10 rounded bg-zinc-600" />
        <header className="relative flex items-center justify-center px-4 py-4">
          <Link href="/" aria-label="Close" className="absolute left-4"><X size={24} /></Link>
          <h1 className="text-2xl font-bold">Filters</h1>
          <button className="absolute right-4 text-zinc-300 underline"
            onClick={() => { setCat("Breweries"); setDist(60); setMinRating("4.5+"); setOpenNow(true); }}>
            Reset
          </button>
        </header>

        <div className="px-4">
          <h2 className="text-xl font-semibold">Category</h2>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-lg ${c === cat ? "bg-accent font-semibold" : "bg-[#3a3a42]"}`}>
                {c}
              </button>
            ))}
          </div>

          <h2 className="mt-7 text-xl font-semibold">Distance from trail</h2>
          <input type="range" min={10} max={100} value={dist} onChange={(e) => setDist(+e.target.value)}
            className="mt-4 w-full accent-accent" aria-label="Distance from trail" />
          <p className="mt-1 text-zinc-400">Within {Math.round(dist / 6)}-min walk</p>

          <img src={spots[1].img} alt="" className="mt-5 h-40 w-full rounded-2xl object-cover" loading="lazy" />

          <h2 className="mt-6 text-xl font-semibold">Minimum rating</h2>
          <div className="mt-3 flex overflow-hidden rounded-full bg-[#3a3a42] text-center">
            {ratings.map((r) => (
              <button key={r} onClick={() => setMinRating(r)}
                className={`flex-1 py-3 text-lg ${r === minRating ? "rounded-full bg-accent font-semibold" : ""}`}>
                {r}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xl">Open now</span>
            <button role="switch" aria-checked={openNow} onClick={() => setOpenNow(!openNow)}
              className={`h-8 w-14 rounded-full p-1 transition-colors ${openNow ? "bg-accent" : "bg-zinc-600"}`}>
              <span className={`block size-6 rounded-full bg-white transition-transform ${openNow ? "translate-x-6" : ""}`} />
            </button>
          </div>

          <button onClick={() => nav("/")}
            className="mt-7 w-full rounded-2xl bg-accent py-4 text-lg font-semibold">
            Show 28 spots
          </button>
        </div>
      </div>
    </Screen>
  );
}
