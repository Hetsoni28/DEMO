"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import Link from "next/link";
import { ChevronRight, Wallet } from "lucide-react";
import { Empty } from "@/components/molecules/app-kit";
import { ServiceImage } from "@/components/molecules/service-image";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDate, formatINR } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { payout, PAYOUT_SHARE } from "@/lib/pro-helpers";
import { useApp, useMyProId } from "@/lib/store";

function EarningsPage() {
  const myProId = useMyProId();
  const done = useApp((s) => s.bookings)
    .filter((b) => b.professionalId === myProId && b.status === "COMPLETED")
    .sort((a, b) => b.start.localeCompare(a.start));
  const total = done.reduce((n, b) => n + payout(b), 0);
  const avg = done.length ? total / done.length : 0;

  // Group payouts by day, newest first — like a wallet statement.
  const groups = new Map<string, typeof done>();
  for (const b of done) {
    const k = fmtDate(b.start);
    groups.set(k, [...(groups.get(k) ?? []), b]);
  }

  return (
    <>
      <PageTitle title="Earnings" description={`You keep ${PAYOUT_SHARE * 100}% of the service amount plus approved extras.`} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[360px_1fr] lg:items-start lg:gap-5">
        <div className="space-y-3 lg:sticky lg:top-40">
          <section className="rounded-2xl bg-ink p-4 text-cream">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-cream/55">Total earned</span>
              <Wallet className="h-4 w-4 text-cream/45" />
            </div>
            <div className="mt-1.5 text-[30px] font-bold leading-none tracking-tight tabular-nums">{formatINR(total)}</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-cream/10 px-3 py-2">
                <div className="text-[17px] font-bold tabular-nums">{done.length}</div>
                <div className="text-[11.5px] text-cream/55">Jobs paid</div>
              </div>
              <div className="rounded-xl bg-cream/10 px-3 py-2">
                <div className="text-[17px] font-bold tabular-nums">{formatINR(avg)}</div>
                <div className="text-[11.5px] text-cream/55">Avg per job</div>
              </div>
            </div>
          </section>
          <p className="px-1 text-[12px] text-ink/45">Payouts go to your bank every Monday (demo).</p>
        </div>

        {done.length === 0 ? (
          <Empty icon={<Wallet className="h-5 w-5" />} title="No earnings yet" text="Complete a job and its payout shows up here." />
        ) : (
          <div className="space-y-4">
            {[...groups].map(([day, list]) => (
              <section key={day}>
                <div className="mb-2 flex items-center justify-between px-1 text-[12px] font-semibold text-ink/50">
                  <span>{day}</span>
                  <span className="tabular-nums">{formatINR(list.reduce((n, b) => n + payout(b), 0))}</span>
                </div>
                <ul className="divide-y divide-ink/6 overflow-hidden rounded-2xl border border-ink/8 bg-white">
                  {list.map((b) => {
                    const svc = getService(b.serviceSlug)!;
                    return (
                      <li key={b.id}>
                        <Link href={`/professional/jobs/${b.id}`} className="flex items-center gap-3 px-3 py-3 hover:bg-ink/2">
                          <ServiceImage categorySlug={svc.categorySlug} slug={svc.slug} alt="" className="h-11 w-11 shrink-0 rounded-xl" sizes="44px" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[14px] font-semibold text-ink">{svc.title}</div>
                            <div className="truncate text-[12px] text-ink/50">
                              {b.customerName} · <span className="font-mono">{b.code}</span>
                            </div>
                          </div>
                          <span className="text-[14px] font-bold tabular-nums text-emerald-700">+{formatINR(payout(b))}</span>
                          <ChevronRight className="h-4 w-4 text-ink/25" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <EarningsPage />
    </ReadyGate>
  );
}
