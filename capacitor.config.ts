import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Must match PRODUCT_BUNDLE_IDENTIFIER in the Xcode project. It didn't
  // ("com.bline.app" here vs "com.blineatlanta.app" there), so every
  // `simctl launch com.bline.app` was addressing an app that never existed.
  appId: "com.blineatlanta.app",
  appName: "B-line",
  webDir: "dist",
  ios: {
    // "never": hand safe-area insetting entirely to CSS env(safe-area-inset-*)
    // (the pattern already used for every bottom bar). "always" was fighting
    // that — it doesn't reach position:absolute/fixed headers at all (Home's
    // search bar, MapView's/Navigate's floating headers), which is why they
    // rendered flush under the status bar/Dynamic Island.
    contentInset: "never",
    // The web layer never scrolls: html/body/#root are position:fixed and the
    // panes inside scroll themselves. Leaving the WKWebView's own scroll view
    // live let the whole app be dragged around, which is what "the screen
    // moves, it's not locked" was. Note this does NOT stop WebKit scrolling a
    // focused input into view -- that one is fixed by not autofocusing.
    scrollEnabled: false,
  },
};

export default config;
