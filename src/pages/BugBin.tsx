import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

// Internal-only admin viewer for bline's bug_reports bin. No user accounts
// exist in this app, so there's no "signed-in admin" to gate on the way
// Dumpster does -- instead the key is a shared secret (ADMIN_SECRET, set
// server-side) entered once and cached in localStorage. Not linked from any
// nav; reach it by typing the URL. See api/bug-reports.ts for the read side.
const KEY_STORAGE = "bline_admin_key";

interface BugReportRow {
  id: string;
  source: string;
  message: string;
  url: string | null;
  user_agent: string | null;
  viewport: string | null;
  context: { screenshot?: string; [k: string]: unknown } | null;
  created_at: string;
}

export default function BugBin() {
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORAGE) ?? "");
  const [reports, setReports] = useState<BugReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (k: string) => {
    if (!k.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bug-reports?limit=100", {
        headers: { "x-admin-key": k.trim() },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Failed (${res.status})`);
        return;
      }
      const body = await res.json();
      setReports(body.reports || []);
      localStorage.setItem(KEY_STORAGE, k.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  // auto-load if a key is already cached
  useEffect(() => {
    if (key) load(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-ink pb-24">
      <header className="flex items-center gap-3 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Link href="/" aria-label="Back"><ChevronLeft size={24} /></Link>
        <h1 className="text-lg font-bold">Bug Bin</h1>
        <span className="text-xs text-zinc-500">({reports.length})</span>
      </header>

      <div className="mx-4 mt-4 flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(key)}
          placeholder="Admin key"
          className="flex-1 rounded-xl border border-line bg-panel px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={() => load(key)}
          disabled={loading || !key.trim()}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load"}
        </button>
      </div>

      {error && <p className="mx-4 mt-3 text-sm text-red-400">{error}</p>}

      <div className="mx-4 mt-4 space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-2xl border border-line bg-panel p-3">
            <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
              <span className="truncate text-accent">{r.source}</span>
              <span className="whitespace-nowrap">
                {new Date(r.created_at).toLocaleString("en-US", {
                  month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-1 break-words text-sm text-white">{r.message}</p>
            {r.context?.screenshot && (
              <img
                src={r.context.screenshot}
                alt="Attached screenshot"
                className="mt-2 max-h-64 rounded-lg border border-line"
              />
            )}
            {r.url && <p className="mt-2 truncate font-mono text-[10px] text-zinc-500">{r.url}</p>}
          </div>
        ))}
        {!loading && reports.length === 0 && !error && (
          <p className="text-center text-sm text-zinc-500">No reports loaded yet.</p>
        )}
      </div>
    </div>
  );
}
