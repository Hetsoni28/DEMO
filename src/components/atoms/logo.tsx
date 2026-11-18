import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("flex h-8 w-8 items-center justify-center rounded-[10px]", light ? "bg-cream text-ink" : "bg-ink text-cream", className)}>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 6.5h6.5a3.5 3.5 0 0 1 3.5 3.5v8" />
        <path d="M4 3.5v6" />
        <path d="M11 18h6" />
        <path d="M17.5 21v.01" strokeWidth="3" />
      </svg>
    </span>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" aria-label="PipePilot home" className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark light={light} className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-rotate-12" />
      <span className={cn("text-[17px] font-bold tracking-[-0.03em]", light ? "text-cream" : "text-ink")}>PipePilot</span>
    </Link>
  );
}
