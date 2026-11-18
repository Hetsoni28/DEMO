"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { CircleCheck, IndianRupee, RotateCcw, ShieldCheck } from "lucide-react";
import { Badge, Card } from "@/components/atoms/ui";
import { StatCard } from "@/components/molecules/stat-card";
import { PaymentBadge } from "@/components/molecules/status-badge";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDateTime, formatINR } from "@/lib/format";
import { useApp } from "@/lib/store";

function AdminPayments() {
  const bookings = useApp((s) => s.bookings);
  const events = useApp((s) => s.events);
  const captured = bookings.filter((b) => b.payment.status === "CAPTURED");
  const refunded = bookings.filter((b) => b.payment.status === "REFUNDED" || b.payment.status === "REFUND_PENDING");

  return (
    <>
      <PageTitle title="Payments" description="Razorpay orders, verified webhook events and refunds. Amounts are stored as integer paise." />
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Captured" value={formatINR(captured.reduce((n, b) => n + b.amounts.total, 0))} icon={IndianRupee} hint={`${captured.length} payments`} />
        <StatCard label="Refunds" value={formatINR(refunded.reduce((n, b) => n + b.amounts.total, 0))} icon={RotateCcw} hint={`${refunded.length} bookings`} />
        <StatCard label="Verified events" value={`${events.filter((e) => e.signatureVerified).length}/${events.length}`} icon={ShieldCheck} hint="HMAC signature on raw body" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="overflow-x-auto">
          <h2 className="px-5 pt-5 font-semibold text-slate-900">Payment records</h2>
          <table className="mt-3 w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-5 py-2 font-medium">Booking</th>
                <th className="px-5 py-2 font-medium">Order / payment</th>
                <th className="px-5 py-2 font-medium">Amount</th>
                <th className="px-5 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="stagger-fast">
              {[...bookings]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((b) => (
                  <tr key={b.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-2.5 font-medium">{b.code}</td>
                    <td className="px-5 py-2.5 font-mono text-[11px] text-slate-500">
                      <div>{b.payment.orderId}</div>
                      <div>{b.payment.paymentId ?? "—"}</div>
                    </td>
                    <td className="px-5 py-2.5">{formatINR(b.amounts.total)}</td>
                    <td className="px-5 py-2.5">
                      <PaymentBadge status={b.payment.status} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-x-auto">
          <h2 className="px-5 pt-5 font-semibold text-slate-900">Webhook event log</h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {[...events]
              .sort((a, b) => b.at.localeCompare(a.at))
              .map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-xs font-medium">{e.type}</code>
                      <span className="text-xs text-slate-400">{e.bookingCode}</span>
                    </div>
                    <div className="truncate font-mono text-[11px] text-slate-400">
                      {e.id} · {fmtDateTime(e.at)}
                    </div>
                  </div>
                  <span className="text-sm">{formatINR(e.amount)}</span>
                  <Badge tone="green">verified</Badge>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <AdminPayments />
    </ReadyGate>
  );
}
