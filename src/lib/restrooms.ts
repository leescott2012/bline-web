/**
 * City of Atlanta / Throne Labs restrooms announced along the BeltLine.
 *
 * Source announcement names the four localities but does not publish unit
 * coordinates. Each map point is therefore the nearest matching Atlanta
 * BeltLine Inc public ArcGIS trail-access anchor, not a claimed exact unit
 * location. The UI labels each pin "Near" its named locality accordingly.
 *
 * Source: https://beltline.org/blog/new-public-restrooms-coming-to-the-atlanta-beltline/
 * Verified: 2026-08-12
 */
export interface Restroom {
  id: string;
  name: string;
  lng: number;
  lat: number;
  detail: string;
  sourceUrl: string;
}

const SOURCE_URL = "https://beltline.org/blog/new-public-restrooms-coming-to-the-atlanta-beltline/";

export const restrooms: Restroom[] = [
  {
    id: "throne-piedmont-park",
    name: "Throne restroom — near Piedmont Park",
    lng: -84.370953,
    lat: 33.786165,
    detail: "Officially announced location; pin is the nearby BeltLine trail-access anchor.",
    sourceUrl: SOURCE_URL,
  },
  {
    id: "throne-lowery-bedford-pine",
    name: "Throne restroom — near Lowery–Bedford Pine",
    lng: -84.417302,
    lat: 33.774877,
    detail: "Officially announced location; pin is the nearby BeltLine trail-access anchor.",
    sourceUrl: SOURCE_URL,
  },
  {
    id: "throne-allene-avenue",
    name: "Throne restroom — near Allene Avenue",
    lng: -84.413548,
    lat: 33.725449,
    detail: "Officially announced location; pin is the nearby BeltLine trail-access anchor.",
    sourceUrl: SOURCE_URL,
  },
  {
    id: "throne-historic-fourth-ward-skatepark",
    name: "Throne restroom — near Historic Fourth Ward Skatepark",
    lng: -84.359583,
    lat: 33.764883,
    detail: "Officially announced location; pin is the nearby BeltLine trail-access anchor.",
    sourceUrl: SOURCE_URL,
  },
];
