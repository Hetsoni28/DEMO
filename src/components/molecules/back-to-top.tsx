"use client";

import { useLenis } from "lenis/react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const lenis = useLenis();
  return (
    <button
      type="button"
      onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
      className="group inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-cream/60 transition-colors hover:text-cream"
    >
      Back to top
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/20 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-cream group-hover:bg-cream group-hover:text-ink">
        <ArrowUp className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
