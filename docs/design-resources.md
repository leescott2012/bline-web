# Design & Build Resources — Running Reference

**Purpose:** a standing list of tools and inspiration sources for B-line's visual work and
Lee's portfolio site. When Lee asks for "something cool," this file is where Claude looks
first — both for what we already decided to use and for where to go for ideas.

**Started:** 2026-10-28. Append as we go; don't rewrite history.

**Mirror into the vault** under `03 Projects/B-line/` once there's enough here to be worth
it, per the standing rule in CLAUDE.md. This file is the working copy.

---

## How to read the "Claude can use it" column

This is the part that decides how we actually work together, so it's the first thing
recorded for each entry. Three levels:

- **Direct** — it's a code library or a format Claude writes. Claude builds with it in the
  repo, end to end, no handoff.
- **Integrate only** — it's a visual editor. Claude *cannot* author the asset; a human makes
  it in the GUI and exports. Claude wires the export into the site and tunes the
  surrounding code.
- **Inspiration only** — a gallery or reference. Nothing to install. Note: Claude's cloud
  container blocks many domains outright, so a screenshot is often more useful than a link.

A standing caveat on prices: Claude's container cannot reach most vendor pricing pages
directly, so figures below come from third-party aggregators that frequently disagree and
go stale. Treat every price here as **unverified** and check the vendor's own page before
spending money.

---

## Evaluated

### Spline — browser-based 3D design tool

| | |
|---|---|
| **What it is** | Figma-like editor for 3D scenes: model, texture, light, animate, export to web |
| **Claude can use it** | **Integrate only** — Claude cannot author `.splinecode` scenes |
| **Site** | spline.design (blocked from Claude's container) |

**Pros**
- Genuinely the fastest path to a polished interactive 3D hero without writing shaders.
- Exports a React component (`@splinetool/react-spline`), so it drops into a Vite + React
  app with almost no glue.
- Also exports glTF/USDZ if we want the asset in a different pipeline later.

**Cons**
- **Heavy.** Runtime is ~1MB+ gzipped before the scene file. That is larger than B-line's
  entire current bundle.
- **Second WebGL context.** MapLibre already holds one. Two on a screen is a real
  problem on older iPhones.
- **Inflates the iOS binary.** Capacitor bundles `dist` into the app, so the scene ships
  inside the binary rather than being a cached web download.
- **Third-party CDN by default.** Self-host the `.splinecode` or the iOS app depends on
  Spline's CDN at launch.
- Claude can't iterate on the scene — every visual change is a round trip through a human.

**Price** *(unverified — aggregators disagree)*
- Free tier exists; reportedly watermarks web exports.
- Paid tiers reported anywhere from $12–$25/mo depending on source and billing period.
- A separate AI-generation plan was reportedly added Sept 2026 at a higher price point.

**Verdict:** not for B-line. The bundle and dual-WebGL costs are real and the app is
map-centric. Reasonable for a portfolio hero *if* Lee wants to build the scene himself and
accepts the weight. For anything Claude needs to iterate on, use code-authored 3D instead.

---

## Suggestions — not yet evaluated, worth a look

Grouped by what they're for. None of these are researched in depth yet; prices are
flagged where known to be a factor. Ask Claude to work up a full entry for any of them.

### Code-authored motion & 3D — Claude can use these **directly**

These are where Claude is most useful, because there's no human handoff in the loop.

- **Three.js** — the standard WebGL library. Free, open source. What the portfolio hero
  already used.
- **React Three Fiber** — Three.js as React components. Free. Better fit than raw Three.js
  for a React codebase.
- **GSAP** — the serious animation library; scroll-driven sequences, timelines, morphing.
  Free/paid status changed after the Webflow acquisition — **verify current licensing**.
- **Lenis** — smooth-scroll library. Free. Small, and responsible for a lot of what reads
  as "expensive" on award-winning sites.
- **p5.js** — generative/creative coding. Free. Good for genuinely artsy, non-3D visuals.
- **Shaders (raw GLSL)** — maximum control, maximum effort. Free. Claude can write these.

### Visual editors — **integrate only**, Lee authors the asset

- **Rive** — interactive animation. Much lighter than Spline and built for UI. Strong
  candidate if we want motion in B-line itself. Has a free tier.
- **Blender** — free, open source, full 3D suite. Export glTF and Claude loads it with
  Three.js. Steepest learning curve here by far.
- **Unicorn Studio** — no-code WebGL effects, aimed exactly at the "cool and artsy" look.
  Worth a look specifically for the portfolio.
- **LottieFiles / Lottie** — vector animation as JSON. Very light. Good when the effect is
  decorative rather than interactive.

### Inspiration galleries — **inspiration only**

Likely blocked from Claude's container; screenshots are the reliable way to share these.

- **Awwwards** — the canonical award gallery. Heavy on exactly the maximalist WebGL look.
- **Godly** — curated, tighter signal-to-noise than Awwwards.
- **Codrops** — tutorials *and* demos. Unusually useful because the demos ship source
  code, which means Claude can often rebuild the effect directly.
- **siteInspire / Land-book / Minimal Gallery** — cleaner, more editorial end of the range.
- **Shadertoy** — shader-specific. A deep well of effects that Claude can adapt.

### Typography

Type is doing more work than any other single factor in the "artsy" look.

- **Fontshare** — high-quality free fonts, far less overused than Google Fonts.
- **Google Fonts** — free, and the only font host the artifact sandbox allows directly.
- **Pangram Pangram / Klim / Displaay** — paid foundries. A single distinctive face is
  often the cheapest possible upgrade to a site's character.

---

## Lee's list — to be filled in

Sites Lee is sending through for evaluation. Each gets the same treatment: what it is,
whether Claude can use it directly, pros, cons, price, verdict.

<!-- Template — copy per site:

### <name> — <one-line what it is>

| | |
|---|---|
| **What it is** | |
| **Claude can use it** | Direct / Integrate only / Inspiration only |
| **Site** | |

**Pros**
-

**Cons**
-

**Price** *(verified? y/n)*
-

**Verdict:**

-->

*(empty — awaiting the list)*

---

## Open questions

- Portfolio direction is **unsettled**. First attempt (cartographic, technical case-study
  framing) was rejected: Lee wants "cool and artsy." Reference sites pending.
- Is the portfolio its own repo, or a subdirectory here? Leaning own repo — keeps personal
  work out of the product codebase.
