import type { VercelRequest, VercelResponse } from "@vercel/node";

function setCors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/**
 * Legacy reservation endpoint.
 *
 * B-line no longer creates internal reservation records because they cannot
 * confirm restaurant inventory. New bookings are handed off to the venue's
 * verified OpenTable or Resy provider instead.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  return res.status(410).json({
    error: "B-line no longer creates local reservations. Use the restaurant's verified booking provider for live availability and confirmation.",
  });
}
