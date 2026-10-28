---
title: Design Resource Library
tags: [design, resources, b-line, portfolio]
updated: 2026-10-28
---

# Design Resource Library

Lee's curated list of design tools, sorted by **what you're trying to do**. When Lee asks
for a change, Claude starts with the matching category here before going anywhere else.

> [!note] Notes for Claude: read before using or editing this file
> - **Where this lives:** the master copy is in Lee's Obsidian vault at
>   `Geniuss Brain/03 Projects/B-line/Design Resource Library.md`. A copy is in the
>   `leescott2012/bline-web` repo at `docs/design-resources.md`. If you edit one, say so,
>   so the other can be updated.
> - **Fill the blanks:** blank cells are unknown, not "none". If you can reach the site,
>   research it and fill the cell in place. Mark prices ✓ (vendor page or two sources
>   agree) or ~ (one third-party source). Then tick it off in "Gaps to fill" at the bottom.
> - **Don't guess.** If you can't verify something, leave it blank.
> - **Keep the format:** same tables, same columns, same "Claude can use it" terms
>   (Direct / You make, Claude adds / Reference). Add new tools to the matching category
>   and to the "I want to…" table if they belong there.
> - **Update the `updated:` date** in the frontmatter when you change anything.
> - **Ask Lee before paying for anything** or signing up for an account.
> - **Lee's Motion Library** (`00 Notes/(C) Motion Library.html`) hasn't been read yet.
>   If you can open it, summarise it in section 9.

**How prices were checked:** none of these sites load from Claude's cloud container, so
prices come from web search and third-party listings, not the vendor pages. Each one
is marked **✓ confirmed** (multiple sources or official announcement agree), **~ reported**
(one third-party source), or left **blank** when unknown. Blank cells are
gaps to fill in. Check the vendor page before paying.

**"Claude can use it" key**
- **Direct**: code or a library. Claude builds with it end to end.
- **You make, Claude adds**: a visual editor. Lee creates the asset, Claude wires it in.
- **Reference**: inspiration only.

**Already in B-line:** `lucide-react` (icons), `framer-motion` (animation), Tailwind 4.
Anything that fits those three costs nothing extra to adopt.

---

## Quick routing: "I want to…"

| I want to… | Go to first | Then |
|---|---|---|
| Change a **font** | Fontshare | Fontsource (to install it), Fontjoy (pairing ideas), Bunny Fonts |
| Change **colors / a palette** | Realtime Colors | cssgradient.io, meshgradient.com |
| Add a **background, pattern, texture** | Pattern Monster | fffuel, ShapeDivider (section edges) |
| Add or swap **icons** | Lucide (already installed) | Iconify (when Lucide lacks one) |
| Redo a **page layout / UI section** | Magic UI, Aceternity UI | HyperUI (plain Tailwind), Cult UI, HeroUI, Skiper UI |
| Add a **small UI flourish** (button, loader, card) | Uiverse | Motion Primitives, Animista |
| Add **animation in code** | Motion (framer-motion, already installed) | GSAP (scroll and timelines), React Spring |
| Choreograph a **complex 3D or cinematic sequence** | Theatre.js | GSAP |
| Add an **interactive animated graphic** (mascot, animated icon) | Rive | LottieFiles |
| Make a **promo video or animated social post** | Jitter | LottieFiles |
| Make a **3D hero object** | Spline | |
| Get **inspiration / see how others did it** | Refero Styles, Layers | Variant community |

---

## 1. Fonts

| Site | What it is | Price | Claude can use it |
|---|---|---|---|
| **fontshare.com** | Free, high-quality fonts from Indian Type Foundry. Far less overused than Google Fonts; the best source here for a distinctive look | Free for personal and commercial use ✓ | Direct, via its CSS link |
| **fontsource.org** | Self-hosts open-source fonts (incl. all Google Fonts) as npm packages. Best way to bundle fonts into the iOS app so they work offline | Free ✓ | Direct (`npm i @fontsource/...`) |
| **fonts.bunny.net** | Drop-in Google Fonts replacement that doesn't log visitors (privacy/GDPR-friendly) | Free ✓ | Direct |
| **fontjoy.com** | Google Experiments tool that uses a trained model to suggest font pairings. Picks lean safe | Free ✓ | Reference |

**Tip:** pick the font in Fontshare or Fontjoy, then install with Fontsource. For B-line,
self-hosting matters because the iOS app bundles its files.

## 2. Color & gradients

| Site | What it is | Price | Claude can use it |
|---|---|---|---|
| **realtimecolors.com** | Preview a 5-color palette + fonts on a live sample site. The colors are in the URL, so a link fully describes a palette (Claude can read it) | Free ✓ | Direct. Paste the URL and Claude reads the hex values from it |
| **cssgradient.io** | CSS gradient generator + reference | Free ✓ | Direct (outputs CSS) |
| **meshgradient.com** | Mesh gradient generator; limited exports | Free ~ | Reference. Claude rebuilds the look as a shader |

## 3. Backgrounds, patterns & shapes

| Site | What it is | Price | Claude can use it |
|---|---|---|---|
| **pattern.monster** | Seamless SVG pattern generator | Free ✓ | You make, Claude adds (SVG is text, so Claude can tweak it) |
| **fffuel.co** | ~67 SVG generators: textures, blobs, grain, gradients | Free ~ (check licence before commercial use) | You make, Claude adds |
| **shapedivider.app** | Wavy/angled SVG section dividers | Free ✓ | Direct. Simple enough for Claude to write without the tool |

