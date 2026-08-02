import { Heart, SlidersHorizontal, Activity, Bug, ChevronRight, LogIn, LogOut } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import { useFavorites } from "@/lib/favorites";
import { useSpots } from "@/lib/spots";
import { useAuth, signOut } from "@/lib/auth";

const links = [
  { icon: Heart, label: "My Favorites", href: "/saved" },
  { icon: SlidersHorizontal, label: "Search Preferences", href: "/filters" },
  { icon: Activity, label: "Trail Conditions", href: "/conditions" },
];

/** Derive a display name from a Supabase user — use email local-part as fallback. */
function displayName(email: string | undefined): string {
  if (!email) return "Explorer";
  const local = email.split("@")[0];
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Single letter avatar initial. */
function initial(email: string | undefined): string {
  return (email?.[0] ?? "G").toUpperCase();
}

export default function Profile() {
  const spots = useSpots();
  const favs = useFavorites();
  const { user, loading } = useAuth();

  const name = user ? displayName(user.email) : "Guest Explorer";
  const avatarLetter = user ? initial(user.email) : "G";
  const subtitle = user
    ? (user.email ?? "Signed in")
    : "Sign in to sync your favorites";

  return (
    <Screen className="overflow-hidden">
      <div className="h-full overflow-y-auto pb-24">
        <header className="flex flex-col items-center gap-3 px-6 pt-[max(2.5rem,env(safe-area-inset-top))]">
          <div className="grid size-20 place-items-center rounded-full bg-accent text-3xl font-bold">
            {loading ? "\u2026" : avatarLetter}
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{loading ? "" : name}</p>
            <p className="text-sm text-zinc-400">{loading ? "" : subtitle}</p>
          </div>
          {!loading && (
            user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-xs text-zinc-400"
              >
                <LogOut size={13} /> Sign out
              </button>
            ) : (
              <Link
                href="/friends"
                className="flex items-center gap-1.5 rounded-full bg-hot px-4 py-1.5 text-xs font-semibold text-white"
              >
                <LogIn size={13} /> Sign in
              </Link>
            )
          )}
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
