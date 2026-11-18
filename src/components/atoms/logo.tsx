import Link from "next/link";
import { cn } from "@/lib/utils";

/** House mark: a roof line, walls and an open doorway — one crew for every room. */
export function LogoMark({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("flex h-8 w-8 items-center justify-center rounded-[10px]", light ? "bg-cream text-ink" : "bg-ink text-cream", className)}>
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3.5 11 12 4l8.5 7" />
        <path d="M6 9.5V20h4v-5h4v5h4V9.5" />
      </svg>
    </span>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" aria-label="HomeCrew home" className={cn("group inline-flex items-center gap-2.5", className)}>
      <LogoMark light={light} className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-rotate-12" />
      <span className={cn("text-[17px] font-bold tracking-[-0.03em]", light ? "text-cream" : "text-ink")}>HomeCrew</span>
    </Link>
  );
}
