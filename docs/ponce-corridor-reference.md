# Ponce City Market Corridor — Visual Reference Notes

**Reference environment:** Apple Maps in the user's connected browser, viewed 2026-08-11.

## Context

The user identified the BeltLine directly behind Ponce City Market as the primary visual reference for B-line's first turn-by-turn corridor. Apple Maps is a framing and spatial-design reference only; B-line must render its own Mapbox-based visual system and must not embed or reproduce Apple Maps tiles, imagery, or branded cartography.

## Observed spatial cues

- **Ponce City Market is the anchor:** the large historic brick complex reads as a long, dominant building mass along the corridor, not a small POI pin.
- **Trail condition:** the Eastside Trail is a narrow, linear pedestrian corridor immediately behind/alongside the PCM mass, with mature tree canopy and landscaped green space that visually separates it from adjacent streets and parking.
- **Composition:** the useful navigation view is a forward-looking, elevated pedestrian angle: the route has a clear vanishing point; PCM fills one side; layered vegetation fills the opposite side; trail stays visible from puck to next maneuver.
- **Hierarchy:** building mass, tree canopy, paved trail, route ribbon, then labels. Labels should be sparse and never obscure the forward view.

## B-line translation requirements

1. Use a B-line-owned map treatment: warm dusk/golden-hour lighting, a deep but readable urban-ground palette, high-contrast brick architecture, lush green canopy, and a single luminous branded route ribbon.
2. Treat murals as real, coordinate-backed editorial landmarks. Do not use generic unrelated imagery as a facade texture or claim it depicts a specific BeltLine mural.
3. Render the PCM-facing frontage as one substantial brick facade with repeated window rhythm and mural-ready panels along the lower trail-facing elevation.
4. Render the opposite edge as staggered tree clusters, understory greenery, and low park lawn/planting strips rather than flat green blocks.
5. Keep the navigation camera near a 60° pitch, heading-up orientation, and a tight enough zoom to make the corridor—not the surrounding road network—the scene.

## Asset boundary

Photoreal mural facade textures or Gaussian-splat scans will require user-supplied/licensed source captures (for example, a team capture using Polycam/Luma or written permission from the imagery owner). Until then, visual treatment may use abstract B-line mural panels that are explicitly illustrative and not passed off as the real artwork.

## Browser interaction status

The user asked that interactive reference work be performed in their connected browser. Apple Maps was opened successfully at the Ponce City Market place page in that browser, where the PCM footprint, adjacent green corridor, and nearby destination hierarchy were visible. A subsequent live-view request timed out from the browser extension; follow-up interactive exploration should resume from the connected browser once it responds.

The direct Apple Maps place URL remains reachable and confirms Ponce City Market's location at the BeltLine/Ponce de Leon crossing. The connected-browser live-view channel still needs to respond before interactive panning or click-based route inspection can continue.

## User-marked start point

The user created a **Marked Location** named **“Ponce City Market”** at **33.773053, -84.364502**, on the Atlanta BeltLine Eastside Trail behind/alongside Ponce City Market. The Apple Maps view shows the marker immediately beside the long PCM building footprint, with the visible pedestrian corridor running along its west/southwest edge. Nearby labels include King of Pops, Rina, Real Tacos—Beltline, Chin Chin, Serene Nail Bar, and Motorboat.

The user has explicitly asked for click-based exploration of this interactive map. After the successful marked-location inspection, two attempts to open Directions timed out in the connected-browser extension. No route action was completed.

## Look Around capture 01 — PCM trail-facing arrival

Apple Maps Look Around at approximately **33.772721, -84.364424**, heading west, reveals the real trail-facing Ponce City Market condition to emulate in B-line:

