import { useSyncExternalStore } from "react";

// localStorage-backed favorites. Module store + useSyncExternalStore so every
// heart + the Saved tab stay in sync. ponytail: no backend needed for a prototype.
const KEY = "bline:favs";
let favs: string[] = load();
const listeners = new Set<() => void>();

function load(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function emit() {
  localStorage.setItem(KEY, JSON.stringify(favs));
  listeners.forEach((l) => l());
}

export function toggleFav(id: string) {
  favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  emit();
}

export function isFav(id: string) {
  return favs.includes(id);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// returns the current favorites array (stable ref until it changes)
export function useFavorites() {
  return useSyncExternalStore(subscribe, () => favs, () => favs);
}
