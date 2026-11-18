"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import { Logo } from "@/components/atoms/logo";
import { Button } from "@/components/atoms/ui";
import { fmtDate, formatINR } from "@/lib/format";
import { getService, GST_RATE } from "@/lib/mock-data";
import type { Booking } from "@/lib/store";

export function InvoiceButton({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const svc = getService(booking.serviceSlug)!;
  const extra =
    booking.extraQuote?.status === "APPROVED"
      ? booking.extraQuote.amountPaise
      : 0;
  const extraTax = Math.round(extra * GST_RATE);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Download className="h-4 w-4" /> Invoice
      </Button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Invoice"
            data-lenis-prevent
            className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto overscroll-contain bg-ink/60 p-4 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="my-auto w-full max-w-lg rounded-[28px] bg-paper p-6 text-ink shadow-2xl sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <Logo />
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-lg p-1 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-6 flex justify-between gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Billed to</div>
                  <div className="font-medium">{booking.customerName}</div>
                  <div className="max-w-55 text-slate-500 [overflow-wrap:anywhere]">
                    {booking.address}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500">Invoice</div>
                  <div className="font-medium">INV-{booking.code.slice(3)}</div>
                  <div className="text-slate-500">
                    {fmtDate(booking.report?.completedAt ?? booking.start)}
                  </div>
                </div>
              </div>
              <table className="mt-6 w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2 font-normal">Item</th>
                    <th className="py-2 text-right font-normal">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2">{svc.title}</td>
                    <td className="py-2 text-right">
                      {formatINR(booking.amounts.base)}
                    </td>
                  </tr>
                  {extra > 0 && (
                    <tr className="border-b border-slate-100">
                      <td className="py-2">
                        Approved extra: {booking.extraQuote!.description}
                      </td>
                      <td className="py-2 text-right">{formatINR(extra)}</td>
                    </tr>
                  )}
                  <tr className="border-b border-slate-100 text-slate-500">
                    <td className="py-2">GST {GST_RATE * 100}%</td>
                    <td className="py-2 text-right">
                      {formatINR(booking.amounts.tax + extraTax)}
                    </td>
                  </tr>
                  <tr className="font-semibold">
                    <td className="py-3">Total</td>
                    <td className="py-3 text-right">
                      {formatINR(booking.amounts.total + extra + extraTax)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 text-xs text-slate-400">
                Paid via Razorpay · {booking.payment.paymentId ?? "—"} · Demo
                invoice, not a tax document.
              </p>
              <Button className="mt-6 w-full" onClick={() => window.print()}>
                Print / save as PDF
              </Button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