- The **dominant elevation** is an industrial red-brown brick facade with a long black steel canopy/awning, repeating dark-framed glazing, upper open concrete/metal structure, and large red **PONCE CITY MARKET** lettering.
- The **pedestrian realm** is broad gray paving in front of the building, organized by generous stairs, handrails, planters, an active scooter rack, and people. It should not be represented as an empty road.
- The **landscape edge** is a low, dry-meadow planting bed with tan grasses, dark mulch/soil, scattered broadleaf shrubs, curb-height stone/concrete borders, and a mature decididuous tree at the far right. This is more authentic than a uniform green lawn.
- A vertical wayfinding sign and the historic industrial canopy give the corridor a recognisable, human-scale foreground layer.
- The trail-facing facade has a limited visible mural/graffiti panel at the right retaining wall; murals should therefore be placed selectively on documented walls, not covered across the PCM historic facade.

### Build implications

Use this as the first reference scene: create a long PCM facade mass on the left/front edge of the B-line view; apply brick and canopy styling, modular stair/rail silhouettes, scooters as small contextual props, a textured meadow planting strip, and sporadic trees. Keep any mural treatment on the lower retaining-wall / auxiliary-building surfaces only.

## Look Around capture 02 — southbound corridor composition

The user panned left to a southbound (heading approximately 176°) corridor view. The real spatial recipe is now clear: the paved BeltLine path forms a direct, wide linear lead; the low red-brick industrial PCM mass and its black canopy run continuously along the right; a tall brick/industrial building mass runs along the left with a modern dark-windowed mid-rise behind it; low metal rails define terrace and grade changes; the central landscape is a meadow-like strip with straw-colored grasses, spaced green trees, stone blocks, and a row of scooters at the path edge. The desired B-line TBT scene should keep this long forward vanishing point and sided asymmetry, not surround the path with generic volumetric buildings or uniform trees.

## Look Around capture 03 — forward movement on the trail

The click advanced the Apple Maps Look Around camera despite the click request timing out. The new southbound frame retains the key corridor composition but is closer to the walking surface: a broad gray paved trail, pedestrians and a cyclist providing scale, a fine dark gravel edge, low chain-and-post boundary, a dry grass lawn/planting strip and mature deciduous canopy on the right, and an urban edge of railings, planters, small trees and modern glass/brick mass on the left. PCM’s steel canopy and low historic mass remain visible through the right-side trees. Use these as contextual geometry and textures, not imagery copied from Apple Maps.

The current southbound Look Around frame is centered on the forward trail. The actionable forward target is the central pavement beyond the pedestrian group; the interaction needs coordinate-based clicking because Look Around does not expose a semantic forward control to the browser.

## Look Around capture 04 — destination-density transition

Further southbound movement shows the corridor transitioning from the low historic PCM edge into a framed urban canyon: a deep red-brick/black-windowed mid-rise left, a tall pale modern tower right, lower ornamental trees and planted terraces, dark pedestrian-scale light poles, a repeated black chain-and-post edge, public art/large sculptural forms, scooters, and continuous high pedestrian activity. The forward route remains wide and quiet at the center. This is a distinct reusable TBT corridor type: **active mixed-use urban trail**, with vertical building rhythm, selective low planting and active public-realm details.

## Ponce 360 anchor — PCM facade and trail relationship

This is an effective 360° anchor view. It establishes the critical relationship to retain in the B-line scene: Ponce City Market’s tall red-brown brick volume spans the left edge; its long black steel-truss canopy and tiered concrete/stone terrace sit between the building and trail; a broad, dry grass/planted strip plus low black chain boundary separates the building edge from the wide paved BeltLine path; the trail then runs away at the right under trees and a sequence of slim dark light poles. This should be captured as the Ponce **arrival/identity scene**, with PCM being the hero mass, not a generic map-label destination.

## Initial B-line preview QC — 2026-08-11

