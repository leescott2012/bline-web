import { useEffect, useState } from "react";
import { Heart, SlidersHorizontal, Activity, Bug, ChevronRight, LogIn, LogOut, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";
import { useFavorites } from "@/lib/favorites";
import { useSpots } from "@/lib/spots";
import { useAuth, signOut } from "@/lib/auth";
import { getMyProfile, type Profile } from "@/lib/friends";

const links = [
  { icon: Heart, label: "My Favorites", href: "/saved" },
  { icon: SlidersHorizontal, label: "Search Preferences", href: "/filters" },
];

interface Reservation {
  id: string;
  spot_id: string;
  spot_name: string;
  guests: number;
  day_label: string;
  time_label: string;
  status: string;
  created_at: string;
}

/** Fetch the user's reservations from the API. */
async function fetchMyReservations(userId: string): Promise<Reservation[]> {
  try {
    const res = await fetch(`/api/reservations?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Derive a display name from a Supabase user — use email local-part as fallback. */
function emailDisplayName(email: string | undefined): string {
  if (!email) return "Explorer";
  const local = email.split("@")[0];
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Single letter avatar initial. */
function initial(str: string | undefined): string {
  return (str?.[0] ?? "G").toUpperCase();
}

export default function Profile() {
  const spots = useSpots();
  const favs = useFavorites();
  const { user, loading } = useAuth();

  // Fetch the user's profile (@username / display_name) from the profiles table.
  // Falls back to email-derived name if the user hasn't set a username yet.
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resvLoading, setResvLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setReservations([]);
      return;
    }
    // Fetch profile (username + display_name) — set during Friends onboarding
    getMyProfile(user.id).then(setProfile);
    // Fetch the user's reservations
    setResvLoading(true);
    fetchMyReservations(user.id).then((r) => {
      setReservations(r);
      setResvLoading(false);
    });
  }, [user]);

  // Prefer display_name from the profiles table; fall back to email-derived name.
  const name = user
    ? (profile?.display_name || profile?.username || emailDisplayName(user.email))
    : "Guest Explorer";
  const avatarLetter = user
    ? initial(profile?.display_name || profile?.username || user.email)
    : "G";
  const subtitle = user
    ? (profile?.username ? `@${profile.username}` : (user.email ?? "Signed in"))
    : "Sign in to sync your favorites";

  return (
    <Screen className="overflow-hidden">
      <div className="h-full overflow-y-auto pb-[var(--bline-nav-space)]">
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

        {/* My Reservations — only shown when signed in */}
        {user && (
          <div className="mx-4 mt-6">
            <h2 className="mb-3 text-lg font-bold">My Reservations</h2>
            {resvLoading ? (
              <p className="text-sm text-zinc-500">Loading…</p>
            ) : reservations.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-panel px-6 py-6 text-center text-zinc-400">
                <CalendarDays size={28} />
                <p className="text-sm">No upcoming reservations.<br />Tap “Reserve a table” on any spot to book.</p>
              </div>
            ) : (
              <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {reservations.map((r) => (
                  <Link key={r.id} href={`/spot/${r.spot_id}`} className="flex items-center justify-between px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{r.spot_name}</p>
                      <p className="mt-0.5 text-sm text-zinc-400">
                        {r.day_label} · {r.time_label} · {r.guests} {r.guests === 1 ? "guest" : "guests"}
                      </p>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        r.status === "confirmed" ? "bg-mint/20 text-mint" : "bg-zinc-700 text-zinc-400"
                      }`}>
                        {r.status}
                      </span>
                      <ChevronRight size={16} className="text-zinc-500" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

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

    </Screen>
  );
}
