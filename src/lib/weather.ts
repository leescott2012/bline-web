import { useEffect, useState } from "react";

export interface WeatherNow {
  tempF: number;
  label: string;
  code: number;
}

// WMO weather codes (Open-Meteo's current_weather.weathercode)
const CODE_LABEL: Record<number, string> = {
  0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "overcast",
  45: "foggy", 48: "foggy",
  51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
  56: "freezing drizzle", 57: "freezing drizzle",
  61: "light rain", 63: "rain", 65: "heavy rain",
  66: "freezing rain", 67: "freezing rain",
  71: "light snow", 73: "snow", 75: "heavy snow", 77: "snow grains",
  80: "rain showers", 81: "rain showers", 82: "heavy showers",
  85: "snow showers", 86: "snow showers",
  95: "thunderstorms", 96: "thunderstorms", 99: "thunderstorms",
};

// Ponce City Market — representative point for the Eastside Trail corridor
const LAT = 33.7726, LON = -84.366;

let cache: WeatherNow | null = null;
let inflight: Promise<WeatherNow | null> | null = null;

async function fetchWeather(): Promise<WeatherNow | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&temperature_unit=fahrenheit`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const cw = data.current_weather;
    if (!cw) return null;
    return { tempF: Math.round(cw.temperature), label: CODE_LABEL[cw.weathercode] ?? "—", code: cw.weathercode };
  } catch {
    return null; // offline / blocked — caller shows "unavailable", never a made-up reading
  }
}

// Real current conditions from Open-Meteo (free, no API key, CORS-enabled for
// client-side use). Cached at module scope so re-mounting the panel doesn't
// refetch every time. `undefined` = still loading, `null` = failed.
export function useWeatherNow(): WeatherNow | null | undefined {
  const [weather, setWeather] = useState<WeatherNow | null | undefined>(cache ?? undefined);
  useEffect(() => {
    if (cache) return;
    if (!inflight) inflight = fetchWeather().then((w) => { cache = w; return w; });
    inflight.then(setWeather);
  }, []);
  return weather;
}
