import { ArrowUp, CornerUpRight, Navigation } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";

// Turn-by-turn — stylized 3D-ish scene, no map SDK
export default function Navigate() {
  return (
    <Screen className="bg-[#bcd9ea]">
      <svg viewBox="0 0 100 160" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <rect width="100" height="40" fill="#bcd9ea" />
        <rect y="40" width="100" height="120" fill="#8faf77" />
        {/* trail */}
        <path d="M50 160 C 48 120, 55 90, 62 70 C 68 55, 72 50, 80 46"
          stroke="#9b59f5" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M50 160 C 48 120, 55 90, 62 70 C 68 55, 72 50, 80 46"
          stroke="#c77bff" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* sidewalk */}
        <path d="M30 160 C 30 110, 38 80, 46 60 L 60 40 L 100 40 L 100 160 Z" fill="#b9b9ad" opacity="0.5" />
        {/* buildings */}
        <g>
          <path d="M0 40 L 42 40 L 42 95 L 0 105 Z" fill="#9e5b45" />
          <path d="M4 48 h8 v7 h-8 z M16 47 h8 v7 h-8 z M28 46 h8 v7 h-8 z M4 62 h8 v7 h-8 z M16 61 h8 v7 h-8 z M28 60 h8 v7 h-8 z" fill="#5d3021" />
          <rect x="8" y="76" width="26" height="18" fill="#d4703d" />
          <circle cx="15" cy="83" r="4" fill="#f2b544" /><circle cx="26" cy="85" r="4" fill="#4aa3d8" />
        </g>
        <g>
          <path d="M56 20 L 100 14 L 100 40 L 60 40 Z" fill="#a4664c" />
          <path d="M62 24 h5 v5 h-5 z M72 23 h5 v5 h-5 z M82 21 h5 v5 h-5 z" fill="#61341f" />
        </g>
        {/* trees */}
        {[[70, 78], [78, 95], [66, 115], [82, 130], [74, 148], [88, 70]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 1} y={y} width="2" height="6" fill="#6b4a2b" />
            <circle cx={x} cy={y - 4} r="7" fill="#3f7d33" />
            <circle cx={x - 4} cy={y - 1} r="5" fill="#4a8c3c" />
          </g>
        ))}
      </svg>

      <div className="relative flex h-full flex-col p-4">
        <div className="overflow-hidden rounded-2xl shadow-xl">
          <div className="flex items-center gap-4 bg-black/90 p-5 text-white">
            <ArrowUp size={40} strokeWidth={3} />
            <div>
              <p className="text-4xl font-bold">350 ft</p>
              <p className="text-xl text-zinc-300">Continue on Eastside Trail</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-zinc-700/90 px-5 py-3 text-white">
            <CornerUpRight size={22} />
            <p>then bear right toward Ponce City Market</p>
          </div>
        </div>

        <span className="mx-auto mt-24 rounded-xl bg-white px-4 py-2 font-semibold text-zinc-900 shadow">
          Ponce City Market
        </span>

        <div className="mt-auto">
          <div className="mb-3 flex items-end justify-between">
            <button className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2.5 font-semibold text-blue-600 shadow">
              <Navigation size={16} /> Recenter
            </button>
            <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-blue-600 shadow">Eastside Trail</span>
          </div>
          <Link href="/trail" className="block rounded-3xl bg-white/95 p-5 shadow-xl">
            <div className="flex justify-around text-center text-zinc-900">
              <div><p className="text-3xl font-bold">3:29</p><p className="text-sm text-zinc-500">arrival</p></div>
              <div><p className="text-3xl font-bold">3</p><p className="text-sm text-zinc-500">min</p></div>
              <div><p className="text-3xl font-bold">0.2</p><p className="text-sm text-zinc-500">mi</p></div>
            </div>
          </Link>
        </div>
      </div>
    </Screen>
  );
}
