import { useState } from "react";
import { Bug, X } from "lucide-react";
import { reportBug } from "@/lib/bugReport";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!text.trim()) return;
    await reportBug("feedback", text.trim());
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); setText(""); }, 1200);
  };

  return (
    <>
      <button aria-label="Send feedback" onClick={() => setOpen(true)}
        className="absolute right-3 top-1/2 z-30 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-zinc-400 backdrop-blur">
        <Bug size={16} />
      </button>
      {open && (
        <div className="absolute inset-0 z-40 flex items-end bg-black/60" onClick={() => setOpen(false)}>
          <div className="w-full rounded-t-3xl bg-panel p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Found a bug? Tell us</h2>
              <button aria-label="Close" onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)}
              placeholder="What happened / what looked off?"
              className="mt-3 h-28 w-full resize-none rounded-xl border border-line bg-ink p-3 text-[15px] outline-none" />
            <button onClick={send}
              className="mt-3 w-full rounded-full bg-accent py-3 font-semibold disabled:opacity-50"
              disabled={!text.trim() || sent}>
              {sent ? "Sent — thank you! 🙌" : "Send feedback"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
