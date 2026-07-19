import { LocateFixed } from "lucide-react";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import { friends } from "@/lib/data";

const pins = [
  { f: friends[1], x: 46, y: 22, tag: "At New Realm", batt: "89%" },
  { f: friends[2], x: 72, y: 33, tag: "Ponce City Market", batt: "64%" },
  { f: friends[0], x: 28, y: 48, tag: "On the trail", batt: "76%" },
];

export default function Friends() {
  return (
    <Screen className="bg-[#efe9e2] text-zinc-900">
      <header className="pt-4 text-center">
        <p className="text-3xl font-extrabold text-[#c9187e]">Ⓑ B-line</p>
        <h1 className="mt-1 text-xl font-bold tracking-wide text-[#c9187e]">FRIENDS ON THE TRAIL</h1>
      </header>

      <div className="relative mt-2 h-[52%]">
        <svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="100" height="80" fill="#efe9e2" />
          <ellipse cx="45" cy="42" rx="16" ry="12" fill="#8a9b7d" opacity="0.6" />
          <ellipse cx="12" cy="65" rx="12" ry="8" fill="#7d9db5" opacity="0.6" />
          <ellipse cx="85" cy="15" rx="10" ry="8" fill="#e0b25e" opacity="0.4" />
          <g stroke="#fff" strokeWidth="1" fill="none">
            <path d="M0 25 H100 M0 55 H100 M20 0 V80 M60 0 V80 M85 0 V80" />
          </g>
          {/* beltline loop */}
          <path d="M46 15 L 30 35 C 26 42, 26 50, 32 58 L 44 68 C 52 72, 60 68, 62 58 L 64 30 C 62 20, 54 12, 46 15 Z"
            fill="none" stroke="#b13df0" strokeWidth="2.2" />
          <path d="M46 15 L 30 35 C 26 42, 26 50, 32 58 L 44 68 C 52 72, 60 68, 62 58 L 64 30 C 62 20, 54 12, 46 15 Z"
            fill="none" stroke="#e6c8f7" strokeWidth="0.8" />
          <text x="66" y="45" fontSize="3" fill="#6b7280" transform="rotate(80 66 45)">Atlanta BeltLine</text>
          <path d="M48 44 l3 7 -3 -1.8 -3 1.8 z" fill="#3b82f6" stroke="white" strokeWidth="0.6" />
        </svg>

        {pins.map(({ f, x, y, tag, batt }) => (
          <div key={f.name} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="rounded-full bg-[#a3c94a] px-2 py-0.5 text-[10px] font-semibold text-white shadow">● {tag}</span>
            <img src={f.img} alt={f.name} className="mx-auto mt-1 size-14 rounded-full border-4 border-[#a3c94a] object-cover shadow" />
            <span className="mt-1 inline-block rounded-full bg-white px-1.5 py-0.5 text-[9px] font-medium shadow">🔋 {batt}</span>
          </div>
        ))}

        <button aria-label="Locate me" className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-full bg-white shadow">
          <LocateFixed size={20} className="text-[#c9187e]" />
        </button>
      </div>

      <div className="mx-3 mt-2 rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
        <ul className="space-y-4">
          {friends.map((f) => (
            <li key={f.name} className="flex items-center gap-3">
              <img src={f.img} alt="" className="size-12 rounded-full object-cover" />
              <p className="text-lg"><span className="font-bold">{f.name}</span> — {f.place}</p>
            </li>
          ))}
        </ul>
        <button className="mt-4 w-full rounded-full bg-[#c9187e] py-3.5 text-lg font-semibold text-white">
          Share my location
        </button>
      </div>
      <div className="h-24" />
      <TabBar />
    </Screen>
  );
}
