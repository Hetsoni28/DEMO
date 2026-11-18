"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryIcons } from "@/components/atoms/icons";
import { StatusBadge } from "@/components/molecules/status-badge";
import { fmtDateTime, formatINR } from "@/lib/format";
import { getCategory, getService } from "@/lib/mock-data";
import type { Booking } from "@/lib/store";

export function BookingRow({ booking, href, sub }: { booking: Booking; href: string; sub?: string }) {
  const svc = getService(booking.serviceSlug)!;
  const Icon = categoryIcons[getCategory(svc.categorySlug)!.icon];
  return (
    <Link href={href} className="group flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-ink/4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-ink transition-transform duration-500 group-hover:-rotate-6">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[14.5px] font-semibold text-ink">{svc.title}</span>
          <StatusBadge status={booking.status} />
        </div>
        <div className="mt-0.5 truncate font-mono text-[11.5px] text-ink/50">
          {booking.code} · {fmtDateTime(booking.start)}
          {sub ? ` · ${sub}` : ""}
        </div>
      </div>
      <span className="hidden text-[14px] font-semibold tabular-nums text-ink sm:block">{formatINR(booking.amounts.total)}</span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/10 text-ink/50 transition-all duration-500 group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-cream">
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
