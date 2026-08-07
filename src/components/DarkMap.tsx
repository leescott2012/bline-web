import { mapPins } from "@/lib/data";

// Stylized dark Atlanta map with rating pins. Pure SVG — no map SDK needed for the prototype.
export default function DarkMap({
  pins = true,
  circle = false,
  className = "",
  pinScale = 3.33, // % of container height per viewBox unit; ~1.7 when the map fills the screen
}: {
  pins?: boolean;
  circle?: boolean;
  className?: string;
  pinScale?: number;
}) {
  return (
    <div className={`overflow-hidden bg-[#1b2130] ${className}`}>
      <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <rect width="100" height="60" fill="#1b2130" />
        {/* park blobs */}
        <ellipse cx="20" cy="12" rx="14" ry="8" fill="#0f2418" />
        <ellipse cx="78" cy="44" rx="16" ry="9" fill="#0f2418" />
        <ellipse cx="60" cy="10" rx="9" ry="5" fill="#0f2418" />
        {/* roads */}
        <g stroke="#39415a" strokeWidth="0.8" fill="none">
          <path d="M0 30 C 25 26, 70 34, 100 28" />
          <path d="M0 45 C 30 42, 60 48, 100 44" />
          <path d="M30 0 C 33 20, 28 40, 32 60" />
          <path d="M55 0 C 52 18, 58 42, 54 60" />
          <path d="M75 0 C 78 25, 72 45, 76 60" />
        </g>
        <g stroke="#4a5472" strokeWidth="1.4" fill="none">
          <path d="M0 20 C 30 16, 65 24, 100 18" />
          <path d="M12 0 C 16 25, 10 45, 15 60" />
        </g>
        {/* beltline loop */}
        {circle && (
          <ellipse cx="48" cy="26" rx="17" ry="13" fill="none" stroke="#60bb46" strokeWidth="1"
            strokeDasharray="2.5 2" strokeLinecap="round" />
        )}
        <text x="34" y="53" fill="#7c86a3" fontSize="6" fontWeight="700" letterSpacing="0.5">Atlanta</text>
        <text x="66" y="14" fill="#6b7490" fontSize="2.6" fontWeight="600">VIRGINIA-HIGHLAND</text>
        <text x="34" y="38" fill="#6b7490" fontSize="2.6" fontWeight="600">DOWNTOWN</text>
        <text x="80" y="34" fill="#6b7490" fontSize="2.4" fontWeight="600" transform="rotate(-8 80 34)">DEKALB AVE NE</text>
      </svg>
      {pins &&
        mapPins.map((p, i) => (
          <div
            key={i}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-lg bg-[#12141c]/90 px-2 py-1 text-xs font-semibold text-white shadow"
            style={{ left: `${p.x}%`, top: `${p.y * pinScale}%` }}
          >
            <span className="text-[9px] text-violet-300">★</span> {p.r.toFixed(1)}
          </div>
        ))}
    </div>
  );
}
