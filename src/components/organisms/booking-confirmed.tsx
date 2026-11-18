"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { LogoMark } from "@/components/atoms/logo";
import { ServiceQr } from "@/components/atoms/service-qr";
import { EASE } from "@/components/motion/motion";
import { fmtDate, fmtTime, formatINR } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import type { Booking } from "@/lib/store";

const AUTO_SECONDS = 8;

/**
 * Payment-confirmed moment: an indigo sheet rises, a booking ticket prints out of a
 * slot, the check draws, a PAID stamp lands, then the QR is scanned in.
 * Rendered in a portal so page-transition transforms never offset it.
 */
export function BookingConfirmed({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [stay, setStay] = useState(false);
  const booking = bookings[0];
  const multi = bookings.length > 1;
  const svc = getService(booking.serviceSlug)!;
  const total = bookings.reduce((n, b) => n + b.amounts.total, 0);
  const lastEnd = bookings.reduce((m, b) => (b.end > m ? b.end : m), booking.end);
  const code = multi ? `${booking.code} +${bookings.length - 1}` : booking.code;
  const href = multi ? "/customer/bookings" : `/customer/bookings/${booking.id}`;
  const d = (s: number) => (reduce ? 0 : s); // delays collapse for reduced motion

  useEffect(() => {
    try {
      navigator.vibrate?.([12, 60, 18]);
    } catch {}
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, []);

  const content = (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmed-title"
      className="fixed inset-0 z-[120] overflow-y-auto bg-ink text-cream"
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
    >
      {/* poster corners */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(0.6), duration: 0.6 }} className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-5 py-6 text-[13px] sm:px-8">
        <div className="flex items-start gap-3">
          <LogoMark light className="mt-0.5" />
          <div>
            <div className="font-medium">Payment verified</div>
            <div className="text-cream/55">Signature · amount · order matched</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium">{code}</div>
          <div className="text-cream/55">{booking.payment.paymentId ?? booking.payment.orderId}</div>
        </div>
      </motion.div>

      <div className="flex min-h-full flex-col items-center justify-center px-5 pb-16 pt-28">
        <motion.h2
          id="confirmed-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d(0.5), duration: 0.8, ease: EASE }}
          className="text-center text-[clamp(2.5rem,7vw,5.5rem)] font-black uppercase leading-[0.86] tracking-[-0.06em]"
        >
          You’re booked.
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: d(0.8), duration: 0.6 }} className="mt-4 text-center font-mono text-[11.5px] uppercase tracking-[0.14em] text-cream/60">
          {multi ? "One payment · a service QR for every visit" : "Your service QR is ready · show it at the door"}
        </motion.p>

        {/* printer slot */}
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: d(0.7), duration: 0.6, ease: EASE }} className="relative z-10 mt-10 h-3 w-[min(420px,92vw)] rounded-full bg-ink-deep shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] ring-1 ring-cream/10" />

        {/* ticket — prints downward out of the slot */}
        <motion.div
          initial={{ clipPath: "inset(0% 0% 100% 0%)", y: -18 }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", y: 0 }}
          transition={{ delay: d(1.1), duration: reduce ? 0 : 1.5, ease: [0.45, 0, 0.2, 1] }}
          className="relative -mt-1.5 w-[min(380px,86vw)]"
        >
          <div className="relative rounded-b-[26px] bg-cream text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
            {/* header */}
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">PipePilot · Booking</div>
                <div className="mt-1 text-[22px] font-black leading-tight tracking-[-0.03em]">{multi ? `${bookings.length} services` : svc.title}</div>
                {multi && (
                  <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-ink/65">
                    {bookings.map((b) => (
                      <li key={b.id} className="truncate">
                        · {getService(b.serviceSlug)?.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* check */}
              <div className="relative h-12 w-12 shrink-0">
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-ink"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ delay: d(2.5), duration: 1.1, ease: "easeOut" }}
                />
                <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden>
                  <motion.circle cx="24" cy="24" r="21" fill="#282B4A" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: d(2.1), duration: 0.45, ease: EASE }} style={{ transformOrigin: "24px 24px" }} />
                  <motion.path
                    d="M15 24.5 L21.5 31 L33.5 18"
                    fill="none"
                    stroke="#EEEBDA"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: d(2.4), duration: 0.45, ease: EASE }}
                  />
                </svg>
              </div>
            </div>

            <dl className="mt-5 space-y-2 px-6 text-[13.5px]">
              <div className="flex items-center gap-2 text-ink/75">
                <Clock className="h-4 w-4 shrink-0 text-ink/45" />
                {fmtDate(booking.start)} · {fmtTime(booking.start)} – {fmtTime(lastEnd)}
              </div>
              <div className="flex items-start gap-2 text-ink/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
                <span className="min-w-0">{booking.address}</span>
              </div>
            </dl>

            {/* perforation */}
            <div className="relative my-5 h-px">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-ink" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-ink" />
              <span className="absolute inset-x-5 top-0 border-t-2 border-dashed border-ink/20" />
            </div>

            {/* QR with scan-in */}
            <div className="flex items-center gap-5 px-6 pb-6">
              <div className="relative overflow-hidden rounded-xl bg-paper p-2">
                <ServiceQr token={booking.qr?.token ?? booking.code} size={112} />
                <motion.div
                  aria-hidden
                  className="absolute inset-0 bg-paper"
                  initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(100% 0% 0% 0%)" }}
                  transition={{ delay: d(3.2), duration: reduce ? 0 : 1.1, ease: [0.65, 0, 0.35, 1] }}
                />
                <motion.span
                  aria-hidden
                  className="absolute inset-x-1 h-[2px] bg-ink shadow-[0_0_14px_3px_rgba(40,43,74,0.45)]"
                  initial={{ top: "0%", opacity: 0 }}
                  animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                  transition={{ delay: d(3.2), duration: reduce ? 0 : 1.1, ease: [0.65, 0, 0.35, 1] }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">Booking</div>
                <div className="text-[20px] font-black tracking-[-0.02em]">{code}</div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">Paid</div>
                <div className="text-[20px] font-black tabular-nums tracking-[-0.02em]">{formatINR(total)}</div>
              </div>
            </div>

            {/* PAID stamp */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute right-5 top-[46%] flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full border-[3px] border-ink/80 text-ink/80 mix-blend-multiply"
              style={{ boxShadow: "inset 0 0 0 4px rgba(238,235,218,1), inset 0 0 0 6px rgba(40,43,74,0.7)" }}
              initial={{ scale: 2.2, opacity: 0, rotate: -28 }}
              animate={{ scale: 1, opacity: 1, rotate: -14 }}
              transition={{ delay: d(2.75), type: "spring", stiffness: 420, damping: 16, mass: 0.8 }}
            >
              <span className="text-[19px] font-black uppercase leading-none tracking-[-0.02em]">Paid</span>
              <span className="mt-0.5 font-mono text-[9px] tracking-[0.1em]">{formatINR(total)}</span>
              <span className="font-mono text-[7.5px] tracking-[0.14em] opacity-70">VERIFIED</span>
            </motion.div>
          </div>
        </motion.div>

        {/* actions */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d(3.6), duration: 0.6, ease: EASE }} className="mt-10 flex w-[min(380px,86vw)] flex-col gap-3">
          <Link href={href} className="group flex h-[52px] items-center justify-center gap-2 rounded-full bg-cream text-[15px] font-semibold text-ink">
            {multi ? "View my bookings & QRs" : "View booking & QR"} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link href="/" className="flex h-[52px] items-center justify-center rounded-full border border-cream/25 text-[14.5px] font-medium text-cream/85 transition-colors hover:border-cream hover:text-cream">
            Back to home
          </Link>

          {!stay && (
            <div className="mt-2">
              <div className="h-[3px] overflow-hidden rounded-full bg-cream/10">
                <motion.div
                  className="h-full bg-cream/70"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: d(3.6), duration: AUTO_SECONDS, ease: "linear" }}
                  onAnimationComplete={() => router.push(href)}
                />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.12em] text-cream/45">
                <span>{multi ? "Opening your bookings…" : "Opening your booking…"}</span>
                <button type="button" onClick={() => setStay(true)} className="underline-offset-4 hover:text-cream hover:underline">
                  Stay here
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );

  return createPortal(content, document.body);
}
