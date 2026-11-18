"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, Camera, CircleAlert, Phone, ShieldCheck, Star } from "lucide-react";
import { Avatar, Badge, Button, Card, LinkButton, Textarea } from "@/components/atoms/ui";
import { ServiceQr } from "@/components/atoms/service-qr";
import { InvoiceButton } from "@/components/molecules/invoice";
import { PaymentBadge, StatusBadge } from "@/components/molecules/status-badge";
import { Timeline } from "@/components/molecules/timeline";
import { fmtDate, fmtDateTime, fmtTime, formatINR } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { useApp, useBooking, usePro } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CustomerBookingDetail({ id }: { id: string }) {
  const b = useBooking(id);
  const pro = usePro(b?.professionalId);
  const cancel = useApp((s) => s.cancel);
  const respondExtra = useApp((s) => s.respondExtra);

  if (!b)
    return (
      <Card className="p-10 text-center">
        <p className="text-slate-500">Booking not found.</p>
        <LinkButton href="/customer/bookings" className="mt-4" variant="secondary">
          Back to bookings
        </LinkButton>
      </Card>
    );

  const svc = getService(b.serviceSlug)!;
  const showQr = b.qr && !b.qr.consumedAt && ["CONFIRMED", "ASSIGNED"].includes(b.status);
  const canCancel = ["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED"].includes(b.status);

  return (
    <>
      <Link href="/customer/bookings" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> My bookings
      </Link>
      <div className="mt-4 mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{svc.title}</h1>
            <StatusBadge status={b.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {b.code} · {fmtDate(b.start)}, {fmtTime(b.start)} – {fmtTime(b.end)}
          </p>
        </div>
        <div className="flex gap-2">
          {b.status === "COMPLETED" && <InvoiceButton booking={b} />}
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (!confirm("Cancel this booking? Paid bookings are refunded to the original payment method.")) return;
                const r = cancel(b.id, "customer");
                if (r.ok) toast.success(b.payment.status === "CAPTURED" ? "Cancelled — refund initiated" : "Booking cancelled");
                else toast.error(r.error);
              }}
            >
              Cancel booking
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {b.extraQuote && (
            <Card className={cn("p-5", b.extraQuote.status === "PENDING" && "border-amber-300 bg-amber-50/50")}>
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">Additional work quotation</h3>
                    <Badge tone={b.extraQuote.status === "APPROVED" ? "green" : b.extraQuote.status === "DECLINED" ? "red" : "amber"}>{b.extraQuote.status.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{b.extraQuote.description}</p>
                  <p className="mt-2 text-lg font-semibold">{formatINR(b.extraQuote.amountPaise)} + GST</p>
                  {b.extraQuote.status === "PENDING" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="teal" onClick={() => (respondExtra(b.id, true), toast.success("Approved — your professional can proceed"))}>
                        Approve
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => (respondExtra(b.id, false), toast("Declined — no extra work will be done"))}>
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {b.report && (
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900">Job report</h3>
              <p className="mt-2 text-sm text-slate-600">{b.report.summary}</p>
              <p className="mt-2 text-sm text-slate-500">
                <span className="font-medium text-slate-700">Materials:</span> {b.report.materials || "None"}
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {Array.from({ length: b.report.photos }, (_, i) => (
                  <div key={i} className="flex aspect-square flex-col items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-200 text-slate-400">
                    <Camera className="h-5 w-5" />
                    <span className="mt-1 text-[10px]">{i % 2 === 0 ? "Before" : "After"}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {b.status === "COMPLETED" && <ReviewBox id={b.id} />}

          <Card className="p-5">
            <h3 className="mb-5 font-semibold text-slate-900">Status history</h3>
            <Timeline history={b.history} />
          </Card>
        </div>

        <div className="space-y-6">
          {showQr && (
            <Card className="p-5 text-center">
              <h3 className="font-semibold text-slate-900">Your service QR</h3>
              <p className="mt-1 text-xs text-slate-500">Show this to your professional when they arrive. It works once and only for the assigned professioner.</p>
              <div className="mt-4 flex justify-center rounded-2xl bg-slate-50 p-4">
                <ServiceQr token={b.qr!.token} />
              </div>
              <code className="mt-3 block break-all rounded-lg bg-slate-100 px-2 py-1.5 text-xs text-slate-600">{b.qr!.token}</code>
              <p className="mt-2 text-[11px] text-slate-400">Opaque random token — contains no personal data.</p>
            </Card>
          )}
          {b.qr?.consumedAt && (
            <Card className="flex items-center gap-3 p-5">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <div className="text-sm">
                <div className="font-medium text-slate-900">QR verified</div>
                <div className="text-slate-500">{fmtDateTime(b.qr.consumedAt)}</div>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h3 className="text-sm font-medium text-slate-500">Your professional</h3>
            {pro ? (
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={pro.name} />
                <div className="flex-1">
                  <div className="flex items-center gap-1 font-medium text-slate-900">
                    {pro.name} <BadgeCheck className="h-4 w-4 text-teal-brand" />
                  </div>
                  <div className="text-xs text-slate-500">
                    {pro.years} yrs · ★ {pro.rating} · {pro.jobsDone} jobs
                  </div>
                </div>
                {["CONFIRMED", "ASSIGNED", "IN_PROGRESS"].includes(b.status) && (
                  <button onClick={() => toast.message(`Calling ${pro.phone} via masked number (demo)`)} className="rounded-full bg-teal-soft p-2 text-teal-brand" aria-label="Call">
                    <Phone className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Being assigned by our team.</p>
            )}
            <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">{b.address}</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500">Payment</h3>
              <PaymentBadge status={b.payment.status} />
            </div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Service</dt>
                <dd>{formatINR(b.amounts.base)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>GST</dt>
                <dd>{formatINR(b.amounts.tax)}</dd>
              </div>
              <div className="flex justify-between font-semibold text-slate-900">
                <dt>Total</dt>
                <dd>{formatINR(b.amounts.total)}</dd>
              </div>
            </dl>
            <div className="mt-3 space-y-0.5 break-all text-[11px] text-slate-400">
              <div>{b.payment.orderId}</div>
              {b.payment.paymentId && <div>{b.payment.paymentId}</div>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function ReviewBox({ id }: { id: string }) {
  const b = useBooking(id)!;
  const review = useApp((s) => s.review);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (b.review)
    return (
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900">Your review</h3>
        <div className="mt-2 flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={i < b.review!.rating ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-slate-200"} />
          ))}
        </div>
        {b.review.comment && <p className="mt-2 text-sm text-slate-600">“{b.review.comment}”</p>}
      </Card>
    );

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-slate-900">Rate this service</h3>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`}>
            <Star className={i < rating ? "h-7 w-7 fill-amber-400 text-amber-400" : "h-7 w-7 text-slate-200"} />
          </button>
        ))}
      </div>
      <Textarea className="mt-3" rows={3} placeholder="How was your experience? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <Button className="mt-3" size="sm" onClick={() => (review(id, rating, comment), toast.success("Thanks for your review!"))}>
        Submit review
      </Button>
    </Card>
  );
}
