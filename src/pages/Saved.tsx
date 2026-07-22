import { Bell, ThumbsUp, Heart } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import { spots } from "@/lib/data";
import PhotoCarousel from "@/components/PhotoCarousel";
import { useFavorites, toggleFav } from "@/lib/favorites";

export default function Saved() {
  const favs = useFavorites();
  const saved = spots.filter((s) => favs.includes(s.id));
  return (
    <Screen className="overflow-hidden">
      <div className="h-full overflow-y-auto pb-24">
        <header className="px-3 pt-4">
          <p className="text-center text-2xl font-bold">B-line</p>
          <div className="mt-3 flex overflow-hidden rounded-xl bg-[#2a2a31] text-center">
            <span className="flex-1 rounded-xl bg-[#7c3aed] py-2.5 font-medium">Search — Favorites</span>
            <span className="flex-1 py-2.5 text-zinc-300">When — Open now</span>
          </div>
        </header>

        <section className="px-3">
          <h2 className="mt-5 text-2xl font-bold">Watched trails</h2>
          <div className="mt-3 flex flex-col items-center gap-2 rounded-2xl border border-line bg-panel px-6 py-8 text-center text-zinc-400">
            <Bell size={32} />
            <p>You aren't watching any searches.<br />Tap the bell on a search to save it here.</p>
          </div>

          <h2 className="mt-6 text-2xl font-bold">My Favorites</h2>
          <p className="text-zinc-400">{saved.length} available now</p>

          {saved.length === 0 ? (
            <div className="mt-3 flex flex-col items-center gap-2 rounded-2xl border border-line bg-panel px-6 py-10 text-center text-zinc-400">
              <Heart size={32} />
              <p>No favorites yet.<br />Tap the heart on any spot to save it here.</p>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {saved.map((s) => (
                <Link key={s.id} href={`/spot/${s.id}`} className="block overflow-hidden bg-card">
                  <div className="relative h-52">
                    <PhotoCarousel imgs={s.imgs} alt={s.name} className="h-full w-full" />
                    <button aria-label="Remove from saved"
                      onClick={(e) => { e.preventDefault(); toggleFav(s.id); }}
                      className="absolute right-3 top-3 text-hot drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                      <Heart size={26} fill="currentColor" />
                    </button>
                  </div>
                  <div className="flex items-start justify-between p-4">
                    <div>
                      <h3 className="text-[18px] font-bold">{s.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-zinc-400">
                        <ThumbsUp size={13} /> {s.loved}% loved · {s.area}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-hot">{s.rating}</p>
                      <p className="text-xs text-zinc-400">{s.ratings} ratings</p>
                      <p className="text-xs text-zinc-400 underline">Open till {s.openTill}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <TabBar />
      </div>
    </Screen>
  );
}