The first implementation successfully renders the verified trail-side pin, green route ribbon, TBT banner, user puck, and arrival card. It does **not** yet meet the reference screenshot’s visual bar: the default Mapbox building treatment is too dark and abstract at the selected camera bearing; the PCM brick mass is not reading as the dominant trail-side landmark; tree markers appear as stylized blobs rather than a layered natural canopy; and the app preview currently needs a more immersive full-screen mobile presentation at desktop review size. The next revision must establish a forward corridor composition, use daylight/golden-hour light rather than a dark dusk preset, reduce decorative marker prominence, and move the PCM mass into the camera’s immediate side view.

## Second QC pass

Changing to daylight corrected the map’s overall readability, but the preview still presents only a shallow rendered map area above a large dark field at this camera framing. The current camera pitch/scene framing is not yet acceptable against the full-bleed reference screenshot. Next test: reduce pitch and inspect the active follow view before deciding whether the issue is camera composition or canvas layout.

The refreshed preview confirms the remaining issue is reproducible before navigation starts: the lower scene area remains dark at the initial follow framing. The next check will test active navigation after the button is triggered.

During QC, map-driven rerenders made index-based browser clicks stale. Keyboard focus remains available and is the reliable way to trigger the Start TBT control for automated visual inspection.

## Canvas sizing diagnosis

The rendered Mapbox canvas measured 393 × 252 px inside a roughly 393 × 795 px phone shell, which explained the dark lower field. The preview screen now explicitly uses the dynamic viewport height (`100dvh`) and retains a resize observer so the scene canvas can occupy the full mobile view before the next visual check.

The explicit dynamic viewport height changed the screen layout but did not yet make the Mapbox imagery extend below the first ~252 pixels. The saved browser DOM from this pass will be used to distinguish a Mapbox canvas sizing issue from a style/camera-rendering issue before further visual changes.

## Satellite-ground QC

Satellite ground materially improves authenticity of the tree canopy and trail surroundings. However, the custom red PCM extrusion reads as a generic block, not the reference’s articulated historic brick facade, and the satellite horizon is too pale. Per the no-fabrication standard, the generic facade proxy should be removed rather than presented as a real PCM reconstruction. The scene will retain real imagery, the actual mapped route, and a precise scene pin while reserving photoreal facade/mural treatment for licensed captures or a real 3D model.

## Satellite camera QC

The honest satellite version preserves real surroundings but the 75° pitch makes the camera look toward the distant horizon and loses the close, path-led framing of the reference. The next adjustment will use a lower, still-oblique pitch so the green route and PCM-side corridor dominate the screen rather than the regional horizon.

## Active pin handoff verification

Opening `/playground-3d?scene=ponce-corridor&autoplay=1` starts the moving puck and active turn-by-turn UI without an extra start tap. The top distance reads **475 ft**, derived from the shortened real mapped approach geometry rather than a hardcoded label. The layout now has a full-height map canvas, visible trail ribbon and current-position puck. The remaining visual gap versus the user’s reference is photorealistic 3D corridor geometry: satellite imagery accurately locates the trail and canopy, but it cannot reproduce the reference’s modeled PCM facade, mural surfaces, and 3D tree volumes without licensed ground capture or a 3D asset.

## Final visual QC outcome

The current active preview now aligns with the reference on the core navigation shell: full-bleed mobile composition, black rounded instruction card, large directional icon, branded bright-green path, centered location puck, and white three-column arrival card. It does not yet match the reference’s corridor-world rendering: the preview uses real satellite ground and the true trail corridor, while the reference has stylized/photorealistic 3D building geometry, visible mural faces, and volumetric landscaping. This gap is intentionally not faked. Closing it requires a licensed high-quality PCM exterior model or a ground-captured Gaussian Splat/photogrammetry asset, plus rights-cleared mural texture capture.

## Deployment observation

The pushed commit is available in the local preview and passes production build. The observed `bline-web.vercel.app` route still served the pre-update onboarding gate during this check, so the public deployment has not yet reflected commit `e3884cb` (or is connected to a different Vercel workspace than the configured integration). The GitHub `main` push succeeded; deployment ownership/status could not be queried through the available Vercel workspace, which contains only `dumpster-web-manus`.
