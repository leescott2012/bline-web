import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bline.app",
  appName: "B-line",
  webDir: "dist",
  ios: { contentInset: "always" },
};

export default config;
