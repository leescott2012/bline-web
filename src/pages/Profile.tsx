import { Heart, SlidersHorizontal, Activity, Bug, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import { useFavorites } from "@/lib/favorites";
import { spots } from "@/lib/data";

const links = [
  { icon: Heart, label: "My Favorites", href: "/saved" },
  { icon: SlidersHorizontal, label: "Search Preferences", href: "/filters" },
  { icon: Activity, label: "Trail Conditions", href: "/conditions" },
];

export default function Profile() {
  const favs = useFavorites();

  return (
    <Screen className="overflow-hidden">
      <div className="h-full overflow-y-auto pb-24">
        <header className="flex flex-col items-center gap-3 px-6 pt-10">
          <div className="grid size-20 place-items-center rounded-full bg-accent text-3xl font-bold">G</div>
          <div className="text-center">
            <p className="text-xl font-bold">Guest Explorer</p>
            <p className="text-sm text-zinc-400">Walking the Eastside Trail</p>
          </div>
        </header>

        <div className="mx-4 mt-6 flex overflow-hidden rounded-2xl border border-line">
          <div className="flex-1 border-r border-line py-4 text-center">
            <p className="text-2xl font-bold text-hot">{favs.length}</p>
            <p className="text-xs text-zinc-400">Saved spots</p>
          </div>
          <div className="flex-1 py-4 text-center">
            <p className="text-2xl font-bold text-hot">{spots.length}</p>
            <p className="text-xs text-zinc-400">Spots nearby</p>
          </div>
        </div>

        <div className="mx-4 mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {links.map(({ icon: Icon, label, href }) => (
            <Link key={label} href={href} className="flex items-center gap-3 px-4 py-3.5">
              <Icon size={18} className="text-zinc-400" />
              <span className="flex-1 text-[15px]">{label}</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </Link>
          ))}
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 px-6 text-center text-xs text-zinc-500">
          <Bug size={13} /> Found something off? Tap the bug icon on any screen.
        </p>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <TabBar />
      </div>
    </Screen>
  );
}
