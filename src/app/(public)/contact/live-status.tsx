"use client";

import { useEffect, useState } from "react";
import { supportStatus } from "@/lib/support";
import { cn } from "@/lib/utils";

type Status = ReturnType<typeof supportStatus>;

/** Support availability pill — computed in the browser after mount (keeps the page prerenderable). */
export function LiveStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    const tick = () => setStatus(supportStatus());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-ink/15 bg-paper/70 py-2 pl-3 pr-4 text-[13px] backdrop-blur" aria-live="polite">
      <span className="relative flex h-2.5 w-2.5">
        {status?.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1E9E5A]/60" />}
        <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", status ? (status.open ? "bg-[#1E9E5A]" : "bg-ink/35") : "bg-ink/20")} />
      </span>
      <span className="font-semibold text-ink">{status ? `Support · ${status.label}` : "Support"}</span>
      <span className="text-ink/55">{status?.detail ?? "Checking availability…"}</span>
    </div>
  );
}
