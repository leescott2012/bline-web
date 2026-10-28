import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useParams } from "wouter";
import {
  AppBase, AppOptions, Asset, CameraComponentSystem, Color, Entity, GSplatComponentSystem,
  GSplatHandler, Mouse, RESOLUTION_AUTO, FILLMODE_NONE, ScriptComponentSystem, ScriptHandler,
  TouchDevice, Vec3, createGraphicsDevice,
} from "playcanvas";
import { CameraControls } from "playcanvas/scripts/esm/camera-controls.mjs";
import { SAMPLE_SPLAT, WALKTHROUGHS } from "@/lib/walkthroughs";

// In-app 3D walkthrough: a Gaussian splat rendered with PlayCanvas (already a
// dependency, open source, no per-load billing). Route is lazy-loaded so the
// engine never lands in the main bundle.
export default function Walkthrough() {
  const { id } = useParams<{ id: string }>();
  const walk = WALKTHROUGHS.find((w) => w.id === id) ?? WALKTHROUGHS[0];
  const url = walk.scan ?? SAMPLE_SPLAT;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const canvas = canvasRef.current!;
    let app: AppBase | undefined;
    let dead = false;
    let ro: ResizeObserver | undefined;

    (async () => {
      try {
        // Splats don't benefit from MSAA and it's expensive on phones.
        const device = await createGraphicsDevice(canvas, { antialias: false });
        if (dead) return device.destroy();
        device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

        const opts = new AppOptions();
        opts.graphicsDevice = device;
        opts.mouse = new Mouse(canvas);
        opts.touch = new TouchDevice(canvas);
        opts.componentSystems = [CameraComponentSystem, ScriptComponentSystem, GSplatComponentSystem];
        opts.resourceHandlers = [ScriptHandler, GSplatHandler];
        app = new AppBase(canvas);
        app.init(opts);
        // The canvas lives inside the phone shell on desktop, so size it to its box, not the window.
        app.setCanvasFillMode(FILLMODE_NONE);
        app.setCanvasResolution(RESOLUTION_AUTO);
        const fit = () => app?.resizeCanvas(canvas.clientWidth, canvas.clientHeight);
        ro = new ResizeObserver(fit);
        ro.observe(canvas);
        fit();
        app.start();

        const asset = new Asset("scan", "gsplat", { url });
        app.assets.add(asset);
        await new Promise<void>((resolve, reject) => {
          asset.once("load", () => resolve());
          asset.once("error", (e: unknown) => reject(e));
          app!.assets.load(asset);
        });
        if (dead) return;

        const splat = new Entity("scan");
        splat.addComponent("gsplat", { asset });
        // Phone-capture PLYs come out upside down (OpenCV axes); flip to Y-up.
        splat.setLocalEulerAngles(180, 0, 0);
        app.root.addChild(splat);

        const camera = new Entity("camera");
        camera.addComponent("camera", { clearColor: new Color(0.06, 0.07, 0.1), farClip: 1000 });
        camera.setPosition(2, 1.4, 5);
        app.root.addChild(camera);
        camera.addComponent("script");
        camera.script!.create(CameraControls, {
          properties: { focusPoint: new Vec3(0, 0.9, 0), moveSpeed: 2, moveFastSpeed: 4, moveSlowSpeed: 1 },
        });
        setStatus("ready");
      } catch (e) {
        console.error("walkthrough load failed", e);
        if (!dead) setStatus("error");
      }
    })();

    return () => {
      dead = true;
      ro?.disconnect();
      app?.destroy();
    };
  }, [url]);

  return (
    <main className="relative h-full w-full overflow-hidden bg-[#0f1219] text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <button aria-label="Back" onClick={() => history.back()}
          className="pointer-events-auto grid size-11 shrink-0 place-items-center rounded-full bg-black/50">
          <ChevronLeft size={22} />
        </button>
        <div className="min-w-0 pt-1">
          <h1 className="text-[15px] font-semibold leading-tight">{walk.title}</h1>
          <p className="text-xs text-zinc-300">Virtual walk</p>
        </div>
      </header>

      {!walk.scan && (
        <div className="absolute inset-x-4 top-[calc(max(1rem,env(safe-area-inset-top))+3.75rem)] rounded-2xl bg-amber-400/15 px-3 py-2 text-xs text-amber-200 ring-1 ring-amber-300/30">
          <b className="font-bold uppercase tracking-wider">Test scan</b> — a sample 3D capture, not the trail. The real walk appears here once this stretch is filmed.
        </div>
      )}

      {status !== "ready" && (
        <div className="absolute inset-0 grid place-items-center text-sm text-zinc-300">
          {status === "loading" ? "Loading 3D scene…" : "Couldn't load the 3D scene. Check your connection and try again."}
        </div>
      )}

      {status === "ready" && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-xs text-zinc-300">
          Drag to look around · pinch to move closer
        </p>
      )}
    </main>
  );
}
