import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Sliding carousel: swipe manually, auto-advances, HT-style dots pill.
export default function PhotoCarousel({ imgs, alt, className = "" }: { imgs: string[]; alt: string; className?: string }) {
  const [i, setI] = useState(0);
  const n = imgs.length;

  useEffect(() => {
    if (n < 2) return;
    const t = setTimeout(() => setI((i + 1) % n), 4200);
    return () => clearTimeout(t);
  }, [i, n]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="flex h-full w-full"
        animate={{ x: `-${i * 100}%` }}
        transition={{ type: "tween", duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        drag={n > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.x < -50 || info.velocity.x < -400) setI(Math.min(n - 1, i + 1));
          else if (info.offset.x > 50 || info.velocity.x > 400) setI(Math.max(0, i - 1));
        }}
      >
        {imgs.map((src) => (
          <img key={src} src={src} alt={alt} draggable={false} className="h-full w-full shrink-0 object-cover" />
        ))}
      </motion.div>
      {n > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1.5">
            {imgs.map((_, d) => (
              <span key={d}
                className={`rounded-full bg-white transition-all duration-300 ${d === i ? "h-1.5 w-4" : "h-1.5 w-1.5 opacity-60"}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
