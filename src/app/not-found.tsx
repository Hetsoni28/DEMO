import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/atoms/logo";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

const popular = [
  { href: "/services", label: "All services" },
  { href: "/services/ac-service", label: "AC service" },
  { href: "/customer/dashboard", label: "My dashboard" },
  { href: "/contact", label: "Contact support" },
];

/** Branded 404 — keeps people inside HomeCrew with a clear way forward. */
export default function NotFound() {
  return (
    <main className="grain flex min-h-screen flex-col bg-cream px-5 pb-10 pt-[calc(1.5rem+env(safe-area-inset-top))] text-ink sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Logo />
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45">Error · 404</span>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-16">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50">Wrong door</span>
        <h1 className="mt-5 text-[clamp(3rem,11vw,9rem)] font-black uppercase leading-[0.86] tracking-[-0.06em]">
          This room
          <br />
          <span className="text-ink/35">doesn’t exist.</span>
        </h1>
        <p className="mt-7 max-w-md text-[17px] leading-relaxed text-ink/65">
          The link may be old or mistyped. Everything else in the house is where you left it.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-cream transition-transform active:scale-95">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Link href="/services" className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 px-6 text-[15px] font-semibold transition-colors hover:border-ink">
            Book a service <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 border-t border-ink/15 pt-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/45">Popular right now</div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {popular.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="inline-flex rounded-full border border-ink/15 bg-paper px-4 py-2 text-[14px] transition-colors hover:border-ink/40">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
