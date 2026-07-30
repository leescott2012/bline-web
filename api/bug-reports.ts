/**
 * GET /api/bug-reports — lists bline's own bug reports for the admin viewer.
 *
 * bline has no user accounts / auth system at all (pure static SPA, no
 * server layer before this file), so this can't gate on a signed-in admin
 * user the way Dumpster's server/handlers/bug-report.ts does. Instead it
 * gates on a single shared secret (ADMIN_SECRET) passed via the
 * `x-admin-key` header — proportionate for an early-stage app with no
 * accounts to check against. Uses the service-role key server-side to
 * bypass RLS (the anon key intentionally has no SELECT policy).
 *
 * ?limit=50  (default 50, max 200)
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return res.status(503).json({ error: "ADMIN_SECRET not set." });
  if (req.headers["x-admin-key"] !== adminSecret) {
    return res.status(403).json({ error: "Forbidden." });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // createClient() throws synchronously on an empty url/key -- check first so
  // a missing env var returns a clean message instead of crashing the function.
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ error: "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set." });
  }
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));

  const { data, error } = await supabaseAdmin
    .from("bug_reports")
    .select("id, source, message, url, user_agent, viewport, context, created_at")
    .like("source", "bline-%")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ reports: data ?? [] });
}
