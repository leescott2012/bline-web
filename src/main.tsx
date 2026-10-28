import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { initSentry } from "./lib/sentry";
import { setWorkerUrl } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

initSentry();

// MapLibre 6 finds its worker next to its own module via import.meta.url. Once
// Vite bundles it that file isn't there, and inside the native app the
// capacitor:// origin fails its http(s) check -> no worker, blank map. Point it
// at a worker Vite emits as plain .js (older iOS serves .mjs as
// octet-stream, which a module worker refuses).
setWorkerUrl(maplibreWorkerUrl);

// Keep the app shell inside the *visible* viewport, not the layout viewport.
//
// When the keyboard opens, iOS shrinks the visual viewport and offsets it, but
// #root is position:fixed and therefore sized to the layout viewport, which
// doesn't change. The shell stays full height, part of it sits under the
// keyboard, and WebKit scrolls the document to reveal the focused field --
// dragging the header, and the only way off the screen, out of view.
//
// Measured on device at the moment the username field takes focus:
//   back button y   62  ->  -4     (off the top)
//   window.scrollY   0  ->  66
//   innerHeight    874  -> 808
//   visualViewport.offsetTop 0 -> 66
//   #root height   874  -> 874     <- the bug: shell never shrank
//
// Sizing the shell to the visual viewport means the focused field is already
// on screen, so there is nothing for WebKit to scroll. Fixes it everywhere a
// keyboard opens, not just onboarding.
const vv = window.visualViewport;
if (vv) {
  // Only write when the numbers actually change. visualViewport fires `scroll`
  // for momentum and pinch as well as the keyboard, and re-setting these on
  // every event resizes the shell mid-gesture -- which reads as the screen
  // jumping. Rounded so sub-pixel jitter doesn't count as a change either.
  let lastTop = -1;
  let lastHeight = -1;
  const fitToKeyboard = () => {
    const top = Math.round(vv.offsetTop);
    const height = Math.round(vv.height);
    if (top === lastTop && height === lastHeight) return;
    lastTop = top;
    lastHeight = height;
    const s = document.documentElement.style;
    s.setProperty("--vv-top", `${top}px`);
    s.setProperty("--vv-height", `${height}px`);
    if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0);
  };
  vv.addEventListener("resize", fitToKeyboard);
  vv.addEventListener("scroll", fitToKeyboard);
  fitToKeyboard();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
