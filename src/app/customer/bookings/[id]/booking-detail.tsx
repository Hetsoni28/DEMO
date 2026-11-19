"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, CalendarDays, Camera, CircleAlert, MapPin, Phone, RotateCcw, ShieldCheck, Star } from "lucide-react";
import { Avatar, Badge, Button, Textarea } from "@/components/atoms/ui";
import { ServiceQr } from "@/components/atoms/service-qr";
import { ActionBar, BackHeader, Empty, Row, Section } from "@/components/molecules/app-kit";
import { InvoiceButton } from "@/components/molecules/invoice";
import { ServiceImage } from "@/components/molecules/service-image";
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
      <Empty
        title="Booking not found"
        text="It may belong to another account."
        action={
          <Link href="/customer/bookings" className="inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13px] font-bold text-cream">
            Back to bookings
          </Link>
        }
      />
    );

  const svc = getService(b.serviceSlug)!;
  const showQr = b.qr && !b.qr.consumedAt && ["CONFIRMED", "ASSIGNED"].includes(b.status);
  const canCancel = ["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED"].includes(b.status);
  const live = ["CONFIRMED", "ASSIGNED", "IN_PROGRESS"].includes(b.status);
  const doCancel = () => {
    if (!confirm("Cancel this booking? Paid bookings are refunded to the original payment method.")) return;
    const r = cancel(b.id, "customer");
    if (r.ok) toast.success(b.payment.status === "CAPTURED" ? "Cancelled · refund started" : "Booking cancelled");
    else toast.error(r.error);
  };

  const actions = (
    <ActionBar>
      {canCancel && (
        <button onClick={doCancel} className="h-11 rounded-xl px-4 text-[13.5px] font-semibold text-red-600 hover:bg-red-50">
          Cancel
        </button>
      )}
      {b.status === "COMPLETED" && <InvoiceButton booking={b} />}
      {live && pro ? (
        <button
          onClick={() => toast.message(`Calling ${pro.name.split(" ")[0]} on a masked number (demo)`)}
          className="ml-auto inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-ink text-[14px] font-bold text-cream"
        >
          <Phone className="h-4 w-4" /> Call {pro.name.split(" ")[0]}
        </button>
      ) : (
        <Link
          href={`/customer/services/${svc.slug}`}
          className="ml-auto inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-ink text-[14px] font-bold text-cream"
        >
          <RotateCcw className="h-4 w-4" /> Book again
        </Link>
      )}
    </ActionBar>
  );

  return (
    <>
      <BackHeader href="/customer/bookings" label="My bookings" title={svc.title} badge={<StatusBadge status={b.status} />} meta={<span className="font-mono text-[12px]">{b.code}</span>} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px] lg:gap-5">
        <div className="space-y-3">
          {/* Visit summary */}
          <section className="flex gap-3 rounded-2xl border border-ink/8 bg-white p-3">
            <ServiceImage categorySlug={svc.categorySlug} slug={svc.slug} alt="" className="h-20 w-20 shrink-0 rounded-xl" sizes="80px" />
            <div className="min-w-0 flex-1 space-y-1.5 py-0.5 text-[13px] text-ink/70">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 shrink-0 text-ink/40" />
                <span className="font-semibold text-ink">{fmtDate(b.start)}</span> · {fmtTime(b.start)} – {fmtTime(b.end)}
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
                <span className="line-clamp-2">{b.address}</span>
              </div>
            </div>
          </section>

          {showQr && (
            <Section tone="ink" title="Your service QR" action={<span className="rounded-full bg-cream/15 px-2 py-0.5 text-[11px] font-semibold text-cream/80">One-time</span>}>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl bg-white p-3">
                  <ServiceQr token={b.qr!.token} />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[13px] text-cream/75">Show this when your professional arrives. It works once, and only for the professional assigned to this visit.</p>
                  <code className="mt-2 block break-all font-mono text-[11px] text-cream/45">{b.qr!.token}</code>
                </div>
              </div>
            </Section>
          )}

          {b.extraQuote && (
            <Section tone={b.extraQuote.status === "PENDING" ? "amber" : "white"}>
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-bold text-ink">Extra work quote</h3>
                    <Badge tone={b.extraQuote.status === "APPROVED" ? "green" : b.extraQuote.status === "DECLINED" ? "red" : "amber"}>{b.extraQuote.status.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-ink/65">{b.extraQuote.description}</p>
                  <p className="mt-2 text-[17px] font-bold text-ink">{formatINR(b.extraQuote.amountPaise)} + GST</p>
                  {b.extraQuote.status === "PENDING" && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button variant="secondary" onClick={() => (respondExtra(b.id, false), toast("Declined · no extra work will be done"))}>
                        Decline
                      </Button>
                      <Button variant="teal" onClick={() => (respondExtra(b.id, true), toast.success("Approved · your professional can go ahead"))}>
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Section>
          )}

          {b.qr?.consumedAt && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div className="text-[13px]">
                <span className="font-bold text-emerald-800">QR verified</span>
                <span className="text-emerald-700/80"> · {fmtDateTime(b.qr.consumedAt)}</span>
              </div>
            </div>
          )}

          {b.report && (
            <Section title="Job report">
              <p className="text-[13.5px] text-ink/70">{b.report.summary}</p>
              <p className="mt-2 text-[13px] text-ink/55">
                <span className="font-semibold text-ink/75">Materials:</span> {b.report.materials || "None"}
              </p>
              <div className="mt-3 grid max-w-md grid-cols-4 gap-2">
                {Array.from({ length: b.report.photos }, (_, i) => (
                  <div key={i} className="flex aspect-square flex-col items-center justify-center rounded-xl bg-cream text-ink/35">
                    <Camera className="h-5 w-5" />
                    <span className="mt-1 text-[10px] font-semibold">{i % 2 === 0 ? "Before" : "After"}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {b.status === "COMPLETED" && <ReviewBox id={b.id} />}

          <Section title="Status">
            <Timeline history={b.history} />
          </Section>
        </div>

        <div className="space-y-3">
          {actions}
          <Section title="Your professional">
            {pro ? (
              <div className="flex items-center gap-3">
                <Avatar name={pro.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[14px] font-bold text-ink">
                    {pro.name} <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-[12px] text-ink/55">
                    {pro.years} yrs · ★ {pro.rating} · {pro.jobsDone} jobs
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-ink/55">Our team is assigning the best available pro.</p>
            )}
          </Section>

          <Section title="Bill" action={<PaymentBadge status={b.payment.status} />}>
            <Row label="Service" value={formatINR(b.amounts.base)} />
            <Row label="GST" value={formatINR(b.amounts.tax)} />
            <div className="my-1.5 border-t border-dashed border-ink/12" />
            <Row label="Total paid" value={formatINR(b.amounts.total)} strong />
            <div className="mt-2 space-y-0.5 break-all font-mono text-[10.5px] text-ink/35">
              <div>{b.payment.orderId}</div>
              {b.payment.paymentId && <div>{b.payment.paymentId}</div>}
            </div>
          </Section>
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
      <Section title="Your review">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={i < b.review!.rating ? "h-4 w-4 fill-amber-400 text-amber-400" : "h-4 w-4 text-ink/15"} />
          ))}
        </div>
        {b.review.comment && <p className="mt-2 text-[13.5px] text-ink/70">“{b.review.comment}”</p>}
      </Section>
    );

  return (
    <Section title="How was the visit?">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button key={i} onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`}>
            <Star className={cn("h-8 w-8 transition-transform active:scale-90", i < rating ? "fill-amber-400 text-amber-400" : "text-ink/15")} />
          </button>
        ))}
      </div>
      <Textarea className="mt-3" rows={3} placeholder="Tell us more (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <Button className="mt-3 w-full" onClick={() => (review(id, rating, comment), toast.success("Thanks for the review"))}>
        Submit review
      </Button>
    </Section>
  );
}
