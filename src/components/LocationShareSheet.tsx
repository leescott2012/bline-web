import { X } from "lucide-react";

// The per-friend consent step. Shown right after you accept someone's friend
// request -- accepting does NOT by itself share your location; only tapping
// "Share" here does, via grantLocationShare() in src/lib/friends.ts writing a
// location_shares row. "Not now" leaves the friendship accepted with no grant
// written -- there's nothing to undo.
//
// Same bottom-sheet shell as TellUsSheet.tsx / FeedbackButton.tsx (dark scrim
// + rounded-t-3xl panel) for visual consistency, with two side-by-side
// choices instead of a text form.
export default function LocationShareSheet({
  open,
  onClose,
  username,
  onShare,
}: {
  open: boolean;
  onClose: () => void;
  username: string;
  onShare: () => void;
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-panel p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold">Share your location with @{username}?</h2>
            <p className="mt-1 text-[13px] leading-snug text-zinc-400">
              They'll see your live position on the map while you're both signed in.
              You can revoke this anytime from Friends.
            </p>
          </div>
          <button aria-label="Close" onClick={onClose} className="shrink-0 pt-1"><X size={20} /></button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-line py-3 font-semibold text-zinc-100"
          >
            Not now
          </button>
          <button
            onClick={onShare}
            className="flex-1 rounded-full bg-accent py-3 font-semibold"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
