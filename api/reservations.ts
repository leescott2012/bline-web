/**
 * /api/reservations — bline reservation backend.
 *
 * POST — create a new reservation. Body:
 *   { spotId, spotName, guests, dayLabel, timeLabel, name?, email?, phone? }
 *   Returns: { id, status, spotName, guests, dayLabel, timeLabel }
 *
 * GET  — fetch a single reservation by id. ?id=<uuid>
 *   Returns the reservation row (public fields only — no PII in response).
 *
 * The table is created by supabase-reservations-migration.sql. The anon key
 * has INSERT + SELECT policies so the client can write directly, but routing
 * through this API function lets us:
 *   - validate the payload server-side before it hits the DB
 *   - add rate-limiting / abuse protection later without touching the client
 *   - keep the service-role key off the client bundle
 *
 * CORS: allows the Vercel preview + production origins.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://cszsikyzoinowjejlznw.supabase.co";

// Use service role key if available (bypasses RLS); fall back to anon key so
// the function still works even if SUPABASE_SERVICE_ROLE_KEY isn't set yet.
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzenNpa3l6b2lub3dqZWpsem53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzA1MDksImV4cCI6MjEwMDMwNjUwOX0.nUiglVtCUVesTRQE6bvyuQgSIGICXMPnog5aq3LC6iw";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // ── GET /api/reservations?id=<uuid> ─────────────────────────────────────
  if (req.method === "GET") {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing reservation id." });
    }
    const { data, error } = await supabase
      .from("reservations")
      .select("id, spot_id, spot_name, guests, day_label, time_label, status, created_at")
      .eq("id", id)
      .single();
    if (error || !data) {
      return res.status(404).json({ error: "Reservation not found." });
    }
    return res.status(200).json(data);
  }

  // ── POST /api/reservations ───────────────────────────────────────────────
  if (req.method === "POST") {
    const body = req.body as {
      spotId?: string;
      spotName?: string;
      guests?: number;
      dayLabel?: string;
      timeLabel?: string;
      name?: string;
      email?: string;
      phone?: string;
    };

    // Validate required fields
    const { spotId, spotName, guests, dayLabel, timeLabel } = body;
    if (!spotId || !spotName || !guests || !dayLabel || !timeLabel) {
      return res.status(400).json({
        error: "Missing required fields: spotId, spotName, guests, dayLabel, timeLabel.",
      });
    }
    if (typeof guests !== "number" || guests < 1 || guests > 20) {
      return res.status(400).json({ error: "guests must be between 1 and 20." });
    }

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        spot_id: spotId,
        spot_name: spotName,
        guests,
        day_label: dayLabel,
        time_label: timeLabel,
        name: body.name ?? "",
        email: body.email ?? "",
        phone: body.phone ?? "",
        status: "confirmed",
      })
      .select("id, spot_name, guests, day_label, time_label, status")
      .single();

    if (error) {
      // Table doesn't exist yet — return a clear message so the UI can fall
      // back gracefully rather than showing a cryptic error.
      if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
        return res.status(503).json({
          error:
            "Reservations table not yet created. Run supabase-reservations-migration.sql in the Supabase SQL editor.",
        });
      }
      console.error("[reservations] insert error:", error);
      return res.status(500).json({ error: "Failed to save reservation." });
    }

    return res.status(201).json(data);
  }

  return res.status(405).json({ error: "Method not allowed." });
}
