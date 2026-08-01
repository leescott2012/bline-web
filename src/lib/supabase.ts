import { createClient } from "@supabase/supabase-js";

// bline's own Supabase project (anon key is a public client key by design).
// Env overrides for local/preview; hardcoded fallback keeps prod builds working.
//
// `??` alone isn't enough: an unfilled `.env` placeholder like `<bline anon key>`
// is a non-empty string, so it silently became the API key and every request
// failed with "Invalid API key". Treat blank/`<...>` values as unset too.
const envOr = (value: string | undefined, fallback: string) =>
  value && value.trim() && !value.trim().startsWith("<") ? value : fallback;

export const SUPABASE_URL = envOr(
  import.meta.env.VITE_SUPABASE_URL,
  "https://cszsikyzoinowjejlznw.supabase.co",
);
export const SUPABASE_ANON = envOr(
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzenNpa3l6b2lub3dqZWpsem53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3MzA1MDksImV4cCI6MjEwMDMwNjUwOX0.nUiglVtCUVesTRQE6bvyuQgSIGICXMPnog5aq3LC6iw",
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
