import { useEffect, useState } from "react";
import { ChevronLeft, Flame, Mail, MapPin, Smartphone, Users } from "lucide-react";
import { requestOtp, signOut, type OtpChannel, verifyOtp } from "@/lib/auth";
import { claimUsername } from "@/lib/friends";
import { refreshProfile } from "@/lib/profile";

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
const BTN = "w-full rounded-xl bg-hot py-3.5 text-[15px] font-semibold text-on-brand disabled:opacity-50";

function Shell({ children, onBack }: { children: React.ReactNode; onBack?: () => void }) {
  return (
    <div className="flex h-full flex-col px-7 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-11 shrink-0 items-center">
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="-ml-2.5 grid size-11 place-items-center rounded-full bg-white/10 text-white">
            <ChevronLeft size={26} />
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-center text-[26px] font-extrabold tracking-tight text-hot">Ⓑ B-line</p>
        {children}
      </div>
    </div>
  );
}

function isValidIdentifier(channel: OtpChannel, identifier: string) {
  if (channel === "email") return /^\S+@\S+\.\S+$/.test(identifier.trim());
  return /^\+[1-9]\d{7,14}$/.test(identifier.trim().replace(/[\s().-]/g, ""));
}

// Limits per browser, per method (email / text): 3 codes an hour, 30s between sends, 3 wrong guesses per code.
// Resend and "use a different email or number" both count as a send. Supabase throttles server-side too.
const MAX_SENDS = 3;
const MAX_WRONG = 3;
const WINDOW_MS = 60 * 60 * 1000;
const COOLDOWN_S = 30;

function recentSends(channel: OtpChannel): number[] {
  try {
    const all = JSON.parse(localStorage.getItem(`bline_otp_sends_${channel}`) || "[]") as number[];
    return all.filter((t) => Date.now() - t < WINDOW_MS);
  } catch { return []; }
}
function recordSend(channel: OtpChannel) {
  try { localStorage.setItem(`bline_otp_sends_${channel}`, JSON.stringify([...recentSends(channel), Date.now()])); } catch { /* server limits still apply */ }
}

function AuthCode({ onBack }: { onBack: () => void }) {
  const [channel, setChannel] = useState<OtpChannel>("email");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sends, setSends] = useState<number[]>(() => recentSends("email"));
  const [cooldown, setCooldown] = useState(0);
  const [wrong, setWrong] = useState(0);

  useEffect(() => { setSends(recentSends(channel)); }, [channel]);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const locked = sends.length >= MAX_SENDS;
  const minutesLeft = locked ? Math.max(1, Math.ceil((sends[0] + WINDOW_MS - Date.now()) / 60000)) : 0;
  const otherMethod = channel === "email" ? "text" : "email";

  const sendCode = async () => {
    if (recentSends(channel).length >= MAX_SENDS) { setSends(recentSends(channel)); return; }
    if (!isValidIdentifier(channel, identifier)) {
      setError(channel === "email" ? "Enter a valid email address." : "Enter a mobile number with country code, for example +14045551212.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: requestError } = await requestOtp(channel, identifier);
    if (requestError) {
      setError(requestError.message);
      setBusy(false);
      return;
    }
    recordSend(channel);
    setSends(recentSends(channel));
    setCode("");
    setWrong(0);
    setCooldown(COOLDOWN_S);
    setSent(true);
    setBusy(false);
  };

  const confirmCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the six-digit code.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: verificationError } = await verifyOtp(channel, identifier, code);
    if (verificationError) {
      const n = wrong + 1;
      setWrong(n);
      setCode("");
      if (n >= MAX_WRONG) {
        setSent(false);
        setError("Too many wrong codes. Request a new code.");
      } else {
        setError(`That code didn't work (${MAX_WRONG - n} tries left).`);
      }
      setBusy(false);
    }
  };

  const changeMethod = (nextChannel: OtpChannel) => {
    setChannel(nextChannel);
    setIdentifier("");
    setCode("");
    setSent(false);
    setError(null);
  };

  return (
    <Shell onBack={onBack}>
      <h1 className="mt-7 text-center text-[24px] font-bold">{sent ? "Enter your code" : "Sign in to B-line"}</h1>
      <p className="mt-1.5 text-center text-[14px] leading-relaxed text-zinc-400">
        {sent
          ? `We sent a six-digit code to ${identifier.trim()}.`
          : "Use a one-time code by email or text. No password required."}
      </p>

      {!sent ? (
        <>
          <div className="mt-7 grid grid-cols-2 gap-2 rounded-xl bg-panel p-1 ring-1 ring-line" role="tablist" aria-label="Verification method">
            <button type="button" onClick={() => changeMethod("email")} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-[14px] font-semibold ${channel === "email" ? "bg-hot text-on-brand" : "text-zinc-400"}`}>
              <Mail size={16} /> Email
            </button>
            <button type="button" onClick={() => changeMethod("phone")} className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-[14px] font-semibold ${channel === "phone" ? "bg-hot text-on-brand" : "text-zinc-400"}`}>
              <Smartphone size={16} /> Text
            </button>
          </div>
          {locked ? (
            <p className="mt-3 rounded-xl bg-panel px-4 py-3.5 text-[14px] leading-relaxed text-zinc-300 ring-1 ring-line">
              Too many codes sent by {channel === "email" ? "email" : "text"}. Try again in about {minutesLeft} min, or switch to <button type="button" onClick={() => changeMethod(otherMethod === "text" ? "phone" : "email")} className="font-semibold text-hot underline">{otherMethod}</button>.
            </p>
          ) : (
          <form onSubmit={(event) => { event.preventDefault(); void sendCode(); }} className="mt-3 space-y-2.5">
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              inputMode={channel === "phone" ? "tel" : "email"}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete={channel === "phone" ? "tel" : "email"}
              placeholder={channel === "email" ? "you@example.com" : "+1 404 555 1212"}
              aria-label={channel === "email" ? "Email address" : "Mobile number"}
              className="w-full rounded-xl bg-panel px-4 py-3.5 text-[15px] outline-none ring-1 ring-line placeholder:text-zinc-600 focus:ring-hot"
            />
            <button type="submit" disabled={busy || !identifier.trim()} className={BTN}>
              {busy ? "Sending code…" : `Send code by ${channel === "email" ? "email" : "text"}`}
            </button>
          </form>
          )}
          {channel === "phone" && <p className="mt-3 text-center text-[12px] leading-relaxed text-zinc-500">Text delivery requires an enabled SMS provider. Standard message rates may apply.</p>}
        </>
      ) : (
        <form onSubmit={confirmCode} className="mt-7 space-y-2.5">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            aria-label="Six-digit verification code"
            className="w-full rounded-xl bg-panel px-4 py-3.5 text-center text-[22px] tracking-[0.45em] outline-none ring-1 ring-line placeholder:tracking-[0.25em] placeholder:text-zinc-600 focus:ring-hot"
          />
          <button type="submit" disabled={busy || code.length !== 6} className={BTN}>{busy ? "Verifying…" : "Verify and continue"}</button>
          <button type="button" onClick={() => { setSent(false); setCode(""); setError(null); }} disabled={busy} className="w-full py-2 text-center text-[14px] font-semibold text-zinc-300">Use a different email or number</button>
          <button type="button" onClick={() => { void sendCode(); }} disabled={busy || cooldown > 0 || locked} className="w-full py-1 text-center text-[13px] text-zinc-500 disabled:opacity-50">
            {cooldown > 0 ? `Resend code in ${cooldown}s` : locked ? `No more resends. Try ${otherMethod} or wait ${minutesLeft} min` : "Resend code"}
          </button>
        </form>
      )}
      {error && <p role="alert" className="mt-3 text-center text-[13px] leading-relaxed text-red-400">{error}</p>}
    </Shell>
  );
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <Shell>
      <h1 className="mt-7 text-center text-[24px] font-bold leading-tight">Everything happening<br />on the BeltLine</h1>
      <ul className="mx-auto mt-7 space-y-3.5">
        {[
          { icon: MapPin, text: "Turn-by-turn walking directions" },
          { icon: Users, text: "See friends on the trail, live" },
          { icon: Flame, text: "Know where the crowd is before you go" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-hot/15 text-hot"><Icon size={17} /></span><span className="text-[15px] text-zinc-300">{text}</span></li>
        ))}
      </ul>
      <div className="mt-9">
        <button onClick={onStart} className={BTN}>Get started</button>
        <p className="mt-2 text-center text-[13px] text-zinc-500">Sign in securely with a one-time code by email or text.</p>
      </div>
      <button onClick={onStart} className="mt-5 w-full py-2 text-center text-[14px] font-semibold text-zinc-300">Already have an account? Sign in</button>
    </Shell>
  );
}

