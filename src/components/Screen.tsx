import type { ReactNode } from "react";
import { motion } from "framer-motion";

// Full-height mobile screen with slide-in transition; phone frame on desktop via App.
export default function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.main
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`relative h-full overflow-y-auto overflow-x-hidden bg-ink ${className}`}
    >
      {children}
    </motion.main>
  );
}
