"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import Link from "next/link";
import { useState } from "react";
import { BookOpenCheck, ChevronRight, ShieldCheck, ShieldOff } from "lucide-react";
import { Empty } from "@/components/molecules/app-kit";
import { ServiceImage } from "@/components/molecules/service-image";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDate } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { useApp, useMyCustomerId } from "@/lib/store";

function HomePassport() {
  const myCustomerId = useMyCustomerId();
  const bookings = useApp((s) => s.bookings);
  const pros = useApp((s) => s.pros);
  // Rendered only on the client (inside ReadyGate), so reading the clock here is safe.
  const [now] = useState(() => Date.now());
  const done = bookings
    .filter((b) => b.customerId === myCustomerId && b.status === "COMPLETED")
    .sort((a, b) => b.start.localeCompare(a.start));

  const covered = done.filter((b) => {
    const svc = getService(b.serviceSlug)!;
    return svc.warrantyDays > 0 && new Date(b.end).getTime() + svc.warrantyDays * 86_400_000 > now;
  }).length;

  return (
    <>
      <PageTitle title="Home passport" description="Your home's service history, kept for warranty claims and future repairs." />
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { k: "Visits", v: done.length },
          { k: "Under warranty", v: covered },
          { k: "Reports", v: done.filter((b) => b.report).length },
        ].map((x) => (
          <div key={x.k} className="rounded-2xl border border-ink/8 bg-white px-3 py-3">
            <div className="text-[20px] font-bold leading-none tabular-nums text-ink">{x.v}</div>
            <div className="mt-1.5 text-[11.5px] font-medium text-ink/55">{x.k}</div>
          </div>
        ))}
      </div>
      {done.length === 0 ? (
        <Empty icon={<BookOpenCheck className="h-5 w-5" />} title="No visits yet" text="Completed jobs, their reports and warranties are saved here." />
      ) : (
        <ol className="stagger-fast grid grid-cols-1 gap-3 md:grid-cols-2">
          {done.map((b) => {
            const svc = getService(b.serviceSlug)!;
            const until = new Date(b.end).getTime() + svc.warrantyDays * 86_400_000;
            const daysLeft = Math.ceil((until - now) / 86_400_000);
            const pct = svc.warrantyDays > 0 ? Math.max(0, Math.min(100, (daysLeft / svc.warrantyDays) * 100)) : 0;
            return (
              <li key={b.id}>
                <Link href={`/customer/bookings/${b.id}`} className="group block rounded-2xl border border-ink/8 bg-white p-3 transition-colors hover:border-ink/20">
                  <div className="flex gap-3">
                    <ServiceImage categorySlug={svc.categorySlug} slug={svc.slug} alt="" className="h-14 w-14 shrink-0 rounded-xl" sizes="56px" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate text-[14.5px] font-bold text-ink">{svc.title}</div>
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-ink/30" />
                      </div>
                      <div className="mt-0.5 truncate text-[12.5px] text-ink/55">
                        {fmtDate(b.start)} · {pros.find((p) => p.id === b.professionalId)?.name ?? "HomeCrew"}
                      </div>
                      {b.report && <div className="mt-1 line-clamp-2 text-[12.5px] text-ink/70">{b.report.summary}</div>}
                    </div>
                  </div>
                  <div className="mt-3 border-t border-dashed border-ink/10 pt-3">
                    {svc.warrantyDays > 0 && daysLeft > 0 ? (
                      <>
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" /> Warranty active
                          </span>
                          <span className="tabular-nums text-ink/55">{daysLeft} days left</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/6">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink/50">
                        <ShieldOff className="h-3.5 w-3.5" /> {svc.warrantyDays > 0 ? "Warranty ended" : "Report on file"}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <HomePassport />
    </ReadyGate>
  );
}
