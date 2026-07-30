// Bug bin — bline's own Supabase bug_reports table (anon inserts allowed,
// source-tagged "bline-*").
import * as Sentry from "@sentry/react";
import { SUPABASE_URL, SUPABASE_ANON } from "./supabase";

export async function reportBug(source: string, message: string, context?: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bug_reports`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        source: `bline-${source}`,
        message: message.slice(0, 2000),
        url: window.location.href,
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        context: { app: "bline", ...context },
      }),
    });
    // fetch() only rejects on network failure -- a Supabase RLS/permission
    // rejection (401/403) comes back as a normal non-throwing response and
    // was silently swallowed before, so a feedback submission could show
    // "Sent" while nothing was actually saved. Surface it to Sentry instead.
    if (!res.ok) {
      Sentry.captureMessage(`bug_reports insert failed: ${res.status}`, {
        level: "error",
        tags: { app: "bline", source: `bline-${source}` },
        extra: { body: await res.text().catch(() => "") },
      });
      return false;
    }
    return true;
  } catch (err) {
    // Network-level failure (offline, etc.) -- still don't crash the app,
    // but don't lose the signal either.
    Sentry.captureException(err, { tags: { app: "bline", source: `bline-${source}` } });
    return false;
  }
}

// auto-capture unhandled errors like Dumpster does
export function installErrorCapture() {
  window.addEventListener("error", (e) =>
    reportBug("unhandled", e.message, { stack: e.error?.stack?.slice(0, 3000) }),
  );
  window.addEventListener("unhandledrejection", (e) =>
    reportBug("unhandled", String(e.reason).slice(0, 500)),
  );
}
