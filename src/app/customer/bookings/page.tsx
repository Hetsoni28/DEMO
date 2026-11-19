"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ChevronRight, QrCode, Star, User } from "lucide-react";
import { Empty, Segmented } from "@/components/molecules/app-kit";
import { ServiceImage } from "@/components/molecules/service-image";
import { StatusBadge } from "@/components/molecules/status-badge";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDate, fmtTime, formatINR } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { useApp, useMyCustomerId, type Booking } from "@/lib/store";

type TabId = "upcoming" | "completed" | "cancelled";
const tabs: { id: TabId; label: string; match: Booking["status"][] }[] = [
  { id: "upcoming", label: "Upcoming", match: ["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"] },
  { id: "completed", label: "Completed", match: ["COMPLETED"] },
  { id: "cancelled", label: "Cancelled", match: ["CANCELLED", "EXPIRED"] },
];

function CustomerBookings() {
  const myCustomerId = useMyCustomerId();
  const [tab, setTab] = useState<TabId>("upcoming");
  const pros = useApp((s) => s.pros);
  const all = useApp((s) => s.bookings);
  const mine = all.filter((b) => b.customerId === myCustomerId);
  const t = tabs.find((x) => x.id === tab)!;
  const list = mine
    .filter((b) => t.match.includes(b.status))
    .sort((a, b) => (tab === "upcoming" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)));

  return (
    <>
      <PageTitle title="My bookings" description="Every visit, from payment to completion." />
      <Segmented value={tab} onChange={setTab} items={tabs.map((x) => ({ id: x.id, label: x.label, count: mine.filter((b) => x.match.includes(b.status)).length }))} />
      {list.length === 0 ? (
        <Empty
          icon={<CalendarDays className="h-5 w-5" />}
          title={tab === "upcoming" ? "No upcoming visits" : "Nothing here yet"}
          text={tab === "upcoming" ? "Book a service and it will show up here with its QR and timeline." : undefined}
          action={
            tab === "upcoming" ? (
              <Link href="/customer/services" className="inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13px] font-bold text-cream">
                Browse services
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="stagger-fast grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((b) => (
            <BookingCard key={b.id} b={b} pro={pros.find((p) => p.id === b.professionalId)?.name} />
          ))}
        </div>
      )}
    </>
  );
}

function BookingCard({ b, pro }: { b: Booking; pro?: string }) {
  const svc = getService(b.serviceSlug)!;
  const showQr = b.qr && !b.qr.consumedAt && ["CONFIRMED", "ASSIGNED"].includes(b.status);
  return (
    <Link href={`/customer/bookings/${b.id}`} className="group block rounded-2xl border border-ink/8 bg-white p-3 transition-colors hover:border-ink/20">
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
          <div className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-ink/60">
            <User className="h-3.5 w-3.5" /> {pro ?? "Assigning a professional"}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-dashed border-ink/10 pt-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={b.status} />
          <span className="font-mono text-[11px] text-ink/40">{b.code}</span>
        </div>
        {showQr ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[12px] font-bold text-emerald-700">
            <QrCode className="h-3.5 w-3.5" /> Show QR
          </span>
        ) : b.status === "COMPLETED" && !b.review ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-[12px] font-bold text-amber-700">
            <Star className="h-3.5 w-3.5" /> Rate visit
          </span>
        ) : (
          <span className="text-[13.5px] font-bold tabular-nums text-ink">{formatINR(b.amounts.total)}</span>
        )}
      </div>
    </Link>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <CustomerBookings />
    </ReadyGate>
  );
}
