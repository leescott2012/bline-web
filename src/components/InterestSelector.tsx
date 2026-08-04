import { INTERESTS, useMapInterests, toggleInterest, type Interest } from "@/lib/mapInterests";

export default function InterestSelector() {
  const interests = useMapInterests();

  return (
    <div className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 w-56 overflow-hidden rounded-2xl bg-black/90 shadow-xl backdrop-blur">
      {/* Header */}
      <div className="border-b border-zinc-700 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Select an interest
        </p>
        <p className="mt-1 text-[13px] text-zinc-500">
          Show locations on map
        </p>
      </div>

      {/* Interest Toggles */}
      <div className="divide-y divide-zinc-800 px-2 py-2">
        {(Object.keys(INTERESTS) as Interest[]).map((id) => {
          const def = INTERESTS[id];
          const isActive = interests[id];

          return (
            <button
              key={id}
              onClick={() => toggleInterest(id)}
              className={`w-full rounded-lg px-3 py-3 text-left transition-all ${
                isActive
                  ? "bg-accent/20 text-white"
                  : "text-zinc-400 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{def.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{def.label}</p>
                  <p className="text-[12px] text-zinc-500">{def.description}</p>
                </div>
                {/* Active Indicator */}
                <div
                  className={`size-5 rounded-full border-2 transition-all ${
                    isActive
                      ? "border-accent bg-accent"
                      : "border-zinc-600 bg-transparent"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="border-t border-zinc-800 px-4 py-2.5 text-[12px] text-zinc-500">
        {Object.values(interests).filter(Boolean).length} interest
        {Object.values(interests).filter(Boolean).length !== 1 ? "s" : ""} active
      </div>
    </div>
  );
}
