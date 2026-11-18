"use client";

import type { ReactNode } from "react";
import { useApp } from "@/lib/store";
import { Skeleton } from "@/components/atoms/ui";

/** Renders children only after demo data has loaded from the browser. */
export function ReadyGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const ready = useApp((s) => s.ready);
  if (!ready)
    return (
      fallback ?? (
        <div className="space-y-4">
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
  return <>{children}</>;
}
