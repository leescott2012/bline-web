/**
 * POST /api/route { from: [lng, lat], to: [lng, lat] } — walking directions via
 * OpenRouteService, with the ORS key kept server-side. It used to ship in the
 * client bundle (VITE_ORS_API_KEY), where anyone could lift it and burn the
 * shared daily quota, breaking navigation for everyone.
 *
 * Signed-in users only (hard auth gate), and only for points inside metro
 * Atlanta, so the proxy can't be used as a general-purpose routing API.
 * Returns ORS's GeoJSON unchanged; the client parses it as before.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const FALLBACK_URL = "https://cszsikyzoinowjejlznw.supabase.co";
// Generous box around metro Atlanta: lng -84.75..-84.05, lat 33.5..34.1.
const inAtlanta = (p: unknown) =>
  Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === "number" && Number.isFinite(n)) &&
  p[0] > -84.75 && p[0] < -84.05 && p[1] > 33.5 && p[1] < 34.1;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only." });

  const orsKey = process.env.ORS_API_KEY || process.env.VITE_ORS_API_KEY;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || FALLBACK_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!orsKey || !serviceKey) return res.status(503).json({ error: "Server not configured." });

  const jwt = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return res.status(401).json({ error: "Sign in first." });
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await admin.auth.getUser(jwt);
  if (error || !data?.user) return res.status(401).json({ error: "Sign in first." });

  const body = (typeof req.body === "string" ? safeJson(req.body) : req.body) || {};
  if (!inAtlanta(body.from) || !inAtlanta(body.to)) return res.status(400).json({ error: "Route must be within Atlanta." });

  try {
    const ors = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
      method: "POST",
      headers: { Authorization: orsKey, "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates: [body.from, body.to] }),
      signal: AbortSignal.timeout(10000),
    });
    if (!ors.ok) return res.status(502).json({ error: "Directions service error." });
    return res.status(200).json(await ors.json());
  } catch {
    return res.status(502).json({ error: "Directions service unavailable." });
  }
}

function safeJson(s: string) { try { return JSON.parse(s); } catch { return null; } }
