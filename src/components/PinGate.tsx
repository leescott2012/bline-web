import { useEffect, useState } from "react";
import { signOut, useAuth } from "@/lib/auth";
import { hasPin, setPin, verifyPin, removePin, isUnlocked, markUnlocked, lockNow, setupDismissed, dismissSetup } from "@/lib/pinLock";

// 4-digit PIN that unlocks B-line on this device (see lib/pinLock.ts). Never signs anyone in by itself.
const APP = "bline";
const BACKGROUND_RELOCK_MS = 5 * 60 * 1000;

function Pad({ title, subtitle, error, disabled, onDigits, footer }: {
  title: string; subtitle?: string; error?: string | null; disabled?: boolean;
  onDigits: (pin: string) => void; footer?: React.ReactNode;
}) {
  const [digits, setDigits] = useState("");
  useEffect(() => { setDigits(""); }, [title, error]);
  const press = (d: string) => {
    if (disabled) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) onDigits(next);
  };
  const key = "grid size-[72px] place-items-center rounded-full bg-panel text-[26px] text-white ring-1 ring-line active:bg-white/10";
  return (
    <div className="fixed inset-0 z-[800] flex flex-col items-center justify-center gap-5 bg-black px-6">
      <p className="text-[20px] font-extrabold text-white">{title}</p>
      {subtitle && <p className="max-w-[280px] text-center text-[13px] text-zinc-400">{subtitle}</p>}
      <div className="my-1 flex gap-3.5" aria-label={`${digits.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`size-3.5 rounded-full border-[1.5px] border-hot ${i < digits.length ? "bg-hot" : ""}`} />
        ))}
      </div>
      <p role="alert" className="min-h-[18px] text-center text-[12px] text-red-400">{error || ""}</p>
      <div className={`grid grid-cols-3 gap-3.5 ${disabled ? "opacity-40" : ""}`}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} onClick={() => press(d)} className={key}>{d}</button>
        ))}
        <span />
        <button onClick={() => press("0")} className={key}>0</button>
        <button onClick={() => setDigits(digits.slice(0, -1))} aria-label="Delete" className={`${key} !text-[18px]`}>⌫</button>
      </div>
      {footer}
    </div>
  );
}

export default function PinGate() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const [locked, setLocked] = useState(() => !!uid && hasPin(APP, uid) && !isUnlocked(APP));
  const [setup, setSetup] = useState<"off" | "choose" | "confirm">("off");
  const [first, setFirst] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (!uid) { setLocked(false); setSetup("off"); return; }
    if (hasPin(APP, uid)) { setLocked(!isUnlocked(APP)); setSetup("off"); }
    else if (!setupDismissed(APP, uid)) setSetup("choose");
  }, [uid]);

  useEffect(() => {
    let hiddenAt = 0;
    const onVis = () => {
      if (document.hidden) { hiddenAt = Date.now(); return; }
      if (hiddenAt && Date.now() - hiddenAt > BACKGROUND_RELOCK_MS && uid && hasPin(APP, uid)) { lockNow(APP); setLocked(true); }
      hiddenAt = 0;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [uid]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  if (!uid) return null;
  const linkBtn = "mt-2 text-[12px] text-zinc-400";

  if (locked) {
    return (
      <Pad
        title="Enter your PIN"
        error={wait > 0 ? `Too many tries. Wait ${wait}s.` : error}
        disabled={wait > 0}
        onDigits={async (pin) => {
          const r = await verifyPin(APP, uid, pin);
          if (r.ok) { markUnlocked(APP); setLocked(false); setError(null); return; }
          if (r.forceSignOut) { await signOut(); return; }   // 5 wrong PINs: back to a full code sign-in
          setWait(r.waitSeconds);
          setError(`Wrong PIN. ${r.remaining} tries left.`);
        }}
        footer={<button className={linkBtn} onClick={() => { removePin(APP, uid); void signOut(); }}>Forgot PIN? Sign in with a code</button>}
      />
    );
  }

  if (setup !== "off") {
    return (
      <Pad
        title={setup === "choose" ? "Set a 4-digit PIN" : "Confirm your PIN"}
        subtitle={setup === "choose" ? "Unlock B-line quickly on this device. You'll still use a code to sign in on a new device." : undefined}
        error={error}
        onDigits={async (pin) => {
          if (setup === "choose") { setFirst(pin); setError(null); setSetup("confirm"); return; }
          if (pin !== first) { setError("PINs didn't match. Try again."); setFirst(""); setSetup("choose"); return; }
          await setPin(APP, uid, pin);
          markUnlocked(APP);
          setSetup("off");
        }}
        footer={<button className={linkBtn} onClick={() => { dismissSetup(APP, uid); setSetup("off"); }}>Not now</button>}
      />
    );
  }
  return null;
}
