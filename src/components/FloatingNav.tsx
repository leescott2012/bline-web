import { useEffect, useState } from "react";
import { Footprints, Heart, Map, User, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";

// Instagram-style floating island nav.
//
// Mounted ONCE in App.tsx rather than per-page, for three reasons:
//  1. Every page used to position its own copy, which drifts the moment the bar
//     floats instead of sitting flush.
//  2. It fixes a real bug: pages put the bar in `absolute bottom-0` inside
//     Screen, but Screen is itself the scroll container, so `bottom-0` anchors
//     to the CONTENT bottom -- the bar scrolled out of view on tall pages.
//     App's phone-frame div is relative and never scrolls, so it stays put.
//  3. Living outside wouter's <Switch> means the nav is not remounted on every
//     route change, which is what lets layoutId spring the active pill between
//     tabs. A per-page nav remounts and can only cut, never animate.

const TABS = [
  { icon: Footprints, label: "Explore", href: "/" },
  { icon: Heart, label: "Saved", href: "/saved" },
  { icon: Map, label: "Map", href: "/map" },
  { icon: Users, label: "Friends", href: "/friends" },
  { icon: User, label: "You", href: "/profile" },
];

// Now that the nav is mounted globally it would otherwise appear on every
// route. Only the tab roots get it -- Detail, Reserve, Filters, MapStyles and
// especially turn-by-turn Navigate are full-screen views with their own back
// affordance.
const NAV_ROUTES = new Set(["/", "/saved", "/map", "/friends", "/profile"]);

// Reused from MapStyles.tsx's card carousel so motion feels consistent app-wide.
const COLLAPSE = { type: "spring", stiffness: 320, damping: 30 } as const;
// Stiffer than COLLAPSE: the indicator travels ~65px and should read as a snap.
const SNAP = { type: "spring", stiffness: 480, damping: 32 } as const;

// Ignore sub-threshold jitter so the pill doesn't flutter, and never collapse
// right at the top of a list where there's nothing to make room for.
const SCROLL_DELTA = 6;
const COLLAPSE_AFTER = 24;

export default function FloatingNav() {
  const [loc] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const reducedPref = useReducedMotion();
  const reduced = !!reducedPref;

  useEffect(() => {
    let lastY = 0;
    // Scroll events don't bubble, but they DO capture -- so one document-level
    // capture listener catches every page's scroller (Screen itself, an inner
    // div on Saved/Profile, Home's own sheet) with zero per-page plumbing.
    const onScroll = (e: Event) => {
      const el = e.target as HTMLElement | Document;
      const y = el instanceof HTMLElement ? el.scrollTop : 0;
      const dy = y - lastY;
      if (Math.abs(dy) < SCROLL_DELTA) return;
      lastY = y;
      setCollapsed(dy > 0 && y > COLLAPSE_AFTER);
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  const transition = (spring: typeof COLLAPSE | typeof SNAP) => (reduced ? { duration: 0 } : spring);

  // after the hooks above, so hook order stays stable across routes
  if (!NAV_ROUTES.has(loc)) return null;

  return (
    // pointer-events-none on the tray so the map stays draggable either side of
    // the pill; only the pill itself takes input.
    <nav
      aria-label="Main"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-[max(0.6rem,env(safe-area-inset-bottom))]"
    >
      <motion.div
        animate={{ scale: collapsed ? 0.86 : 1, opacity: collapsed ? 0.9 : 1 }}
        transition={transition(COLLAPSE)}
        // Anchored to the bottom edge so shrinking tucks it toward the screen
        // edge instead of drifting inward from both sides.
        style={{ transformOrigin: "bottom center" }}
        // Any touch brings it back to full size, per the "comes back when you
        // touch it" behaviour -- pointerdown so it responds before the tap lands.
        onPointerDown={() => setCollapsed(false)}
        // Near-opaque on purpose: at 80% over this dark theme the card text
        // behind it read straight through the pill. WKWebView also can't be
        // relied on to frost backdrop-blur, so contrast can't depend on it.
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/15 bg-[#16161c]/95 px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        {TABS.map(({ icon: Icon, label, href }) => {
          const active = loc === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              // size-12 keeps the touch target at 48px even while collapsed
              // (48 * 0.86 = 41px visual, but hit-testing uses the pre-transform
              // box, so the target stays comfortably past the 44pt minimum).
              className="relative grid size-12 place-items-center rounded-full"
            >
              {active && (
                <motion.span
                  layoutId="bline-nav-active"
                  transition={transition(SNAP)}
                  className="absolute inset-0 rounded-full bg-white/20"
                />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.4 : 2}
                className={`relative ${active ? "text-white" : "text-zinc-300"}`}
              />
            </Link>
          );
        })}
      </motion.div>
    </nav>
  );
}
