import { Users, Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react";
import { crowdDensityPoints } from "@/lib/data";
import { useWeatherNow } from "@/lib/weather";

// The heat mode uses a short real-time panel, styled from the Figma Trail
// Conditions screen. Crowd totals are real only when users have published a
// recent location; otherwise this deliberately reports the seeded level rather
// than inventing a live people count.
const hours = ["10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const heights = [4, 5, 8, 14, 34, 48, 64, 52, 40, 22, 14, 10];
const PEAK_WINDOW = "4–6 PM";
const PEAK_ENDS = PEAK_WINDOW.split("–")[1].trim();

const TOTAL_WEIGHT = crowdDensityPoints.reduce((sum, point) => sum + point.weight, 0);
const SEEDED_LEVEL = TOTAL_WEIGHT < 30 ? "Light" : TOTAL_WEIGHT < 60 ? "Moderate" : "Busy";

function weatherIcon(code: number) {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Sun;
}

export function CrowdMetrics({ people }: { people: number }) {
  const weather = useWeatherNow();
  const level = people >= 25 ? "Busy" : people >= 8 ? "Moderate" : people > 0 ? "Light" : SEEDED_LEVEL;
  const WeatherIcon = weather ? weatherIcon(weather.code) : Sun;
  const weatherBig = weather ? `${weather.tempF}°F` : "72°F";
  const weatherSmall = weather ? weather.label : "clear";

  const metrics = [
    { icon: Users, big: level, small: people > 0 ? `${people} on the trail` : "crowd", edge: true },
    { icon: WeatherIcon, big: weatherBig, small: weatherSmall, edge: false },
    { icon: null, big: "Peak until", small: PEAK_ENDS, edge: true },
  ];

  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {metrics.map(({ icon: Icon, big, small, edge }) => (
        <div key={big} className={`min-w-0 rounded-[24px] bg-white/95 px-2.5 py-3 text-center shadow-lg backdrop-blur ${edge ? "border-[3px] border-fuchsia-500" : "border border-white/70"}`}>
          <div className="flex items-center justify-center gap-1.5">
            {Icon && <Icon size={20} className="shrink-0 text-fuchsia-500" />}
            <p className="truncate text-[15px] font-extrabold leading-tight text-[#101014]">{big}</p>
          </div>
          <p className="mt-0.5 truncate text-[12px] font-medium leading-tight text-zinc-600">{small}</p>
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
      <div className="mt-3 flex h-14 items-end justify-between gap-1.5 px-1">
        {heights.map((height, index) => (
          <div key={hours[index]} className="flex flex-1 flex-col justify-end">
            <div
              className="w-full rounded-t-[5px] bg-gradient-to-t from-violet-600 to-fuchsia-500"
              style={{ height: `${Math.max(4, (height / 64) * 100)}%`, opacity: 0.42 + height / 110 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between px-1 text-[10px] font-medium text-zinc-500">
        {hours.map((hour) => <span key={hour} className="flex-1 text-center">{hour}</span>)}
      </div>
    </div>
  );
}
