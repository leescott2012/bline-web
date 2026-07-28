import { useSyncExternalStore } from "react";
import { distM, isOpenNow, walkMinutesFromTrail, type Spot } from "@/lib/data";

// localStorage-backed Explore search/filter/sort state. Same module-store +
// useSyncExternalStore pattern as favorites.ts / mapStyle.ts — no Redux/Context.
export type SortKey = "recommended" | "rating" | "nearest";

export interface ExploreFilters {
  query: string;
  category: string | null; // null = all categories
  minRating: number; // 0 = Any
  maxWalkMinutes: number; // walk minutes from the BeltLine trail
  openNow: boolean;
  sort: SortKey;
}

// "Art & Murals" had zero real matches once category became live data —
// swapped for "Desserts" (gelato/bakery/bagel spots), which actually exists.
export const CATEGORIES = ["Breweries", "Eats", "Coffee", "Bars", "Desserts"] as const;

const KEY = "bline:exploreFilters";
const DEFAULTS: ExploreFilters = { query: "", category: null, minRating: 0, maxWalkMinutes: 10, openNow: false, sort: "recommended" };

let state: ExploreFilters = load();
const listeners = new Set<() => void>();

function load(): ExploreFilters {
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

export function setQuery(query: string) {
  state = { ...state, query };
  emit();
}
export function setCategory(category: string | null) {
  state = { ...state, category };
  emit();
}
export function setMinRating(minRating: number) {
  state = { ...state, minRating };
  emit();
}
export function setMaxWalkMinutes(maxWalkMinutes: number) {
  state = { ...state, maxWalkMinutes };
  emit();
}
export function setOpenNow(openNow: boolean) {
  state = { ...state, openNow };
  emit();
}
export function setSort(sort: SortKey) {
  state = { ...state, sort };
  emit();
}
// Filters-screen reset: keeps any active search query, clears the rest.
export function resetFilters() {
  state = { ...DEFAULTS, query: state.query };
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useExploreFilters(): ExploreFilters {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

// --- categorization + filtering ---

// category is free text ("Tex-Mex", "Coffee shop", "Cocktail bar · Restaurant")
// so bucket it into the 5 filter chips via keyword match, first match wins.
function categoryOf(spot: Spot): string {
  const c = spot.category.toLowerCase();
  if (/coffee/.test(c)) return "Coffee";
  if (/brewery|beer|taproom/.test(c)) return "Breweries";
  if (/gelato|bakery|bagel|\bice\b|dessert/.test(c)) return "Desserts";
  if (/juice/.test(c)) return "Eats"; // "Juice bar" isn't an alcohol bar
  if (/\bbar\b|cocktail|lounge|pub|tavern|speakeasy|whiskey/.test(c)) return "Bars";
  return "Eats";
}

export function matchesFilters(spot: Spot, f: ExploreFilters): boolean {
  if (f.category && categoryOf(spot) !== f.category) return false;
  if (spot.rating < f.minRating) return false;
  if (walkMinutesFromTrail(spot.lng, spot.lat) > f.maxWalkMinutes) return false;
  // ponytail: openNow defaults to false (not gating) even though the wireframe
  // shows it "on" by default — isOpenNow() is a same-day estimate with no real
  // opening-time data, and gating by default risks an empty list if a demo
  // happens outside typical hours. Real when the user explicitly flips it on.
  if (f.openNow && !isOpenNow(spot)) return false;
  const q = f.query.trim().toLowerCase();
  if (q && !spot.name.toLowerCase().includes(q) && !spot.category.toLowerCase().includes(q)) return false;
  return true;
}

const PONCE_CITY_MARKET: [number, number] = [-84.366, 33.7726];

export function sortSpots(list: Spot[], sort: SortKey): Spot[] {
  if (sort === "rating") return [...list].sort((a, b) => b.rating - a.rating);
  if (sort === "nearest")
    return [...list].sort(
      (a, b) => distM([a.lng, a.lat], PONCE_CITY_MARKET) - distM([b.lng, b.lat], PONCE_CITY_MARKET)
    );
  return list; // "recommended" = curated array order
}

export function applyFilters(list: Spot[], f: ExploreFilters): Spot[] {
  return sortSpots(list.filter((s) => matchesFilters(s, f)), f.sort);
}
