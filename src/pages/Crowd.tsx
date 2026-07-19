import { ChevronLeft, Users, Sun, Navigation2 } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";

const hours = ["0", "1", "2", "3", "4", "6", "7", "8", "9", "10", "1", "2"];
const heights = [4, 5, 8, 14, 34, 48, 64, 52, 40, 22, 14, 10];

export default function Crowd() {
  return (
    <Screen>
      <header className="relative flex items-center px-4 py-4">
        <Link href="/" aria-label="Back" className="mr-3"><ChevronLeft size={22} /></Link>
        <h1 className="text-sm font-bold tracking-widest text-zinc-300">
          TRAIL CONDITIONS / <span className="text-white">CROWD-DENSITY</span>
        </h1>
      </header>

      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-3">
        {[
          { icon: Users, big: "Moderate", small: "crowd" },
          { icon: Sun, big: "72°F", small: "clear" },
          { icon: null, big: "Peak until", small: "6 PM" },
        ].map(({ icon: Icon, big, small }, i) => (
          <div key={i} className="flex shrink-0 items-center gap-2 rounded-2xl border-2 border-accent bg-[#f3e3f3] px-4 py-2.5 text-zinc-900">
            {Icon && <Icon size={20} className="text-accent" />}
            <div><p className="font-bold leading-tight">{big}</p><p className="text-sm leading-tight">{small}</p></div>
          </div>
        ))}
      </div>

      <div className="relative mx-0 h-[55%] overflow-hidden">
        <svg viewBox="0 0 100 90" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <rect width="100" height="90" fill="#252c3b" />
          <ellipse cx="20" cy="20" rx="14" ry="9" fill="#1e3229" />
          <ellipse cx="80" cy="65" rx="14" ry="9" fill="#1e3229" />
          <g stroke="#39415a" strokeWidth="0.8" fill="none">
            <path d="M0 30 H100 M0 60 H100 M25 0 V90 M70 0 V90" />
          </g>
          {/* heat trail */}
          <g fill="none" strokeLinecap="round">
            <path d="M10 75 C 30 70, 40 55, 48 40 C 54 28, 58 20, 66 12" stroke="#4ade4a" strokeWidth="7" opacity="0.35" />
            <path d="M30 40 C 42 42, 55 44, 72 40" stroke="#4ade4a" strokeWidth="6" opacity="0.35" />
            <path d="M44 55 C 48 46, 50 38, 54 28" stroke="#fb923c" strokeWidth="8" opacity="0.55" />
            <path d="M46 50 C 49 43, 51 37, 53 31" stroke="#ef4444" strokeWidth="8" opacity="0.8" />
            <path d="M52 32 C 60 28, 66 26, 74 27" stroke="#fb923c" strokeWidth="6" opacity="0.55" />
          </g>
          <text x="12" y="52" fill="#9aa4bd" fontSize="6" fontWeight="700">Atlanta</text>
          <text x="56" y="42" fill="#d99a3d" fontSize="3.4" fontWeight="700">Ponce City Market</text>
          <text x="76" y="30" fill="#8b93ab" fontSize="2.8" transform="rotate(70 76 30)">Eastside Trail</text>
          <path d="M50 46 l3.5 8 -3.5 -2 -3.5 2 z" fill="#3b82f6" stroke="white" strokeWidth="0.7" />
        </svg>
      </div>

      <div className="mx-4 mt-3 rounded-3xl border-2 border-accent bg-white p-4 text-zinc-900">
        <h2 className="text-center text-lg font-bold">Eastside Trail · busiest 4–6 PM</h2>
        <div className="mt-3 flex h-20 items-end justify-between gap-1.5">
          {heights.map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#d8b4e2] to-accent" style={{ height: `${h}px`, opacity: 0.5 + h / 130 }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          {hours.map((h, i) => <span key={i} className="flex-1 text-center">{h}</span>)}
        </div>
      </div>
      <div className="h-24" />
      <TabBar />
    </Screen>
  );
}
