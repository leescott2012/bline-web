import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bline.app",
  appName: "B-line",
  webDir: "dist",
  // "never": hand safe-area insetting entirely to CSS env(safe-area-inset-*)
  // (the pattern already used for every bottom bar). "always" was fighting
  // that — it doesn't reach position:absolute/fixed headers at all (Home's
  // search bar, MapView's/Navigate's floating headers), which is why they
  // rendered flush under the status bar/Dynamic Island.
  ios: { contentInset: "never" },
};

export default config;
