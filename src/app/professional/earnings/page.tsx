"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { IndianRupee, Receipt, TrendingUp } from "lucide-react";
import { Card } from "@/components/atoms/ui";
import { StatCard } from "@/components/molecules/stat-card";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDate, formatINR } from "@/lib/format";
import { DEMO_PROFESSIONAL_ID, getService } from "@/lib/mock-data";
import { payout, PAYOUT_SHARE } from "@/lib/pro-helpers";
import { useApp } from "@/lib/store";

function EarningsPage() {
  const done = useApp((s) => s.bookings)
    .filter((b) => b.professionalId === DEMO_PROFESSIONAL_ID && b.status === "COMPLETED")
    .sort((a, b) => b.start.localeCompare(a.start));
  const total = done.reduce((n, b) => n + payout(b), 0);
  return (
    <>
      <PageTitle title="Earnings" description={`You receive ${PAYOUT_SHARE * 100}% of the service amount plus approved extras. Payouts are weekly (demo).`} />
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total earned" value={formatINR(total)} icon={IndianRupee} />
        <StatCard label="Jobs paid" value={done.length} icon={Receipt} />
        <StatCard label="Avg per job" value={formatINR(done.length ? total / done.length : 0)} icon={TrendingUp} />
      </div>
      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Job</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 text-right font-medium">Payout</th>
            </tr>
          </thead>
          <tbody className="stagger-fast">
            {done.map((b) => (
              <tr key={b.id} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-3 text-slate-500">{fmtDate(b.start)}</td>
                <td className="px-5 py-3">
                  {getService(b.serviceSlug)?.title} <span className="text-slate-400">· {b.code}</span>
                </td>
                <td className="px-5 py-3 text-slate-600">{b.customerName}</td>
                <td className="px-5 py-3 text-right font-medium">{formatINR(payout(b))}</td>
              </tr>
            ))}
            {done.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                  Complete a job to see earnings here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
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
