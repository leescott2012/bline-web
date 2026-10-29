#!/usr/bin/env node
// Publish a phone capture as an in-app virtual walk, in one step:
//   npm run add-walk                    -> newest .ply/.spz in ~/Downloads, as ponce-krog
//   npm run add-walk -- <file> <id>
// Shrinks it to .sog (PlayCanvas splat-transform, on this Mac), then uploads
// ONLY that finished 3D file to Supabase Storage at walkthroughs/<id>.sog.
// The app looks there first, so it's live immediately -- no app release.
// Raw video never leaves the phone (Scaniverse processes on-device).
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile?.(".env");
const url = process.env.VITE_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");

const downloads = join(homedir(), "Downloads");
const file = process.argv[2] ?? readdirSync(downloads)
  .filter((f) => /\.(ply|spz)$/i.test(f))
  .map((f) => join(downloads, f))
  .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
const id = process.argv[3] ?? "ponce-krog";
if (!file) throw new Error(`No .ply or .spz in ${downloads} -- AirDrop the Scaniverse export first.`);
if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Bad walkthrough id: ${id}`);

const out = join(tmpdir(), `${id}-${Date.now()}.sog`);
console.log(`Shrinking ${file} ...`);
execFileSync("npx", ["-y", "@playcanvas/splat-transform@3.10.3", file, out], { stdio: "inherit" });
const bytes = readFileSync(out);
const mb = (bytes.length / 1e6).toFixed(1);
// Supabase free plan caps uploads at 50 MB; a phone also chokes well before that.
if (bytes.length > 45e6) throw new Error(`${mb} MB is too big for a phone -- film a shorter piece (about 100 steps).`);

const sb = createClient(url, key);
await sb.storage.createBucket("walkthroughs", { public: true }).catch(() => {}); // already exists = fine
const { error } = await sb.storage.from("walkthroughs")
  .upload(`${id}.sog`, bytes, { upsert: true, contentType: "application/octet-stream", cacheControl: "300" });
if (error) throw error;
console.log(`\nLive (${mb} MB): ${url}/storage/v1/object/public/walkthroughs/${id}.sog`);
console.log(`Open it in the app: /walkthrough/${id}`);
