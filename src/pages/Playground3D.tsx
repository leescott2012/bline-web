import Screen from "@/components/Screen";
import AppleLookAround, { PONCE_LOOK_AROUND_COORDINATE } from "@/components/AppleLookAround";
import { ArrowLeft, Compass, MapPin } from "lucide-react";
import { useLocation } from "wouter";

export default function Playground3D() {
  const [, setLocation] = useLocation();

  return (
    <Screen className="overflow-hidden bg-[#102219]" style={{ height: "100dvh" }}>
      <AppleLookAround />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,.55),transparent)]" />
      <button
        aria-label="Back to map"
        onClick={() => setLocation("/map")}
        className="absolute left-4 top-[max(0.75rem,env(safe-area-inset-top))] z-30 grid size-10 place-items-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-md ring-1 ring-white/15 active:scale-95"
      >
        <ArrowLeft size={19} />
      </button>

      <div className="pointer-events-none absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 px-12">
        <div className="rounded-[1.55rem] border border-white/10 bg-black/[.78] px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-[#9eea69]" />
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#c4eda8]">B-line Look Around</p>
          </div>
          <p className="mt-1 text-[15px] font-bold leading-tight">Ponce City Market trail-side walk</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20">
        <div className="flex items-center gap-3 rounded-[1.75rem] border border-white/10 bg-black/[.78] px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#9eea69] text-[#16311b]">
            <MapPin size={19} fill="currentColor" />
          </span>
          <div>
            <p className="text-sm font-black">Ponce City Market</p>
            <p className="mt-0.5 text-xs leading-4 text-zinc-300">Navigate the street-level trail view. Coverage and imagery are provided by Apple Maps.</p>
          </div>
        </div>
      </div>

      <p className="sr-only">Look Around is centered at {PONCE_LOOK_AROUND_COORDINATE.latitude}, {PONCE_LOOK_AROUND_COORDINATE.longitude}.</p>
    </Screen>
  );
}
