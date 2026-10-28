/**
 * POST /api/delete-account { confirm: "DELETE" } — self-service account deletion
 * (Apple guideline 5.1.1(v): apps that create accounts must let users delete them in-app).
 *
 * Every user table (profiles, locations, location_shares, friendships, favorites)
 * cascades from auth.users, so deleting the auth user wipes them. Before that we
 * remove what doesn't cascade: the avatar folder in storage and bug reports
 * (those FKs are SET NULL, which would keep the user's text around).
 *
 * Needs Authorization: Bearer <jwt> and SUPABASE_SERVICE_ROLE_KEY.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

// Public project URL (same one the client bundles); env wins if set.
const FALLBACK_URL = "https://cszsikyzoinowjejlznw.supabase.co";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only." });

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || FALLBACK_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(503).json({ error: "Server not configured." });

  const body = (typeof req.body === "string" ? safeJson(req.body) : req.body) || {};
  if (body.confirm !== "DELETE") return res.status(400).json({ error: "Confirmation missing." });

  const jwt = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return res.status(401).json({ error: "Sign in first." });

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: userData, error: userError } = await admin.auth.getUser(jwt);
  const userId = userData?.user?.id;
  if (userError || !userId) return res.status(401).json({ error: "Sign in first." });

  try {
    const { data: files, error: listError } = await admin.storage.from("avatars").list(userId);
    if (listError) throw listError;
    if (files?.length) {
      const { error } = await admin.storage.from("avatars").remove(files.map((f) => `${userId}/${f.name}`));
      if (error) throw error;
    }

    const { error: bugError } = await admin.from("bug_reports").delete().eq("user_id", userId);
    if (bugError) throw bugError;

    const { error: delError } = await admin.auth.admin.deleteUser(userId);
    if (delError) throw delError;

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[delete-account]", e);
    return res.status(500).json({ error: "Couldn't finish deleting your account. Please try again." });
  }
}

function safeJson(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
