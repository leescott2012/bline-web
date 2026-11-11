import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";

// <img> that never leaves a blank hole. A spot with no photo (empty string in
// the database) or a photo that fails to load shows a quiet placeholder instead
// of an empty box. A failed photo is retried once first (flaky mobile networks)
// before the placeholder appears.
export default function SafeImage({
  src, alt, className = "", draggable, loading, decoding,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  draggable?: boolean;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
}) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clean = typeof src === "string" ? src.trim() : "";

  // A new src gets a fresh attempt; never leave a retry timer running.
  useEffect(() => {
    setFailed(false);
    setAttempt(0);
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [clean]);

  if (!clean || failed) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} (no photo)` : "No photo"}
        // Drop any bg-* the caller set for the loading state so it can't fight the placeholder fill.
        className={`grid place-items-center bg-zinc-800 text-zinc-500 ${className.replace(/\bbg-\S+/g, "")}`}
      >
        <ImageOff size={22} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      // Changing the key remounts the <img>, which makes the browser fetch again.
      key={attempt}
      src={clean}
      alt={alt}
      draggable={draggable}
      loading={loading}
      decoding={decoding}
      onError={() => {
        if (attempt === 0) {
          retryTimer.current = setTimeout(() => setAttempt(1), 1500);
        } else {
          setFailed(true);
        }
      }}
      className={className}
    />
  );
}