function UsernamePicker({ userId }: { userId: string }) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const handle = username.trim().toLowerCase();
    if (!USERNAME_RE.test(handle)) {
      setError("3–20 characters: letters, numbers, underscore or dot.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: claimError } = await claimUsername(userId, handle, displayName.trim() || handle);
    if (claimError) {
      setError(claimError.code === "23505" ? "That username is taken." : claimError.message);
      setSaving(false);
      return;
    }
    await refreshProfile(userId);
  };

  return (
    <Shell onBack={() => { void signOut(); }}>
      <h1 className="mt-7 text-center text-[24px] font-bold">Pick your username</h1>
      <p className="mt-1.5 text-center text-[14px] text-zinc-400">This is how friends find you on B-line.</p>
      <form onSubmit={submit} className="mt-7 space-y-2.5">
        <div className="flex items-center rounded-xl bg-panel px-4 ring-1 ring-line focus-within:ring-hot"><span className="text-zinc-500">@</span><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="yourname" autoCapitalize="none" autoCorrect="off" aria-label="Username" className="w-full bg-transparent py-3.5 pl-1 text-[15px] outline-none placeholder:text-zinc-600" /></div>
        <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Display name (optional)" aria-label="Display name" className="w-full rounded-xl bg-panel px-4 py-3.5 text-[15px] outline-none ring-1 ring-line placeholder:text-zinc-600 focus:ring-hot" />
        <button type="submit" disabled={saving} className={BTN}>{saving ? "Saving…" : "Continue"}</button>
        {error && <p className="text-center text-[13px] text-red-400">{error}</p>}
      </form>
      <p className="mt-3 text-center text-[13px] leading-relaxed text-zinc-500">B-line uses your location to put you on the trail map and keep the crowd map live. You can turn sharing off any time in Friends.</p>
    </Shell>
  );
}

export default function Onboarding({ userId }: { userId?: string }) {
  const [authOpen, setAuthOpen] = useState(false);
  if (userId) return <UsernamePicker userId={userId} />;
  if (authOpen) return <AuthCode onBack={() => setAuthOpen(false)} />;
  return <Welcome onStart={() => setAuthOpen(true)} />;
}
