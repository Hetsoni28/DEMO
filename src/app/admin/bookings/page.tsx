"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/atoms/ui";
import { PaymentBadge, StatusBadge, statusLabel } from "@/components/molecules/status-badge";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDateTime, formatINR } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { useApp, type BookingStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const filters: ("ALL" | BookingStatus)[] = ["ALL", "PENDING_PAYMENT", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "EXPIRED"];

/** Row actions behind a quiet ⋯ button; cancelling asks for a second, explicit tap. */
function RowMenu({ code, onCancel }: { code: string; onCancel: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && (setOpen(false), setConfirming(false));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), setConfirming(false));
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${code}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 transition-colors hover:bg-ink/6 hover:text-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+4px)] z-20 w-56 rounded-xl border border-ink/10 bg-white p-1 shadow-[0_18px_40px_-18px_rgba(40,43,74,0.45)]">
          {confirming ? (
            <div className="p-2">
              <div className="text-[13px] font-semibold text-ink">Cancel {code}?</div>
              <p className="mt-0.5 text-[12px] text-ink/55">Paid bookings are refunded automatically.</p>
              <div className="mt-2.5 flex gap-1.5">
                <button type="button" onClick={() => (setOpen(false), setConfirming(false))} className="h-8 flex-1 rounded-lg border border-ink/15 text-[12.5px] font-medium text-ink">
                  Keep
                </button>
                <button type="button" onClick={() => (setOpen(false), setConfirming(false), onCancel())} className="h-8 flex-1 rounded-lg bg-rose-600 text-[12.5px] font-semibold text-white">
                  Cancel booking
                </button>
              </div>
            </div>
          ) : (
            <button role="menuitem" type="button" onClick={() => setConfirming(true)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-rose-700 transition-colors hover:bg-rose-50">
              <XCircle className="h-4 w-4" /> Cancel booking…
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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
        <table className="w-full min-w-225 text-sm">
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
                      <RowMenu
                        code={b.code}
                        onCancel={() => {
                          const r = cancel(b.id, "admin");
                          if (r.ok) toast.success(`${b.code} cancelled`, { description: b.payment.status === "CAPTURED" ? "Refund started to the original payment method." : undefined });
                          else toast.error(r.error);
                        }}
                      />
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
