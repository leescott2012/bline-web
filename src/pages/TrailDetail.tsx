import { ChevronLeft, Share } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";

// Light Apple-Maps-style trail segment view
export default function TrailDetail() {
  return (
    <Screen className="bg-[#1b2043]">
      <header className="relative flex items-center justify-center px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white">
        <Link href="/map" aria-label="Back" className="absolute left-4 text-[#e0218a]"><ChevronLeft size={24} /></Link>
        <h1 className="text-sm font-bold tracking-widest">TRAIL SEGMENT DETAIL</h1>
        <button aria-label="Share" onClick={() => {
          const data = { title: "Atlanta BeltLine Eastside Trail", text: "Check out this trail segment on B-line", url: location.href };
          if (navigator.share) navigator.share(data).catch(() => {});
          else navigator.clipboard.writeText(data.url).catch(() => {});
        }} className="absolute right-4 text-[#e0218a]">
          <Share size={20} />
        </button>
      </header>

      <div className="relative mx-0 h-[52%] overflow-hidden bg-[#f3efe4]">
        <svg viewBox="0 0 100 80" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <rect width="100" height="80" fill="#f3efe4" />
          <ellipse cx="52" cy="38" rx="16" ry="12" fill="#cfe6c2" />
          <ellipse cx="14" cy="52" rx="10" ry="7" fill="#efe1b8" />
          <ellipse cx="30" cy="20" rx="12" ry="6" fill="#efe1b8" />
          <g stroke="#dcd6c4" strokeWidth="1" fill="none">
            <path d="M0 30 H100 M0 55 H100 M25 0 V80 M60 0 V80 M85 0 V80" />
          </g>
          <path d="M8 18 C 25 22, 40 26, 52 34 C 60 40, 64 48, 64 60 L 64 80"
            stroke="#a83bd6" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <circle cx="8" cy="18" r="1.8" fill="#2f7cf6" stroke="white" strokeWidth="1" />
          <text x="18" y="34" fill="#b07b28" fontSize="2.5" fontWeight="600">Ponce City Market</text>
          <text x="38" y="46" fill="#3f9c4e" fontSize="2.5" fontWeight="600">Historic Fourth Ward Park</text>
          <text x="42" y="68" fill="#b07b28" fontSize="2.5" fontWeight="600">Krog Street Market</text>
          {/* amenity pins */}
          {[[30, 22, "🖌"], [40, 30, "💧"], [48, 34, "🚻"], [58, 44, "📷"], [62, 62, "🛝"]].map(([x, y, e], i) => (
            <g key={i}>
              <circle cx={x as number} cy={y as number} r="2.6" fill="#1b2043" />
              <text x={x as number} y={(y as number) + 1.1} fontSize="3" textAnchor="middle">{e as string}</text>
            </g>
          ))}
        </svg>
        <div className="absolute inset-x-6 top-4 rounded-2xl bg-white py-3 text-center text-lg font-bold text-zinc-900 shadow">
          Atlanta BeltLine Eastside Trail
        </div>
      </div>

      <div className="mx-4 -mt-6 rounded-3xl bg-white p-4 text-zinc-900 shadow-xl">
        <div className="flex gap-2 rounded-full bg-accent p-1.5">
          <div className="flex-1 rounded-full bg-[#1b2043] py-2.5 text-center text-white">
            <span className="text-2xl font-bold">2.1</span> <span className="text-sm">mi</span>
          </div>
          <div className="flex-1 rounded-full bg-[#1b2043] py-2.5 text-center text-white">
            <span className="text-2xl font-bold">42</span> <span className="text-sm">min walk</span>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium">Elevation</p>
        <svg viewBox="0 0 100 20" className="mt-1 w-full">
          <path d="M0 16 C 10 15, 15 10, 22 12 C 30 14, 35 9, 42 11 C 50 13, 55 12, 62 13 C 70 14, 74 6, 82 9 C 90 12, 95 13, 100 14 L 100 20 L 0 20 Z"
            fill="#bfe6b0" stroke="#60bb46" strokeWidth="0.8" />
        </svg>
        <div className="flex justify-between text-xs text-zinc-500"><span>0 mi</span><span>1 mi</span><span>2 mi</span></div>
      </div>

      <div className="p-4 space-y-3">
        {/* Labelled a preview because that's what it is -- the route and the
            distances are illustrative, not a live fix. Calling it "Start 3D
            Navigation" sent people in expecting directions. */}
        <Link href="/navigate-3d/ponce-city" className="block w-full rounded-full bg-accent py-4 text-center text-lg font-semibold text-on-brand shadow-lg shadow-accent/20">
          3D Preview
        </Link>
        <Link href="/walkthrough/ponce-krog" className="block w-full rounded-full border border-white/25 py-4 text-center text-lg font-semibold text-white">
          Virtual Walk
        </Link>
      </div>
    </Screen>
  );
}
