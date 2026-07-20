import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import RealMap from "@/components/RealMap";

// Map tab: just the map, like a navigation tab.
export default function MapView() {
  return (
    <Screen className="overflow-hidden">
      <RealMap zoom={12.1} className="absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 z-10">
        <TabBar />
      </div>
      <header className="absolute inset-x-3 top-3 z-10 flex items-center justify-around rounded-full bg-[#101014]/90 px-5 py-3.5 backdrop-blur">
        <p><span className="text-zinc-400">Where — </span><span className="font-bold">Eastside Trail</span></p>
        <p><span className="text-zinc-400">When — </span><span className="font-bold">Open now</span></p>
      </header>
    </Screen>
  );
}
