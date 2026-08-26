/**
 * Shared layout for /privacy and /terms.
 * Centered max-width column, B-line dark theme, mobile-readable typography.
 * Includes a back-to-app link and the document's "last updated" stamp.
 */
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string; // e.g. "August 26, 2026"
  children: ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div
      className="min-h-dvh bg-ink text-white"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 48px)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b border-line backdrop-blur-md"
        style={{
          background: "rgba(11,11,15,0.85)",
          padding: "max(2.5rem, calc(env(safe-area-inset-top, 0px) + 12px)) 20px 12px",
        }}
      >
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 no-underline">
            <ArrowLeft size={14} /> Back to app
          </Link>
          <span className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-accent">
            B-LINE
          </span>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-[720px] px-6 pb-16 pt-8">
        <h1 className="m-0 mb-2 text-[32px] font-extrabold leading-tight tracking-tight text-white">
          {title}
        </h1>
        <p className="m-0 mb-9 text-[12px] tracking-wide text-zinc-500">
          Last updated: {lastUpdated}
        </p>

        <div className="text-[15px] leading-[1.7] text-zinc-300">{children}</div>

        {/* Footer nav between legal pages */}
        <div className="mt-12 flex gap-[18px] border-t border-line pt-6 text-[13px] text-zinc-500">
          <Link href="/privacy" className="text-zinc-400 no-underline">Privacy</Link>
          <Link href="/terms" className="text-zinc-400 no-underline">Terms</Link>
          <a href="mailto:ariyaonellc@outlook.com" className="ml-auto text-zinc-400 no-underline">
            Contact
          </a>
        </div>
      </main>
    </div>
  );
}

// ── Shared typography primitives ──────────────────────────────────────────

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-8 text-xl font-bold tracking-tight text-white">
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-3.5">{children}</p>;
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-white">{children}</strong>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mb-4.5 ml-5 flex flex-col gap-2">{children}</ul>;
}

export function LI({ children }: { children: ReactNode }) {
  return <li className="pl-0.5">{children}</li>;
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-accent underline underline-offset-2"
    >
      {children}
    </a>
  );
}
