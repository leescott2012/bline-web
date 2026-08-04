import { Users, Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react";
import { crowdDensityPoints } from "@/lib/data";
import { useWeatherNow } from "@/lib/weather";

// Trail conditions, shown on the Map tab whenever the heatmap is on. This used
// to be its own screen behind the Profile tab, which meant the heat overlay and
// the numbers explaining it lived in two different places.

// 12-bar chart spanning 10 AM – 9 PM. Labels match the actual hours so the peak
// bar (index 6 = 4 PM) aligns with PEAK_WINDOW.
const hours = ["10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const heights = [4, 5, 8, 14, 34, 48, 64, 52, 40, 22, 14, 10];
const PEAK_WINDOW = "4–6 PM";
const PEAK_ENDS = PEAK_WINDOW.split("–")[1].trim();

// Fallback level, derived from the seeded density weights, for when nobody is
// out yet. Any real users on the trail override it below.
const TOTAL_WEIGHT = crowdDensityPoints.reduce((s, p) => s + p.weight, 0);
const SEEDED_LEVEL = TOTAL_WEIGHT < 30 ? "Light" : TOTAL_WEIGHT < 60 ? "Moderate" : "Busy";

// current WMO weather code -> icon; falls back to Sun if unmapped
function weatherIcon(code: number) {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Sun;
}

export default function CrowdPanel({ people }: { people: number }) {
  const weather = useWeatherNow();
  // `people` counts real users who published a fix in the last 30 minutes, so
  // the caption only claims a live number when there genuinely is one.
  const level = people >= 25 ? "Busy" : people >= 8 ? "Moderate" : people > 0 ? "Light" : SEEDED_LEVEL;
  const WeatherIcon = weather ? weatherIcon(weather.code) : Sun;
  // falls back to a static reading if the fetch fails or hasn't resolved --
  // never blanks the chip
  const weatherBig = weather ? `${weather.tempF}°F` : "72°F";
  const weatherSmall = weather ? weather.label : "clear";

  return (
    <div className="mx-3 rounded-2xl bg-[#101014]/92 p-3.5 text-white shadow-2xl backdrop-blur">
      <div className="flex items-center gap-2">
        {[
          { icon: Users, big: level, small: people > 0 ? `${people} on the trail` : "crowd" },
          { icon: WeatherIcon, big: weatherBig, small: weatherSmall },
          { icon: null, big: "Peak until", small: PEAK_ENDS },
        ].map(({ icon: Icon, big, small }, i) => (
          <div key={i} className="flex flex-1 items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2">
            {Icon && <Icon size={16} className="shrink-0 text-hot" />}
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold leading-tight">{big}</p>
              <p className="truncate text-[11px] leading-tight text-zinc-400">{small}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[12px] font-semibold text-zinc-300">
        Eastside Trail · busiest {PEAK_WINDOW}
      </p>
      <div className="mt-1.5 flex h-12 items-end justify-between gap-1">
        {heights.map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#7c3aed] to-hot"
            style={{ height: `${(h / 64) * 100}%`, opacity: 0.45 + h / 120 }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
        {hours.map((h, i) => <span key={i} className="flex-1 text-center">{h}</span>)}
      </div>
    </div>
  );
}