## 4. Icons

| Site | What it is | Price | Claude can use it |
|---|---|---|---|
| **lucide.dev** | Clean outline icon set. **Already used in B-line** | Free, ISC licence ✓ | Direct |
| **iconify.design** | 200k+ icons from 150+ sets under one API | Free; each icon set keeps its own licence ✓ | Direct |

**Rule:** stay on Lucide in B-line for consistency. Use Iconify only for an icon Lucide lacks.

## 5. UI components & page sections

All React + Tailwind unless noted. **Direct** means the code is copied into the project
and Claude can edit it freely.

| Site | Style | Price | Claude can use it |
|---|---|---|---|
| **magicui.design** | Animated landing-page components (marquees, glow, particles) | Free (MIT) + Pro: | Direct |
| **ui.aceternity.com** | Flashy, artsy effects (spotlights, 3D cards, beams). Closest match to "cool and artsy" | Free + Pro: | Direct |
| **cult-ui.com** | Polished, slightly editorial components | Free + Pro from ~$179 ~ | Direct |
| **motion-primitives.com** | Small, tasteful animation building blocks | Free ✓ | Direct |
| **skiper-ui.com** | Motion-heavy components on shadcn | Free + paid one-time: | Direct (needs shadcn setup) |
| **heroui.com** | Full app component system (formerly NextUI). Better for app screens than landing pages | Free (MIT); Pro one-time ~$249 solo / $399 / $799 ~ | Direct |
| **hyperui.dev** | Plain Tailwind HTML blocks, no React needed | Free ✓ | Direct |
| **uiverse.io** | Community buttons, loaders, toggles in HTML/CSS | Free (MIT) ✓ | Direct |
| **componentry.dev** | | | |

**For "cool and artsy":** Aceternity first, then Magic UI. For B-line app screens, HeroUI
or plain Tailwind; flashy landing-page effects don't belong inside a map app.

## 6. Animation libraries (code)

| Site | What it is | Price | Claude can use it |
|---|---|---|---|
| **Motion** (framer-motion) | React animation. **Already in B-line** | Free ✓ | Direct |
| **gsap.com** | Most capable web animation library: scroll-triggered sequences, timelines, text splitting. Webflow made it 100% free in 2025, all plugins included | Free ✓. Licence bars using it to build a no-code tool that competes with Webflow, which doesn't affect us | Direct |
| **react-spring.dev** | Physics-based (springy) React animation | Free, MIT ✓ | Direct. Overlaps with Motion; don't run both |
| **theatrejs.com** | Timeline editor for choreographing 3D/web animation visually, then playing it in code | Free. Core is Apache-2.0 (ships in app); Studio editor is AGPL but dev-only ✓ | Direct + You make (the timeline is edited visually) |
| **animista.net** | Pick a CSS animation, copy the code | Free ✓ | Direct |

## 7. Motion design tools (visual editors)

Claude **cannot** author these files. Lee designs, exports, and Claude integrates.

| Site | Best for | Price | Notes |
|---|---|---|---|
| **rive.app** | Interactive animations that react to taps/state (mascots, animated buttons). Light and fast; good fit for B-line | Free plan exports with a Rive splash; paid from ~$9/mo; Voyager ~$25–32/mo ~ | Best pick for motion inside B-line |
| **lottiefiles.com** | Huge library of ready-made animations + editor | Free: 5 exports; Pro ~$19.99/mo ~ | Free library animations are often usable as-is |
| **jitter.video** | Motion design for videos and social posts (like Figma for animation) | Freemium: | Marketing content, not in-app |
| **spline.design** | 3D scenes for the web | Free (watermark); paid ~$12–25/mo ~ | Heavy. Not for B-line (see below) |

## 8. Inspiration & references

| Site | What it is | Price | Claude can use it |
|---|---|---|---|
| **styles.refero.design** | Library of real site design styles (type, color, layout) broken down | Free basic; Pro paid (~$12/mo reported, unverified) ~ | Reference. Refero has an MCP server on the Pro plan that could let Claude query it directly |
| **layers.to/explore** | Community gallery of design work | | Reference |
| **variant.com/community** | | | |
| **swishy.ai** | | | |

## 9. Lee's own

- **(C) Motion Library.html** in Obsidian at `00 Notes/` is Lee's own reference. Claude
  hasn't seen it; it's a local file on Lee's Mac. To use it, share it with a session
  (see "Getting this into Obsidian" below) or paste the contents.

---

## Decisions already made

- **Spline: not for B-line.** Runtime is ~1MB+ before the scene file, adds a second WebGL
  context on top of MapLibre (real problem on older iPhones), and gets bundled into the iOS
  binary. OK for a portfolio hero if Lee builds the scene.
- **Portfolio direction: "cool and artsy."** First draft (cartographic case study) was
  rejected. Visual work is on hold until Lee says go. Keep the portfolio **private**.

## Gaps to fill

Blank cells above are unknown. Any Claude session that can reach these sites should
research them and fill the blanks in place, marking each price ✓ or ~:

- componentry.dev, variant.com/community, swishy.ai: what they are, price, how Claude can use them
- Pro prices: Magic UI, Aceternity UI, Skiper UI, Jitter
- layers.to: price
- Section 9: summary of Lee's Motion Library.html
