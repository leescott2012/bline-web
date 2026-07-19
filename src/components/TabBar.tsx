import { BedDouble, Heart, Map, Gift, User } from "lucide-react";
import { Link, useLocation } from "wouter";

const tabs = [
  { icon: BedDouble, label: "Explore", href: "/" },
  { icon: Heart, label: "Saved", href: "/saved" },
  { icon: Map, label: "Map", href: "/map" },
  { icon: Gift, label: "Perks", href: "/conditions" },
  { icon: User, label: "You", href: "/friends" },
];

export default function TabBar() {
  const [loc] = useLocation();
  return (
    <nav className="sticky bottom-0 z-20 flex items-start justify-around border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {tabs.map(({ icon: Icon, label, href }) => {
        const active = loc === href;
        return (
          <Link key={label} href={href} className="flex flex-col items-center gap-1 px-3 pt-3 pb-2">
            <Icon size={24} strokeWidth={2} className={active ? "text-white" : "text-zinc-500"} />
            <span className={`text-[10px] ${active ? "text-white" : "text-zinc-500"}`}>{label}</span>
            {active && <span className="h-0.5 w-8 rounded bg-hot" />}
          </Link>
        );
      })}
    </nav>
  );
}
