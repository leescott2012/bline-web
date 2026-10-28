/// <reference types="vite/client" />

// PlayCanvas ships its controller scripts as untyped .mjs.
declare module "playcanvas/scripts/esm/camera-controls.mjs" {
  export const CameraControls: typeof import("playcanvas").Script;
}
