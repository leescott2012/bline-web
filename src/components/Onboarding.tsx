import { useState } from "react";
import { MapPin, Users, Flame } from "lucide-react";

import { startAnonymousSession } from "@/lib/auth";
import { claimUsername } from "@/lib/friends";
import { refreshProfile } from "@/lib/profile";

// First launch. Everyone gets an identity before they reach the app: an
// anonymous Supabase user (real uuid, real RLS, no email and no password) plus
// the @username that IS the identity as far as other people are concerned.
//
// The gate is deliberately hard rather than skippable, because the crowd
// heatmap is only as good as the number of people publishing a position -- a
// browse-without-signing-in path would quietly hollow it out.

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

const BTN = "w-full rounded-xl bg-hot py-3.5 text-[15px] font-semibold text-white disabled:opacity-50";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col justify-center px-7 pb-[env(safe-area-inset-bottom)]">
      <p className="text-center text-[26px] font-extrabold tracking-tight text-hot">Ⓑ B-line</p>
      {children}
    </div>
  );
}

// Step 1 -- what they get, then one tap. No form here on purpose: the first
// screen should be readable in two seconds.
function Welcome() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await startAnonymousSession();
    // On success the auth listener swaps this screen out from under us, so
    // only the failure path needs to restore the button.
    if (err) { setError(err.message); setBusy(false); }
  };

  return (
    <Shell>
      <h1 className="mt-7 text-center text-[24px] font-bold leading-tight">
        Everything happening<br />on the BeltLine
      </h1>

      <ul className="mx-auto mt-7 space-y-3.5">
        {[
          { icon: MapPin, text: "Turn-by-turn walking directions" },
          { icon: Users, text: "See friends on the trail, live" },
          { icon: Flame, text: "Know where the crowd is before you go" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-hot/15 text-hot">
              <Icon size={17} />
            </span>
            <span className="text-[15px] text-zinc-300">{text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-9 space-y-3">
        <button onClick={start} disabled={busy} className={BTN}>
          {busy ? "Setting up…" : "Get started"}
        </button>

      </div>
      <p className="mt-4 text-center text-[13px] text-zinc-500">
        No email, no password, nothing to verify.
      </p>
      {error && <p className="mt-2 text-center text-[13px] text-red-400">{error}</p>}
    </Shell>
  );
}

// Step 2 -- the handle other people search for. The location sentence sits here
// rather than on its own screen so iOS's permission prompt, which fires moments
// later, arrives with a reason already on screen.
function UsernamePicker({ userId }: { userId: string }) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const handle = username.trim().toLowerCase();
    if (!USERNAME_RE.test(handle)) {
      setError("3–20 characters: letters, numbers, underscore or dot.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: err } = await claimUsername(userId, handle, displayName.trim() || handle);
    // 23505 = unique violation, i.e. the handle is taken
    if (err) {
      setError(err.code === "23505" ? "That username is taken." : err.message);
      setSaving(false);
      return;
    }
    await refreshProfile(userId);
  };

  return (
    <Shell>
      <h1 className="mt-7 text-center text-[24px] font-bold">Pick your username</h1>
      <p className="mt-1.5 text-center text-[14px] text-zinc-400">
        This is how friends find you on B-line.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-2.5">
        <div className="flex items-center rounded-xl bg-panel px-4 ring-1 ring-line focus-within:ring-hot">
          <span className="text-zinc-500">@</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            aria-label="Username"
            className="w-full bg-transparent py-3.5 pl-1 text-[15px] outline-none placeholder:text-zinc-600"
          />
        </div>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name (optional)"
          aria-label="Display name"
          className="w-full rounded-xl bg-panel px-4 py-3.5 text-[15px] outline-none ring-1 ring-line placeholder:text-zinc-600 focus:ring-hot"
        />
        <button type="submit" disabled={saving} className={BTN}>
          {saving ? "Saving…" : "Continue"}
        </button>
        {error && <p className="text-center text-[13px] text-red-400">{error}</p>}
      </form>

      <p className="mt-5 text-center text-[13px] leading-relaxed text-zinc-500">
        B-line uses your location to put you on the trail map and keep the crowd
        map live. You can turn sharing off any time in Friends.
      </p>
    </Shell>
  );
}

export default function Onboarding({ userId }: { userId?: string }) {
  return userId ? <UsernamePicker userId={userId} /> : <Welcome />;
}
