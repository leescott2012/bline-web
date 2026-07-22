// Bug bin — bline's own Supabase bug_reports table (anon inserts allowed,
// source-tagged "bline-*").
import { SUPABASE_URL, SUPABASE_ANON } from "./supabase";

export async function reportBug(source: string, message: string, context?: Record<string, unknown>) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/bug_reports`, {
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
  } catch {
    /* feedback must never crash the app */
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
