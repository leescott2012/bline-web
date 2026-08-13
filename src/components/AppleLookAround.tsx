import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

export const PONCE_LOOK_AROUND_COORDINATE = {
  latitude: 33.773053,
  longitude: -84.364502,
} as const;

type LoadState = "loading" | "ready" | "unavailable" | "error";

type MapKitLookAround = {
  destroy: () => void;
  addEventListener: (name: "load" | "error", listener: (event?: unknown) => void) => void;
};

type MapKitGlobal = {
  Coordinate: new (latitude: number, longitude: number) => unknown;
  LookAround: new (
    parent: HTMLElement,
    location: unknown,
    options: {
      isNavigationEnabled?: boolean;
      isScrollEnabled?: boolean;
      isZoomEnabled?: boolean;
      showsDialogControl?: boolean;
      showsCloseControl?: boolean;
      showsPointsOfInterest?: boolean;
      showsRoadLabels?: boolean;
    },
  ) => MapKitLookAround;
};

declare global {
  interface Window {
    mapkit?: MapKitGlobal;
    __blineMapKitPromise?: Promise<MapKitGlobal>;
    initBlineMapKit?: () => void;
  }
}

function loadMapKit(token: string): Promise<MapKitGlobal> {
  if (window.mapkit) return Promise.resolve(window.mapkit);
  if (window.__blineMapKitPromise) return window.__blineMapKitPromise;

  window.__blineMapKitPromise = new Promise<MapKitGlobal>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.apple-mapkit.com/mk/x/mapkit.core.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.callback = "initBlineMapKit";
    script.dataset.token = token;
    script.dataset.libraries = "look-around,services";

    const timeout = window.setTimeout(() => {
      reject(new Error("Apple MapKit JS did not load in time."));
    }, 15_000);

    window.initBlineMapKit = () => {
      window.clearTimeout(timeout);
      if (window.mapkit) resolve(window.mapkit);
      else reject(new Error("Apple MapKit JS loaded without the MapKit global."));
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Apple MapKit JS could not be loaded."));
    };
    document.head.appendChild(script);
  });

  return window.__blineMapKitPromise;
}

function MissingTokenState() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_18%,#355946,transparent_42%),linear-gradient(160deg,#0c1813,#142a20_52%,#0a120e)] px-8 text-center text-white">
      <div className="max-w-sm rounded-[2rem] border border-white/15 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
        <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#95d86a]">Look Around is ready</p>
        <h1 className="mt-3 text-2xl font-black tracking-tight">Add the Apple Maps token to go street-level.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">
          Set <code className="rounded bg-white/10 px-1.5 py-0.5 text-[#d9ffb8]">VITE_APPLE_MAPKIT_TOKEN</code> for the B-line domain to unlock the navigable Ponce City Market trail view.
        </p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#102219] px-8 text-center text-white">
      <div className="max-w-sm rounded-[2rem] border border-amber-300/20 bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
        <AlertCircle className="mx-auto text-amber-300" size={28} />
        <h1 className="mt-3 text-xl font-black">Look Around is unavailable here.</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{message}</p>
      </div>
    </div>
  );
}

export default function AppleLookAround() {
  const containerRef = useRef<HTMLDivElement>(null);
  const token = import.meta.env.VITE_APPLE_MAPKIT_TOKEN as string | undefined;
  const [state, setState] = useState<LoadState>(token ? "loading" : "unavailable");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !containerRef.current) return;
    let mounted = true;
    let lookAround: MapKitLookAround | undefined;

    loadMapKit(token)
      .then((mapkit) => {
        if (!mounted || !containerRef.current) return;
        const coordinate = new mapkit.Coordinate(
          PONCE_LOOK_AROUND_COORDINATE.latitude,
          PONCE_LOOK_AROUND_COORDINATE.longitude,
        );
        lookAround = new mapkit.LookAround(containerRef.current, coordinate, {
          isNavigationEnabled: true,
          isScrollEnabled: true,
          isZoomEnabled: true,
          showsDialogControl: true,
          showsCloseControl: false,
          showsPointsOfInterest: true,
          showsRoadLabels: false,
        });
        lookAround.addEventListener("load", () => mounted && setState("ready"));
        lookAround.addEventListener("error", () => {
          if (!mounted) return;
          setError("Apple Maps could not load street-level coverage at this point. Check the MapKit JS token, allowed website domains, browser support, and location coverage.");
          setState("error");
        });
      })
      .catch((reason: unknown) => {
        if (!mounted) return;
        setError(reason instanceof Error ? reason.message : "Apple MapKit JS could not be initialized.");
        setState("error");
      });

    return () => {
      mounted = false;
      lookAround?.destroy();
    };
  }, [token]);

  if (!token) return <MissingTokenState />;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#12231a]" aria-label="Apple Maps Look Around at Ponce City Market BeltLine trail-side point">
      <div ref={containerRef} className="absolute inset-0" />
      {state === "loading" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[#0b1711]/55 text-white backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full bg-black/55 px-5 py-3 text-sm font-semibold shadow-xl">
            <Loader2 className="animate-spin text-[#9eea69]" size={18} />
            Loading Look Around
          </div>
        </div>
      )}
      {state === "error" && <ErrorState message={error} />}
    </div>
  );
}
