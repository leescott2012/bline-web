import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";

const loop = "M50 22 C 62 24, 68 34, 66 48 C 64 62, 56 72, 46 70 C 34 68, 30 56, 32 44 C 34 32, 40 24, 50 22 Z";

const styles = [
  { name: "Standard", bg: "#f5f1e6", road: "#f0b429", minor: "#ddd6c4", text: "#6b6b5e" },
  { name: "Trail", bg: "#cde3b9", road: "#8a8f98", minor: "#b9d3a5", text: "#4c5c3f" },
  { name: "Satellite", bg: "#2c3524", road: "#c9b458", minor: "#3c4a30", text: "#e8e4d8" },
  { name: "Night", bg: "#121826", road: "#8fa7d9", minor: "#1e2940", text: "#8f9bb3" },
  { name: "Minimal", bg: "#f4f4f4", road: "#9a9a9a", minor: "#dcdcdc", text: "#7a7a7a" },
  { name: "Terrain", bg: "#e9e6da", road: "#a3a094", minor: "#cfd8c2", text: "#7d7a6c" },
];

export default function MapStyles() {
  const [sel, setSel] = useState("Trail");
  return (
    <Screen className="bg-[#e7e6f2] text-zinc-900">
      <header className="relative flex items-center justify-center px-4 py-6">
        <Link href="/map" aria-label="Back" className="absolute left-4"><ChevronLeft size={24} /></Link>
        <h1 className="text-3xl font-bold">Choose your map style</h1>
      </header>
      <p className="pb-4 text-center text-sm font-bold tracking-widest text-zinc-600">MAP STYLES</p>

      <div className="grid grid-cols-3 gap-4 px-5 pb-10">
        {styles.map((s) => {
          const active = sel === s.name;
          return (
            <button key={s.name} onClick={() => setSel(s.name)} className="text-center">
              <div className={`relative overflow-hidden rounded-3xl ${active ? "ring-4 ring-accent" : ""}`}>
                <svg viewBox="0 0 100 100" className="aspect-[3/4] w-full" style={{ background: s.bg }}>
                  <g stroke={s.minor} strokeWidth="2.5" fill="none">
                    <path d="M0 30 C 30 26, 70 34, 100 28 M0 65 C 30 62, 60 68, 100 64 M35 0 C 38 30, 32 70, 36 100 M70 0 C 67 35, 73 70, 69 100" />
                  </g>
                  <g stroke={s.road} strokeWidth="4" fill="none">
                    <path d="M0 48 C 35 44, 65 52, 100 46 M52 0 C 49 35, 55 65, 51 100" />
                  </g>
                  <path d={loop} fill="none" stroke="#a855f7" strokeWidth="3" />
                  <text x="50" y="52" textAnchor="middle" fontSize="11" fontWeight="700" fill={s.text}>Atlanta</text>
                </svg>
                {active && (
                  <span className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-accent text-white">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
              </div>
              <p className="mt-2 text-lg font-medium">{s.name}</p>
            </button>
          );
        })}
      </div>
    </Screen>
  );
}
