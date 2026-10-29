import { SUPABASE_URL } from "@/lib/supabase";

// Walkable 3D scans of real trail stretches (Gaussian splats), shown in
// /walkthrough/:id. The real capture lives in Supabase Storage at a fixed path
// per id, put there by `npm run add-walk` -- so a new scan goes live without an
// app release. Until one exists the viewer loads a clearly-labelled test splat,
// never passed off as the BeltLine.

export type Walkthrough = {
  id: string;
  title: string;
  /** Spot screens that offer this walkthrough. */
  spotIds: string[];
};

// MIT-licensed sample from the PlayCanvas engine repo via jsDelivr, pinned to
// the installed engine version. 2.5 MB, so it loads fast on a phone.
export const SAMPLE_SPLAT =
  "https://cdn.jsdelivr.net/gh/playcanvas/engine@v2.21.3/examples/assets/splats/biker.compressed.ply";

export const scanUrl = (id: string) => `${SUPABASE_URL}/storage/v1/object/public/walkthroughs/${id}.sog`;

export const WALKTHROUGHS: Walkthrough[] = [
  { id: "ponce-krog", title: "Ponce City Market → Krog Street Tunnel", spotIds: ["ponce-city", "krog-street"] },
];

export const walkthroughForSpot = (spotId: string) => WALKTHROUGHS.find((w) => w.spotIds.includes(spotId));
