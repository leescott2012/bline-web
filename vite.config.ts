import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  // MapLibre 6's worker is an ES module (see setWorkerUrl in main.tsx).
  worker: { format: "es" },
  server: {
    allowedHosts: true,
  },
});
