export type StreetPreviewMode = "closed" | "peek" | "immersive" | "free-look";

export interface StreetScene {
  id: string;
  title: string;
  distanceLabel: string;
  captureLabel: string;
  providerLabel: string;
  note: string;
  /** Used by a future panorama adapter to align the scene to route heading. */
  northOffsetDegrees: number;
}

/**
 * The first Street Preview pilot is intentionally bounded to the Ponce route.
 * The visual is illustrative demo imagery until rights-cleared or B-line-owned
 * captures are connected through a real adapter.
 */
export function sceneForPreview(spotId: string | undefined, progress: number): StreetScene | null {
  if (spotId !== "ponce-city" || progress >= 0.92) return null;
  const feetAhead = Math.max(40, Math.round((1 - progress) * 180));
  return {
    id: "ponce-eastside-demo",
    title: "Street preview",
    distanceLabel: `${feetAhead} ft ahead`,
    captureLabel: "Demo imagery",
    providerLabel: "Illustrative corridor preview",
    note: "Use as orientation only; production capture is not connected yet.",
    northOffsetDegrees: 0,
  };
}

export function nextPreviewMode(mode: StreetPreviewMode): StreetPreviewMode {
  if (mode === "closed") return "peek";
  if (mode === "peek") return "immersive";
  if (mode === "immersive") return "free-look";
  return "immersive";
}
