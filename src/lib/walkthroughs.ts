// Walkable 3D scans of real trail stretches (Gaussian splats), shown in
// /walkthrough/:id. Until a stretch is actually filmed, its `scan` is null and
// the viewer loads a clearly-labelled test splat so the pipeline can be checked
// end to end -- never passed off as the BeltLine.

export type Walkthrough = {
  id: string;
  title: string;
  /** Spot screens that offer this walkthrough. */
  spotIds: string[];
  /** Public URL of the real capture (.sog / .compressed.ply / .ply), once uploaded. */
  scan: string | null;
};

// MIT-licensed sample from the PlayCanvas engine repo via jsDelivr, pinned to the installed
// engine version. 2.5 MB, so it loads fast on a phone.
export const SAMPLE_SPLAT =
  "https://cdn.jsdelivr.net/gh/playcanvas/engine@v2.21.3/examples/assets/splats/biker.compressed.ply";

export const WALKTHROUGHS: Walkthrough[] = [
  {
    id: "ponce-krog",
    title: "Ponce City Market → Krog Street Tunnel",
    spotIds: ["ponce-city", "krog-street"],
    // ponytail: paste the Supabase Storage public URL here once Lee's capture is processed.
    scan: null,
  },
];

export const walkthroughForSpot = (spotId: string) => WALKTHROUGHS.find((w) => w.spotIds.includes(spotId));
