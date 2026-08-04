#!/usr/bin/env node
// Enforces the decisions recorded in AGENTS.md that a machine can settle.
//
// Everything here is something that actually reached `main` or a PR on
// 2026-08-04 and cost real time. None of it needs a model to judge -- a grep
// and a fetch do it faster and can't be confidently wrong. Judgement calls
// (trademark risk, whether a feature is worth building) stay in AGENTS.md,
// where a human decides.
//
// Run: node scripts/guard.mjs
import { readFileSync, existsSync } from "node:fs";

const fail = [];
const note = (m) => console.log(`  ${m}`);

// ── 1. one package manager ────────────────────────────────────────────────
// A stray pnpm-lock.yaml makes Vercel switch package managers on deploy --
// a production change riding along inside an unrelated PR.
console.log("\n[1] lockfiles");
for (const f of ["pnpm-lock.yaml", "yarn.lock", "bun.lockb"]) {
  if (existsSync(f)) fail.push(`${f} present — this repo uses npm (package-lock.json). Vercel picks its package manager from the lockfile it finds.`);
}
note(fail.length ? "FAIL" : "ok — npm only");

// ── 2. closed decisions ───────────────────────────────────────────────────
console.log("\n[2] standing decisions");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
if (Object.keys(deps).some((d) => d.startsWith("mapbox-gl") || d === "@mapbox/mapbox-gl-js"))
  fail.push("mapbox-gl dependency added — MapLibre is the decision (Mapbox GL JS v2+ is proprietary: licence, token, per-load billing).");

const src = readFileSync("src/lib/spots.ts", "utf8");
if (/^\s*\/\/\s*fetchSpots\(\)/m.test(src))
  fail.push("fetchSpots() is commented out — Supabase is authoritative for spots; data.ts is the offline fallback only.");

// "Official Partner" branding implies an endorsement that does not exist.
const files = process.env.GUARD_FILES?.split("\n").filter(Boolean) ?? [];
const scan = files.length ? files : [];
for (const f of scan) {
  if (!existsSync(f) || !/\.(ts|tsx|css|html|json|md)$/.test(f)) continue;
  if (f.endsWith("AGENTS.md")) continue; // the channel discusses these on purpose
  const t = readFileSync(f, "utf8");
  if (/Official Partner/i.test(t)) fail.push(`${f}: "Official Partner" — no ABI/PATH partnership exists; implying endorsement is trademark exposure.`);
  if (/#009245/i.test(t)) fail.push(`${f}: #009245 is Atlanta BeltLine Inc.'s brand green — v1 is deliberately independent.`);
}
note(fail.length ? "FAIL" : "ok");

// ── 3. every image URL resolves ───────────────────────────────────────────
// 8 of 11 broken URLs on 2026-08-04 were fabricated, following a counter
// pattern. A URL is not real because it is well-formed -- fetch it.
console.log("\n[3] image URLs in data.ts");
const data = readFileSync("src/lib/data.ts", "utf8");
const urls = new Set();
for (const m of data.matchAll(/"img":\s*"(https:\/\/[^"]+)"/g)) urls.add(m[1]);
for (const b of data.matchAll(/"imgs":\s*\[([^\]]*)\]/g))
  for (const m of b[1].matchAll(/"(https:\/\/[^"]+)"/g)) urls.add(m[1]);

const check = async (u) => {
  try {
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) });
    const ct = r.headers.get("content-type") ?? "";
    return r.ok && ct.startsWith("image/") ? null : `${u} → ${r.status} ${ct.slice(0, 24)}`;
  } catch (e) {
    return `${u} → ${e.name}`;
  }
};
const list = [...urls];
const results = [];
for (let i = 0; i < list.length; i += 12)
  results.push(...(await Promise.all(list.slice(i, i + 12).map(check))));
const broken = results.filter(Boolean);
broken.forEach((b) => fail.push(`broken image: ${b}`));
note(`${list.length} probed, ${broken.length} broken`);

// ── verdict ───────────────────────────────────────────────────────────────
if (fail.length) {
  console.error(`\n✗ ${fail.length} guard failure(s):\n`);
  fail.forEach((f) => console.error(`  • ${f}`));
  console.error("\nThese are decisions recorded in AGENTS.md. If one should change, argue it there first.\n");
  process.exit(1);
}
console.log("\n✓ all guards passed\n");
