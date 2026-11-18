"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/atoms/ui";
import { PaymentBadge, StatusBadge, statusLabel } from "@/components/molecules/status-badge";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDateTime, formatINR } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { useApp, type BookingStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const filters: ("ALL" | BookingStatus)[] = ["ALL", "PENDING_PAYMENT", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "EXPIRED"];

function AdminBookings() {
  const bookings = useApp((s) => s.bookings);
  const pros = useApp((s) => s.pros);
  const assign = useApp((s) => s.assign);
  const cancel = useApp((s) => s.cancel);
  const [filter, setFilter] = useState<(typeof filters)[number]>("ALL");
  const list = [...bookings].filter((b) => filter === "ALL" || b.status === filter).sort((a, b) => b.start.localeCompare(a.start));

  return (
    <>
      <PageTitle title="Bookings" description="Assign professionals, monitor status and handle cancellations. Status changes go through the state machine only." />
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition",
              filter === f ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 bg-white text-slate-600",
            )}
          >
            {f === "ALL" ? "All" : statusLabel(f)} ({f === "ALL" ? bookings.length : bookings.filter((b) => b.status === f).length})
          </button>
        ))}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Booking</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Professional</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="stagger-fast">
            {list.map((b) => {
              const editable = ["CONFIRMED", "ASSIGNED"].includes(b.status);
              const eligible = pros.filter((p) => p.skills.includes(b.serviceSlug));
              return (
                <tr key={b.id} className="border-b border-slate-100 align-middle last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{getService(b.serviceSlug)?.title}</div>
                    <div className="text-xs text-slate-400">
                      {b.code} · {formatINR(b.amounts.total)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{b.customerName}</div>
                    <div className="text-xs text-slate-400">{b.zone}</div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{fmtDateTime(b.start)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentBadge status={b.payment.status} />
                  </td>
                  <td className="px-4 py-3">
                    {editable ? (
                      <select
                        value={b.professionalId ?? ""}
                        onChange={(e) => {
                          const r = assign(b.id, e.target.value);
                          if (r.ok) toast.success("Professional assigned");
                          else toast.error(r.error);
                        }}
                        className="h-9 w-44 rounded-lg border border-slate-200 bg-white px-2 text-sm"
                      >
                        <option value="" disabled>
                          Assign…
                        </option>
                        {eligible.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                            {p.verification !== "VERIFIED" ? " (unverified)" : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-600">{pros.find((p) => p.id === b.professionalId)?.name ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED"].includes(b.status) && (
                      <button
                        onClick={() => {
                          if (!confirm(`Cancel ${b.code}? Paid bookings will be refunded.`)) return;
                          const r = cancel(b.id, "admin");
                          if (r.ok) toast.success("Cancelled — refund initiated if paid");
                          else toast.error(r.error);
                        }}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  No bookings with this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <p className="mt-3 text-xs text-slate-400">
        Tip: try assigning an unverified professional, or one with an overlapping job — the assignment is rejected just like the database exclusion constraint would.
      </p>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <AdminBookings />
    </ReadyGate>
  );
}
