"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin, ScanLine } from "lucide-react";
import { ServiceImage } from "@/components/molecules/service-image";
import { StatusBadge } from "@/components/molecules/status-badge";
import { fmtDate, fmtTime, formatINR } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { payout } from "@/lib/pro-helpers";
import type { Booking } from "@/lib/store";

/** One job as an app card: photo, when, where, status and payout / next step. */
export function JobCard({ b }: { b: Booking }) {
  const svc = getService(b.serviceSlug)!;
  const toScan = ["CONFIRMED", "ASSIGNED"].includes(b.status);
  return (
    <Link href={`/professional/jobs/${b.id}`} className="group block rounded-2xl border border-ink/8 bg-white p-3 transition-colors hover:border-ink/20">
      <div className="flex gap-3">
        <ServiceImage categorySlug={svc.categorySlug} slug={svc.slug} alt="" className="h-16 w-16 shrink-0 rounded-xl" sizes="64px" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="truncate text-[14.5px] font-bold leading-snug text-ink">{svc.title}</div>
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink/30 transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink/60">
            <CalendarDays className="h-3.5 w-3.5" /> {fmtDate(b.start)} · {fmtTime(b.start)}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink/60">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{b.customerName} · {b.address}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-ink/10 pt-3">
        <StatusBadge status={b.status} />
        {toScan ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[12px] font-bold text-emerald-700">
            <ScanLine className="h-3.5 w-3.5" /> Scan to start
          </span>
        ) : (
          <span className="text-[13.5px] font-bold tabular-nums text-ink">
            <span className="mr-1 text-[11px] font-medium text-ink/45">You earn</span>
            {formatINR(payout(b))}
          </span>
        )}
      </div>
    </Link>
  );
}
