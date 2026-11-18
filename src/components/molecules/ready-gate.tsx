"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { hydrateStore, useApp } from "@/lib/store";
import { Skeleton } from "@/components/atoms/ui";

/** How long the skeleton may show before we offer a way out instead of waiting forever. */
const SLOW_MS = 5000;

/**
 * Renders children only after demo data has loaded from the browser.
 * It also starts loading itself if nothing has yet (e.g. after a hot reload),
 * and after a few seconds offers to reload the demo data rather than spinning.
 */
export function ReadyGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const ready = useApp((s) => s.ready);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (ready) return;
    void hydrateStore();
    const t = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(t);
  }, [ready]);

  if (ready) return <>{children}</>;

  if (slow)
    return (
      <div role="alert" className="mx-auto max-w-md rounded-[26px] border border-ink/10 bg-paper p-8 text-center">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/45">Still loading</div>
        <h2 className="mt-2 text-[20px] font-bold tracking-[-0.02em]">Your demo data is taking a while.</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-ink/60">This demo keeps its data in your browser. Reloading it starts you with fresh sample bookings.</p>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem(useApp.persist.getOptions().name ?? "homecrew-demo-v1");
            } catch {}
            useApp.getState().reset();
            toast.success("Demo data reloaded");
          }}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-semibold text-cream transition-transform active:scale-95"
        >
          <RotateCcw className="h-4 w-4" /> Reload demo data
        </button>
      </div>
    );

  return (
    fallback ?? (
      <div className="space-y-4" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  );
}
