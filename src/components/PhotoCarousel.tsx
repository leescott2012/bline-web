import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Auto-advancing crossfade carousel with HotelTonight-style dots.
export default function PhotoCarousel({ imgs, alt, className = "" }: { imgs: string[]; alt: string; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (imgs.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % imgs.length), 3500);
    return () => clearInterval(t);
  }, [imgs.length]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence initial={false}>
        <motion.img
          key={i}
          src={imgs[i]}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.7 }, scale: { duration: 3.6, ease: "linear" } }}
        />
      </AnimatePresence>
      {imgs.length > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1.5">
          {imgs.map((_, d) => (
            <span key={d}
              className={`rounded-full bg-white transition-all duration-300 ${d === i ? "h-1.5 w-4" : "h-1.5 w-1.5 opacity-60"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
