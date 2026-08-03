import { useCallback, useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { supabase } from "./supabase";

// Live location sharing. Writes are upserts against one row per user, so there
// is no location history to store or leak -- only "where you are now".
//
// Visibility is NOT decided here: RLS on `locations` checks for an unexpired
// grant in `location_shares` AND the owner's profiles.sharing_enabled. Anything
// this module reads back is already filtered server-side.

export interface FriendLocation {
  user_id: string;
  lng: number;
  lat: number;
  battery: number | null;
  updated_at: string;
}

// How often we push a fresh fix while sharing is on. Frequent enough to feel
// live on a walk, slow enough not to drain the battery we're reporting.
const PUBLISH_MS = 20_000;

async function batteryPercent(): Promise<number | null> {
  // Only the native app can read battery on iOS -- Safari removed the web
  // Battery API entirely. Web returns null, which renders as "unknown".
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const info = await Device.getBatteryInfo();
    return info.batteryLevel == null ? null : Math.round(info.batteryLevel * 100);
  } catch {
    return null;
  }
}

export async function publishLocation(userId: string, lng: number, lat: number, accuracy?: number) {
  const battery = await batteryPercent();
  return supabase.from("locations").upsert(
    { user_id: userId, lng, lat, accuracy: accuracy ?? null, battery, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
}

export async function clearLocation(userId: string) {
  return supabase.from("locations").delete().eq("user_id", userId);
}

// Pushes this device's position on an interval while `active`. Stops cleanly
// when sharing is switched off so we never keep a stale watch running.
export function usePublishLocation(userId: string | undefined, active: boolean) {
  useEffect(() => {
    if (!userId || !active || !navigator.geolocation) return;
    let stopped = false;

    const push = () => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          if (!stopped) publishLocation(userId, coords.longitude, coords.latitude, coords.accuracy);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    push();
    const id = setInterval(push, PUBLISH_MS);
    return () => { stopped = true; clearInterval(id); };
  }, [userId, active]);
}

// Friends' positions. RLS means this only ever returns people who granted us an
// unexpired share and haven't gone invisible -- no client-side filtering needed.
export function useFriendLocations(enabled: boolean) {
  const [locations, setLocations] = useState<FriendLocation[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("locations")
      .select("user_id, lng, lat, battery, updated_at");
    setLocations((data as FriendLocation[]) ?? []);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    // Realtime pushes each friend's move straight to the map; the interval is a
    // backstop for a dropped socket rather than the primary path.
    const channel = supabase
      .channel("friend-locations")
      .on("postgres_changes", { event: "*", schema: "public", table: "locations" }, load)
      .subscribe();
    const id = setInterval(load, 45_000);
    return () => { supabase.removeChannel(channel); clearInterval(id); };
  }, [enabled, load]);

  return locations;
}

export function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
