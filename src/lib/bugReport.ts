// Bug bin — same Supabase bug_reports table as Dumpster (anon inserts allowed,
// source-tagged "bline"). Anon key is a public client key by design.
const URL = "https://zstsigakqcggerhjbawj.supabase.co";
const KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdHNpZ2FrcWNnZ2VyaGpiYXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5Njg5OTUsImV4cCI6MjA5NDU0NDk5NX0.u7rE6Txr89qWgTKc9UTinnzmGdCBeIT_e2HpYKjXOcs";

export async function reportBug(source: string, message: string, context?: Record<string, unknown>) {
  try {
    await fetch(`${URL}/rest/v1/bug_reports`, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
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
