"use client";

import { motion } from "framer-motion";
import { BadgeCheck, QrCode, ShieldCheck } from "lucide-react";
import { ServiceQr } from "@/components/atoms/service-qr";
import { EASE, LineReveal } from "@/components/motion/motion";

const points = [
  { icon: BadgeCheck, text: "Verified professionals only" },
  { icon: ShieldCheck, text: "Booking confirms after payment is verified" },
  { icon: QrCode, text: "One-time QR check at your door" },
];

/** Editorial indigo panel shown beside the auth forms on large screens. */
export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden bg-ink text-cream lg:flex lg:flex-col">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_70%_55%,rgba(238,235,218,0.09),transparent_70%)]" />

      <div className="relative flex items-start justify-between px-12 pt-10 text-[13px]">
        <div>
          <div className="font-medium">Member access</div>
          <div className="text-cream/55">Customers · Professionals · Admin</div>
        </div>
        <div className="text-right">
          <div className="font-medium">2026</div>
          <div className="text-cream/55">Ahmedabad</div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col justify-center px-12">
        <h2 className="max-w-lg text-[clamp(3rem,5vw,4.75rem)] font-black uppercase leading-[0.86] tracking-[-0.06em]">
          <LineReveal lines={["Your home,", <span key="b" className="text-cream/40">on record.</span>]} delay={0.2} stagger={0.1} />
        </h2>

        <div className="mt-12 flex items-end gap-10">
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
            className="w-62.5 shrink-0 rounded-[26px] bg-cream p-4 text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]"
          >
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
                <span>Booking</span>
                <span>Sample</span>
              </div>
              <div className="mt-1.5 text-[19px] font-bold tracking-[-0.03em]">Geyser Installation</div>
              <div className="mt-3 flex justify-center rounded-2xl bg-paper p-2.5">
                <ServiceQr token="ppq_AUTHPANELSAMPLE" size={120} />
              </div>
              <dl className="mt-3 space-y-1 font-mono text-[11px]">
                {[
                  ["SLOT", "Sat, 10:30 AM"],
                  ["STATUS", "Confirmed"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-dashed border-ink/15 pb-1 last:border-0">
                    <dt className="text-ink/50">{k} :</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </motion.div>

          <ul className="space-y-4 pb-4">
            {points.map((p, i) => (
              <motion.li
                key={p.text}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.8 + i * 0.1 }}
                className="flex items-center gap-3 text-[14px] text-cream/80"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cream/15">
                  <p.icon className="h-4 w-4" />
                </span>
                {p.text}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative flex items-end justify-between border-t border-cream/10 px-12 py-6 text-[12px] text-cream/50">
        <span>Home problems. Professionally solved.</span>
        <span className="font-mono uppercase tracking-[0.14em]">HomeCrew</span>
      </div>
    </aside>
  );
}
