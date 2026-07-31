import { useEffect, useRef, useState } from "react";

export interface LivePosition {
  lng: number;
  lat: number;
  heading: number | null; // device-reported heading, if available
  accuracy: number;
}

// Continuously-updating device position via watchPosition (not a one-shot
// getCurrentPosition call). Tracks only while `active` is true so callers can
// toggle it off to save battery.
export function useLiveLocation(active: boolean) {
  const [position, setPosition] = useState<LivePosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !navigator.geolocation) {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      return;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setError(null);
        setPosition({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    };
  }, [active]);

  return { position, error };
}
