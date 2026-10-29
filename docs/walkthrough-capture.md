# Filming a virtual walk (for Lee)

The app already has the 3D viewer (`/walkthrough/ponce-krog`, reached from the
Ponce City Market and Krog Street Market spot screens and the trail screen).
It shows a labelled **test scan** until a real one is filmed.
Start with **one short piece** of the trail (about a city block). Once that
looks good on your phone, do the next piece.

## What you need
- [ ] An iPhone (a Pro with LiDAR works best, but any recent iPhone is fine)
- [ ] **Scaniverse** (free, App Store). It builds the 3D scene *on the phone*, so your footage never gets uploaded anywhere.
- [ ] Full battery, 10 GB free storage

## When to go
- [ ] **Early morning (7–9 am) or a cloudy day.** Even light, soft shadows.
- [ ] Avoid noon sun (harsh shadows), sunset (light changes while you film) and night.
- [ ] Go when the trail is **empty-ish** — people walking through show up as ghosts, and we don't want strangers' faces in the app.
- [ ] Dry day: puddles and rain reflections confuse the 3D.

## Phone settings
- [ ] Low Power Mode **off**, Do Not Disturb **on**
- [ ] Wipe the camera lens
- [ ] In Scaniverse choose **Splat** mode (not Mesh), detail **High**

## How to walk
1. Start at one end. Hold the phone at chest height, screen facing you, camera pointed down the trail.
2. Walk **half your normal speed** — slow, smooth steps. No sudden turns.
3. Every few steps, sweep the phone **slowly left and right** so the walls, murals and trees on both sides get filmed.
4. At the far end, turn around and walk back the **other way** doing the same thing. Two passes = far fewer holes.
5. Keep each scan to **about 100 steps one way (2–4 minutes total)**. Longer scans get blurry and won't load fast on a phone.
6. Tap stop, let Scaniverse process (a few minutes, phone gets warm — normal).

## Good first pieces
- Ponce City Market's trail entrance (the stairs/ramp and the trail in front)
- The Krog Street Tunnel (murals both walls — walk the middle, sweep wall to wall)

## Getting it into the app (2 steps)
- [ ] In Scaniverse: open the scan → Share/Export → **PLY** → **AirDrop to your Mac** (it lands in Downloads)
- [ ] Tell Claude **"add my walk"** — or run it yourself in the `bline-web` folder:

```bash
npm run add-walk
```

That one command takes the newest scan in Downloads, shrinks it about 10× on the
Mac, and uploads **only the finished 3D file** (never video) to the app's
storage. It's live in the app straight away — no app update, and the
test-scan banner disappears on its own. Re-filming? Run it again; it replaces
the old one.

## Why not Matterport / Polycam / Luma?
- **Matterport** — paid, built for indoor rooms, and plays in its own viewer, not inside B-line.
- **Luma / Polycam** — good, but they process in their cloud, which means uploading your raw video. Scaniverse doesn't.
- **Apple Maps Look Around** — fine as a *reference* for what to film, but its imagery can't be copied into B-line (Apple's terms), and its spaced-out photos don't make a good 3D scan anyway.
- **n8n** — not needed; the shrinking has to run on the Mac, and one command already does the whole job.
