import { useState } from "react";
import { Check, LocateFixed } from "lucide-react";
import Screen from "@/components/Screen";
import { useAuth, startAnonymousSession, signOut } from "@/lib/auth";
import FriendsPanel from "@/components/FriendsPanel";

// No email/SMS: one tap mints an anonymous Supabase user, then FriendsPanel
// immediately asks for the @username that actually identifies you to friends.
function StartCard() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await startAnonymousSession();
    setBusy(false);
    if (err) setError(err.message);
  };

  return (
    <div className="mx-3 mt-4 rounded-2xl bg-white p-6 text-center shadow-sm">
      <p className="text-[17px] font-bold text-zinc-900">Find your friends on the trail</p>
      <p className="mt-1 text-[14px] text-zinc-500">
        Pick a username — no email, no password, nothing to verify.
      </p>
      <button onClick={start} disabled={busy}
        className="mt-4 w-full rounded-xl bg-[#c9187e] py-3 text-[15px] font-semibold text-white disabled:opacity-50">
        {busy ? "Setting up…" : "Get started"}
      </button>
      {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
    </div>
  );
}

// Real device location, used for both buttons below — friend positions on the
// illustrated map above stay demo data (no live-presence backend yet).
function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 }));
}

export default function Friends() {
  const { user, loading } = useAuth();
  const [located, setLocated] = useState(false);

  const onLocate = async () => {
    try {
      await getPosition();
      setLocated(true);
      setTimeout(() => setLocated(false), 2000);
    } catch { /* permission denied or unavailable — no-op */ }
  };

  const onShareLocation = async () => {
    try {
      const { coords } = await getPosition();
      const url = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
      if (navigator.share) await navigator.share({ title: "My location on B-line", url });
      else await navigator.clipboard.writeText(url);
    } catch { /* permission denied, share cancelled, or clipboard unavailable — no-op */ }
  };

  return (
    <Screen className="bg-[#fafafa] text-zinc-900">
      <header className="pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="relative px-4 text-center">
          <p className="text-[22px] font-extrabold tracking-tight text-[#c9187e]">Ⓑ B-line</p>
          <h1 className="mt-0.5 text-[15px] font-bold tracking-[.08em] text-[#c9187e]">
            FRIENDS ON THE TRAIL
          </h1>
          {user && (
            <button onClick={() => signOut()}
              className="absolute right-4 top-1 text-[13px] font-semibold text-zinc-400">
              Sign out
            </button>
          )}
        </div>
      </header>

      {loading ? null : !user ? (
        <StartCard />
      ) : (
      <>
      <div className="relative mx-3 mt-3 h-[26%] overflow-hidden rounded-2xl">
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

        {/* Real friend pins land here once location sharing ships. Deliberately
            empty rather than showing invented people on a live-looking map. */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p className="rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-zinc-600 shadow">
            No one is sharing their location yet
          </p>
        </div>

        <button aria-label="Locate me" onClick={onLocate} className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-full bg-white shadow">
          {located ? <Check size={20} className="text-[#c9187e]" /> : <LocateFixed size={20} className="text-[#c9187e]" />}
        </button>
      </div>

      <FriendsPanel userId={user.id} />
      </>
      )}
      <div className="h-[var(--bline-nav-space)]" />
    </Screen>
  );
}
