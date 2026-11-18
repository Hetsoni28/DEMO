"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { categoryIcons } from "@/components/atoms/icons";
import { Badge, Card } from "@/components/atoms/ui";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDate } from "@/lib/format";
import { DEMO_CUSTOMER, getCategory, getService } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

function HomePassport() {
  const bookings = useApp((s) => s.bookings);
  const pros = useApp((s) => s.pros);
  // Rendered only on the client (inside ReadyGate), so reading the clock here is safe.
  const [now] = useState(() => Date.now());
  const done = bookings
    .filter((b) => b.customerId === DEMO_CUSTOMER.id && b.status === "COMPLETED")
    .sort((a, b) => b.start.localeCompare(a.start));

  return (
    <>
      <PageTitle title="Home passport" description="A permanent service history for your home — handy for warranty claims and future repairs." />
      {done.length === 0 ? (
        <Card className="p-12 text-center text-sm text-slate-500">Completed jobs will appear here.</Card>
      ) : (
        <div className="space-y-4">
          {done.map((b) => {
            const svc = getService(b.serviceSlug)!;
            const Icon = categoryIcons[getCategory(svc.categorySlug)!.icon];
            const until = new Date(b.end).getTime() + svc.warrantyDays * 86_400_000;
            const daysLeft = Math.ceil((until - now) / 86_400_000);
            return (
              <Link key={b.id} href={`/customer/bookings/${b.id}`}>
                <Card className="flex flex-col gap-4 p-5 transition hover:border-teal-brand/40 sm:flex-row sm:items-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-navy-800">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{svc.title}</div>
                    <div className="text-sm text-slate-500">
                      {fmtDate(b.start)} · {pros.find((p) => p.id === b.professionalId)?.name} · {b.address}
                    </div>
                    {b.report && <div className="mt-1 text-sm text-slate-600">{b.report.summary}</div>}
                  </div>
                  {svc.warrantyDays > 0 && now > 0 ? (
                    daysLeft > 0 ? (
                      <Badge tone="green">
                        <ShieldCheck className="h-3.5 w-3.5" /> Warranty · {daysLeft} days left
                      </Badge>
                    ) : (
                      <Badge tone="slate">
                        <ShieldOff className="h-3.5 w-3.5" /> Warranty ended
                      </Badge>
                    )
                  ) : (
                    <Badge tone="slate">Report on file</Badge>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
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
