import { useEffect, useState } from "react";
import { Heart, SlidersHorizontal, Bug, ChevronRight, LogOut, CalendarDays, KeyRound, Check } from "lucide-react";
import { Link } from "wouter";
import Screen from "@/components/Screen";
import { useFavorites } from "@/lib/favorites";
import { useSpots } from "@/lib/spots";
import { useAuth, signOut, attachPassword, hasLogin } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { ProfileAvatar } from "@/components/ProfileCard";

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

export default function Profile() {
  const spots = useSpots();
  const favs = useFavorites();
  const { user } = useAuth();
  // The gate guarantees both a user and a profile before any screen renders.
  const { profile } = useProfile();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [resvLoading, setResvLoading] = useState(false);
  const [linkPassword, setLinkPassword] = useState("");
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setResvLoading(true);
    fetchMyReservations(user.id).then((r) => {
      setReservations(r);
      setResvLoading(false);
    });
  }, [user]);

  if (!profile) return null;
  const name = profile.display_name || profile.username;
  const linked = hasLogin(user);

  return (
    <Screen className="overflow-hidden">
      <div className="h-full overflow-y-auto pb-[var(--bline-nav-space)]">
        <header className="flex flex-col items-center gap-3 px-6 pt-[max(2.5rem,env(safe-area-inset-top))]">
          <ProfileAvatar profile={profile} size={80} />
          <div className="text-center">
            <p className="text-xl font-bold">{name}</p>
            <p className="text-sm text-zinc-400">@{profile.username}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-xs text-zinc-400"
          >
            <LogOut size={13} /> Sign out
          </button>
        </header>

        {/* Until you add these, the account exists only in this device's
            storage: sign out or switch phones and it's gone, username and all.
            This upgrades the *same* user in place -- uuid, @username, friends,
            favourites and reservations all survive. */}
        <div className="mx-4 mt-6 rounded-2xl border border-line p-4">
          <div className="flex items-center gap-2">
            {linked ? <Check size={16} className="text-mint" /> : <KeyRound size={16} className="text-hot" />}
            <p className="text-[15px] font-bold">
              {linked ? "You can sign back in" : "Add a way to sign back in"}
            </p>
          </div>
          {linked ? (
            <p className="mt-1.5 text-[13px] text-zinc-400">
              Sign in with @{profile.username} and your password to get this account back on
              another phone.
            </p>
          ) : (
            <>
              <p className="mt-1.5 text-[13px] text-zinc-400">
                Right now @{profile.username} only lives on this phone. Set a password and you can
                sign back in with your username anywhere.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLinkBusy(true);
                  setLinkError(null);
                  const { error } = await attachPassword(profile.username, linkPassword);
                  setLinkBusy(false);
                  if (error) {
                    // Supabase reports the confirmation-required case as a mail
                    // failure, which reads as nonsense to someone who never
                    // typed an email.
                    setLinkError(
                      /rate limit|smtp|mail/i.test(error.message)
                        ? "Couldn't save. Email confirmation needs to be turned off in Supabase Auth settings."
                        : error.message,
                    );
                  }
                }}
                className="mt-3 space-y-2"
              >
                <input value={linkPassword} onChange={(e) => setLinkPassword(e.target.value)} type="password"
                  placeholder="Password (8+ characters)" aria-label="Password" minLength={8}
                  className="w-full rounded-xl bg-panel px-4 py-3 text-[15px] outline-none ring-1 ring-line placeholder:text-zinc-600 focus:ring-hot" />
                <button type="submit" disabled={linkBusy || linkPassword.length < 8}
                  className="w-full rounded-xl bg-hot py-3 text-[15px] font-semibold text-white disabled:opacity-50">
                  {linkBusy ? "Saving…" : "Save login"}
                </button>
                {linkError && <p className="text-center text-[13px] text-red-400">{linkError}</p>}
              </form>
            </>
          )}
        </div>

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
