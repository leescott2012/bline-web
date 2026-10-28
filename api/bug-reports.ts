/**
 * /api/bug-reports — bline's bug bin admin API.
 *
 * bline has no user accounts / auth system at all (pure static SPA, no
 * server layer before this file), so this can't gate on a signed-in admin
 * user the way Dumpster's server/handlers/bug-report.ts does. Instead it
 * gates on a single shared secret (ADMIN_SECRET) passed via the
 * `x-admin-key` header — proportionate for an early-stage app with no
 * accounts to check against. Uses the service-role key server-side to
 * bypass RLS (the anon key intentionally has no SELECT policy).
 *
 * GET  — list reports. ?limit=50 (default 50, max 200). ?status=new filters;
 *        omit to get everything.
 * PATCH — update one report's status/admin_note (used by the bug-bin-agent
 *        to clear items out of the bin once triaged). body: { id, status?,
 *        admin_note? }
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "crypto";

// Constant-time compare (hash first so lengths always match).
const sameSecret = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return res.status(503).json({ error: "ADMIN_SECRET not set." });
  if (!sameSecret(String(req.headers["x-admin-key"] ?? ""), adminSecret)) {
    return res.status(403).json({ error: "Forbidden." });
  }

  // Same fallback as src/lib/supabase.ts -- this URL is public, not a secret,
  // so VITE_SUPABASE_URL was never set in Vercel and this project's env vars
  // reflect that (only ADMIN_SECRET/SUPABASE_SERVICE_ROLE_KEY are configured).
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://cszsikyzoinowjejlznw.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // createClient() throws synchronously on an empty url/key -- check first so
  // a missing env var returns a clean message instead of crashing the function.
  if (!serviceRoleKey) {
    return res.status(503).json({ error: "SUPABASE_SERVICE_ROLE_KEY not set." });
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (req.method === "GET") {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    let q = supabaseAdmin
      .from("bug_reports")
      .select("id, source, message, url, user_agent, viewport, context, status, admin_note, created_at")
      .like("source", "bline-%")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);

    const { data, error } = await q;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ reports: data ?? [] });
  }

  if (req.method === "PATCH") {
    const { id, status, admin_note } = (req.body || {}) as { id?: string; status?: string; admin_note?: string };
    if (!id) return res.status(400).json({ error: "id required" });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof status === "string") patch.status = status;
    if (typeof admin_note === "string") patch.admin_note = admin_note.slice(0, 2000);

    // Same scope as GET: only bline's own reports.
    const { error } = await supabaseAdmin.from("bug_reports").update(patch).eq("id", id).like("source", "bline-%");
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
