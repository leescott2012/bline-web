import * as Sentry from "@sentry/react";

// Errors ship to the shared "dumpster" Sentry org, tagged app:bline so bline's
// are filterable. DSN is a public client value.
const dsn =
  import.meta.env.VITE_SENTRY_DSN ??
  "https://cac00263ad517cfa1ab22990dff35fc2@o4511424233013248.ingest.us.sentry.io/4511424250576896";

export function initSentry() {
  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    initialScope: { tags: { app: "bline" } },
    environment: import.meta.env.MODE,
  });
}
