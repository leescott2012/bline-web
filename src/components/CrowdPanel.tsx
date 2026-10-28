import { Users, Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react";
import { useWeatherNow } from "@/lib/weather";
import type { Crowd } from "@/lib/crowd";

// The heat mode uses a short panel, styled from the Figma Trail Conditions
// screen. Live numbers come only from real B-line users sharing a location and
// real Open-Meteo weather; when either is missing the card says so instead of
// inventing a value. The peak window is a typical-pattern guess, not measured,
// and is labelled as an estimate. (A hand-drawn hourly graph used to sit here;
// removed rather than dress up invented numbers as a chart.)
const PEAK_WINDOW = "4–6 PM";

function weatherIcon(code: number) {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Sun;
}

export function CrowdMetrics({ crowd }: { crowd: Crowd }) {
  const weather = useWeatherNow();
  const { people, status } = crowd;
  // `people` counts B-line users sharing a location, not everyone on the trail.
  const crowdCard =
    status === "loading" ? { big: "…", small: "Checking live data" }
    : status === "unavailable" ? { big: "—", small: "Live crowd data unavailable" }
    : people > 0 ? { big: String(people), small: people === 1 ? "B-line user sharing now" : "B-line users sharing now" }
    : { big: "—", small: "Not enough live data yet" };
  const weatherCard =
    weather === undefined ? { icon: null, big: "…", small: "Checking weather" }
    : weather === null ? { icon: null, big: "—", small: "Weather unavailable" }
    : { icon: weatherIcon(weather.code), big: `${weather.tempF}°F`, small: weather.label };

  const metrics = [
    { key: "crowd", icon: Users, ...crowdCard, edge: true },
    { key: "weather", ...weatherCard, edge: false },
  ];

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {metrics.map(({ key, icon: Icon, big, small, edge }) => (
        <div key={key} className={`min-w-0 rounded-[24px] bg-white/95 px-2.5 py-3 text-center shadow-lg backdrop-blur ${edge ? "border-[3px] border-fuchsia-500" : "border border-white/70"}`}>
          <div className="flex items-center justify-center gap-1.5">
            {Icon && <Icon size={20} className="shrink-0 text-fuchsia-500" />}
            <p className="truncate text-[15px] font-extrabold leading-tight text-[#101014]">{big}</p>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-tight text-zinc-600">{small}</p>
        </div>
      ))}
    </div>
  );
}

export default function CrowdPanel() {
  return (
    <div className="mx-4 rounded-[30px] border-[3px] border-fuchsia-500 bg-white px-4 pb-3 pt-3.5 text-[#101014] shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
      <p className="text-center text-[20px] font-extrabold tracking-tight">
        Eastside Trail <span className="font-medium">· busiest {PEAK_WINDOW}</span>
      </p>
      <p className="mt-0.5 text-center text-[11px] font-medium text-zinc-500">Typical pattern, estimated — not live data</p>
    </div>
  );
}
