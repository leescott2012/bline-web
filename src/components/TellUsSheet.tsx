import { useState } from "react";
import { X } from "lucide-react";
import { reportBug } from "@/lib/bugReport";

// One sheet behind both "suggest a place" and "is this your business". They're
// the same shape -- a short note plus a way to reach the person -- and they
// land in the bug bin Lee already reads, so they reuse reportBug()'s source
// tag rather than earning a table and an admin screen each.
//
// Filter the bin by source: bline-suggest-place / bline-claim-business.
export default function TellUsSheet({
  open,
  onClose,
  title,
  blurb,
  placeholder,
  source,
  context,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  blurb: string;
  placeholder: string;
  source: string;
  context?: Record<string, unknown>;
}) {
  const [text, setText] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!open) return null;

  const send = async () => {
    if (!text.trim()) return;
    setFailed(false);
    // Contact goes in the message body as well as the context, so whoever
    // works the bin can see how to reply without expanding the row.
    const body = contact.trim() ? `${text.trim()}\n\nReach me at: ${contact.trim()}` : text.trim();
    const ok = await reportBug(source, body, { ...context, contact: contact.trim() || null });
    if (!ok) { setFailed(true); return; }
    setSent(true);
    setTimeout(() => {
      onClose();
      setSent(false);
      setText("");
      setContact("");
    }, 1400);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-panel p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-1 text-[13px] leading-snug text-zinc-400">{blurb}</p>
          </div>
          <button aria-label="Close" onClick={onClose} className="shrink-0 pt-1"><X size={20} /></button>
        </div>

        {/* No autoFocus anywhere in this app: on iOS it opens the keyboard
            before layout settles and WebKit scrolls the whole viewport up,
            taking the top of the sheet with it. See Onboarding.tsx. */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label={title}
          className="mt-3 h-28 w-full resize-none rounded-xl border border-line bg-ink p-3 text-[15px] outline-none focus:border-hot"
        />

        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email or phone (optional)"
          aria-label="Your email or phone"
          autoCapitalize="none"
          autoCorrect="off"
          className="mt-2 w-full rounded-xl border border-line bg-ink p-3 text-[15px] outline-none focus:border-hot"
        />

        {failed && <p className="mt-3 text-sm text-red-400">Couldn't send — try again in a moment.</p>}

        <button
          onClick={send}
          disabled={!text.trim() || sent}
          className="mt-3 w-full rounded-full bg-accent py-3 font-semibold disabled:opacity-50"
        >
          {sent ? "Sent — thank you! 🙌" : "Send"}
        </button>
      </div>
    </div>
  );
}
