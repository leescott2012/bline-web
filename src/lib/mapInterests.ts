import { useSyncExternalStore } from "react";

// Map interest categories for B-line. Inspired by the official BeltLine map
// but curated for a discovery + navigation app (not a comprehensive city guide).
// We exclude "Transit" and "Throne" to keep the app focused and uncluttered.

export type Interest = "dining" | "parks" | "art" | "trail-access";

export interface InterestDef {
  id: Interest;
  label: string;
  icon: string;
  description: string;
  color: string; // Tailwind class or hex
}

export const INTERESTS: Record<Interest, InterestDef> = {
  dining: {
    id: "dining",
    label: "Dining & Drinks",
    icon: "🍽️",
    description: "Restaurants, cafes, breweries, and bars",
    color: "text-red-500",
  },
  parks: {
    id: "parks",
    label: "Parks",
    icon: "🌳",
    description: "Public parks and green spaces",
    color: "text-green-500",
  },
  art: {
    id: "art",
    label: "Public Art",
    icon: "🎨",
    description: "Murals, sculptures, and installations",
    color: "text-purple-500",
  },
  "trail-access": {
    id: "trail-access",
    label: "Trail Access",
    icon: "🚶",
    description: "Parking and trail entry points",
    color: "text-blue-500",
  },
};

// State management: which interests are currently visible on the map
const KEY = "bline:mapInterests";
const DEFAULTS = {
  dining: true,
  parks: true,
  art: false,
  "trail-access": false,
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
