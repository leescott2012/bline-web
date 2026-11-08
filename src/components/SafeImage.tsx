import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

// <img> that never leaves a blank hole. A spot with no photo (empty string in
// the database) or a photo that fails to load (dead link, offline, blocked)
// shows a quiet placeholder instead of an empty box.
export default function SafeImage({
  src, alt, className = "", draggable, loading,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  draggable?: boolean;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState(false);
  const clean = typeof src === "string" ? src.trim() : "";

  // A new src gets a fresh attempt.
  useEffect(() => { setFailed(false); }, [clean]);

  if (!clean || failed) {
    return (
      <div
        role="img"
        aria-label={alt ? `${alt} (no photo)` : "No photo"}
        className={`grid place-items-center bg-zinc-800 text-zinc-500 ${className}`}
      >
        <ImageOff size={22} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={clean}
      alt={alt}
      draggable={draggable}
      loading={loading}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
