import { Layers } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import RealMap from "@/components/RealMap";

// Map tab: just the map, like a navigation tab. Pinch/scroll in for street level —
// it auto-tilts to 3D with building extrusions. Layers icon opens the style picker.
export default function MapView() {
  return (
    <Screen className="overflow-hidden">
      <RealMap zoom={12.1} className="absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 z-10">
        <TabBar />
      </div>
      <header className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex items-center gap-2">
        <div className="flex flex-1 items-center justify-around rounded-full bg-[#101014]/90 px-5 py-3.5 backdrop-blur">
          <p><span className="text-zinc-400">Where — </span><span className="font-bold">Eastside Trail</span></p>
          <p><span className="text-zinc-400">When — </span><span className="font-bold">Open now</span></p>
        </div>
        <Link href="/map-styles" aria-label="Map styles"
          className="grid size-12 shrink-0 place-items-center rounded-full bg-[#101014]/90 backdrop-blur">
          <Layers size={20} className="text-white" />
        </Link>
      </header>
    </Screen>
  );
}
