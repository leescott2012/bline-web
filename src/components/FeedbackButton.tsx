import { useRef, useState } from "react";
import { Bug, X, ImagePlus } from "lucide-react";
import { reportBug } from "@/lib/bugReport";

// downscale an image file to a small JPEG data URL so it fits in the bug row
function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 1000;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.6));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const MAX_SCREENSHOTS = 4;

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [imgs, setImgs] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setText(""); setImgs([]); };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_SCREENSHOTS);
    e.target.value = ""; // allow re-picking the same file(s) later
    if (!files.length) return;
    const shrunk = await Promise.all(files.map(shrink));
    setImgs((prev) => [...prev, ...shrunk].slice(0, MAX_SCREENSHOTS));
  };

  const removeAt = (i: number) => setImgs((prev) => prev.filter((_, idx) => idx !== i));

  const send = async () => {
    if (!text.trim() && !imgs.length) return;
    setFailed(false);
    const ok = await reportBug("feedback", text.trim() || "(screenshot only)", imgs.length ? { screenshots: imgs } : undefined);
    if (!ok) { setFailed(true); return; }
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); reset(); }, 1200);
  };

  return (
    <>
      <button aria-label="Send feedback" onClick={() => setOpen(true)}
        className="absolute right-0 top-32 z-30 grid size-9 translate-x-[42%] place-items-center rounded-l-xl bg-black/40 pr-1.5 text-zinc-400 backdrop-blur active:translate-x-0">
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

            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFile} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {imgs.map((src, i) => (
                <div key={i} className="relative inline-block">
                  <img src={src} alt="attachment" className="h-24 rounded-lg border border-line object-cover" />
                  <button aria-label="Remove attachment" onClick={() => removeAt(i)}
                    className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-black text-white">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {imgs.length < MAX_SCREENSHOTS && (
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-zinc-300">
                  <ImagePlus size={16} /> Attach screenshot
                </button>
              )}
            </div>

            {failed && (
              <p className="mt-3 text-sm text-red-400">Couldn't send — try again in a moment.</p>
            )}

            <button onClick={send}
              className="mt-3 w-full rounded-full bg-accent py-3 font-semibold disabled:opacity-50"
              disabled={(!text.trim() && !imgs.length) || sent}>
              {sent ? "Sent — thank you! 🙌" : "Send feedback"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
