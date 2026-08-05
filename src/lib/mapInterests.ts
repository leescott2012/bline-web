import { useSyncExternalStore } from "react";

// Map interest categories for B-line. Inspired by the official BeltLine map
// but curated for a discovery + navigation app (not a comprehensive city guide).
// We exclude "Transit" and "Throne" to keep the app focused and uncluttered.

export type Interest = "dining" | "parks" | "art" | "trail-access" | "marketplace";

export interface InterestDef {
  id: Interest;
  label: string;
  description: string;
  color: string; // marker colour
  /** Which spot categories belong to this interest. */
  match: RegExp;
}

// Spot categories are free text ("Cafe · Cocktail bar", "Juice bar"), so the
// mapping is a regex per interest rather than an enum. Order matters: parks,
// art and trail access are checked before dining, because "Beer garden" is
// dining and "Sculpture garden" is not.
export function interestOf(category: string): Interest {
  const c = category ?? "";
  for (const id of ["parks", "art", "trail-access"] as Interest[]) {
    if (INTERESTS[id].match.test(c)) return id;
  }
  // Dining is the fallback, not another regex. This is a food-and-drink
  // corridor: 33 of 120 categories ("Dumplings", "Fine dining", "Indian",
  // "Hot dogs") matched no keyword list and were silently dropped off the map.
  return "dining";
}

export const INTERESTS: Record<Interest, InterestDef> = {
  dining: {
    id: "dining",
    label: "Dining",
    description: "Restaurants, cafes, breweries, and bars",
    color: "#e11d48",
    match: /eat|restaurant|cafe|coffee|brewer|bar|pizza|barbecue|bbq|burger|taco|sushi|thai|chinese|mexican|bakery|bagel|juice|smoothie|ice cream|gelato|dessert|deli|diner|kitchen|grill|tavern|food|steak|seafood|charcuterie|wine|cocktail/i,
  },

  parks: {
    id: "parks",
    label: "Parks",
    description: "Public parks and green spaces",
    color: "#16a34a",
    match: /park|garden|green|lawn|nature|preserve/i,
  },

  art: {
    id: "art",
    label: "Public Art",
    description: "Murals, sculptures, and installations",
    color: "#9333ea",
    match: /art|mural|sculpture|gallery|installation/i,
  },

  marketplace: {
    id: "marketplace",
    label: "Markets",
    description: "Shopping and dining districts along the trail",
    color: "#ea580c",
    match: /market|district|yards|provisions/i,
  },

  "trail-access": {
    id: "trail-access",
    label: "Trail Access",
    description: "Parking and trail entry points",
    color: "#2563eb",
    match: /trail|access|parking|entry|trailhead|station/i,
  },

};

// State management: which interests are currently visible on the map
const KEY = "bline:mapInterests";
const DEFAULTS = {
  // Nothing is on by default: the map shows what you ask it to show. The empty
  // state prompts you to choose rather than sitting blank.
  dining: false,
  parks: false,
  art: false,
  "trail-access": false,
  marketplace: false,
} as Record<Interest, boolean>;

let state = load();
const listeners = new Set<() => void>();

function load(): Record<Interest, boolean> {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}

function emit() {
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function toggleInterest(interest: Interest) {
  state = { ...state, [interest]: !state[interest] };
  emit();
}

export function setInterests(interests: Partial<Record<Interest, boolean>>) {
  state = { ...state, ...interests };
  emit();
}

export function resetInterests() {
  state = { ...DEFAULTS };
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useMapInterests(): Record<Interest, boolean> {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

// Helper to get active interests
export function getActiveInterests(state: Record<Interest, boolean>): Interest[] {
  return (Object.keys(state) as Interest[]).filter((k) => state[k]);
}
