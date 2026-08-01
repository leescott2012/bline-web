import { useState } from "react";
import { Check, LocateFixed } from "lucide-react";
import Screen from "@/components/Screen";
import TabBar from "@/components/TabBar";
import { friends } from "@/lib/data";
import { useAuth, signInWithEmail, signOut } from "@/lib/auth";

function SignInCard({ callbackError }: { callbackError: string | null }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    const { error: err } = await signInWithEmail(email.trim());
    setSending(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="mx-3 mt-4 rounded-3xl bg-white/90 p-6 text-center shadow-xl backdrop-blur">
        <p className="text-lg font-bold text-[#c9187e]">Check your email</p>
        <p className="mt-1 text-zinc-600">Tap the link we sent to {email} to sign in.</p>
      </div>
    );
  }

  return (
    <div className="mx-3 mt-4 rounded-3xl bg-white/90 p-6 shadow-xl backdrop-blur">
      <p className="text-lg font-bold text-[#c9187e]">Sign in to find friends</p>
      <p className="mt-1 text-zinc-600">No password — we'll email you a link.</p>
      {callbackError && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{callbackError}</p>
      )}
      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full rounded-full border border-zinc-300 px-4 py-3 text-zinc-900 outline-none"
        />
        <button type="submit" disabled={sending}
          className="w-full rounded-full bg-[#c9187e] py-3.5 text-lg font-semibold text-white disabled:opacity-50">
          {sending ? "Sending…" : "Send magic link"}
        </button>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}

const pins = [
  { f: friends[1], x: 46, y: 22, tag: "At New Realm", batt: "89%" },
  { f: friends[2], x: 72, y: 33, tag: "Ponce City Market", batt: "64%" },
  { f: friends[0], x: 28, y: 48, tag: "On the trail", batt: "76%" },
];

// Real device location, used for both buttons below — friend positions on the
// illustrated map above stay demo data (no live-presence backend yet).
function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 }));
}

export default function Friends() {
  const { user, loading, callbackError } = useAuth();
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
    <Screen className="bg-[#efe9e2] text-zinc-900">
      <header className="pt-[max(1rem,env(safe-area-inset-top))] text-center">
        <p className="text-3xl font-extrabold text-[#c9187e]">Ⓑ B-line</p>
        <h1 className="mt-1 text-xl font-bold tracking-wide text-[#c9187e]">FRIENDS ON THE TRAIL</h1>
        {user && (
          <button onClick={() => signOut()} className="mt-1 text-xs text-zinc-500 underline">
            {user.email} · Sign out
          </button>
        )}
      </header>

      {loading ? null : !user ? (
        <SignInCard callbackError={callbackError} />
      ) : (
      <>
      <div className="relative mt-2 h-[52%]">
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

        {pins.map(({ f, x, y, tag, batt }) => (
          <div key={f.name} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className="rounded-full bg-[#a3c94a] px-2 py-0.5 text-[10px] font-semibold text-white shadow">● {tag}</span>
            <img src={f.img} alt={f.name} className="mx-auto mt-1 size-14 rounded-full border-4 border-[#a3c94a] object-cover shadow" />
            <span className="mt-1 inline-block rounded-full bg-white px-1.5 py-0.5 text-[9px] font-medium shadow">🔋 {batt}</span>
          </div>
        ))}

        <button aria-label="Locate me" onClick={onLocate} className="absolute bottom-4 right-4 grid size-12 place-items-center rounded-full bg-white shadow">
          {located ? <Check size={20} className="text-[#c9187e]" /> : <LocateFixed size={20} className="text-[#c9187e]" />}
        </button>
      </div>

      <div className="mx-3 mt-2 rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
        <ul className="space-y-4">
          {friends.map((f) => (
            <li key={f.name} className="flex items-center gap-3">
              <img src={f.img} alt="" className="size-12 rounded-full object-cover" />
              <p className="text-lg"><span className="font-bold">{f.name}</span> — {f.place}</p>
            </li>
          ))}
        </ul>
        <button onClick={onShareLocation} className="mt-4 w-full rounded-full bg-[#c9187e] py-3.5 text-lg font-semibold text-white">
          Share my location
        </button>
      </div>
      </>
      )}
      <div className="h-24" />
      {/* absolute (not the bare sticky TabBar) so it stays pinned to the bottom
          even when the page is short -- e.g. the signed-out sign-in card */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <TabBar />
      </div>
    </Screen>
  );
}
