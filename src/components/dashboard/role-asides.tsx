"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CustomerAside() {
  return (
    <Link href="/services" className="group block rounded-2xl bg-cream/7 p-4 transition-colors hover:bg-cream/11">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/45">Something broken?</div>
      <div className="mt-1.5 flex items-center justify-between text-[14px] font-semibold">
        Book a service
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
      </div>
      <div className="mt-1 text-[12px] text-cream/55">7 trades · real time slots</div>
    </Link>
  );
}

/** Availability switch (demo-only, local state). */
export function ProfessionalAside() {
  const [on, setOn] = useState(true);
  return (
    <div className="rounded-2xl bg-cream/7 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/45">Status</div>
          <div className="mt-1 text-[14px] font-semibold">{on ? "Accepting jobs" : "Paused"}</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Accepting new jobs"
          onClick={() => setOn((v) => !v)}
          className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-cream" : "bg-cream/20")}
        >
          <motion.span layout className={cn("absolute top-0.5 h-5 w-5 rounded-full", on ? "right-0.5 bg-ink" : "left-0.5 bg-cream")} transition={{ type: "spring", stiffness: 500, damping: 32 }} />
        </button>
      </div>
      <div className="mt-2 text-[12px] text-cream/55">{on ? "New assignments can reach you." : "You won’t get new assignments."}</div>
    </div>
  );
}

export function AdminAside() {
  const bookings = useApp((s) => s.bookings);
  const pros = useApp((s) => s.pros);
  const unassigned = bookings.filter((b) => b.status === "CONFIRMED" && !b.professionalId).length;
  const pending = pros.filter((p) => p.verification === "PENDING").length;
  const refunds = bookings.filter((b) => b.payment.status === "REFUND_PENDING").length;
  const total = unassigned + pending + refunds;
  return (
    <Link href="/admin/dashboard#queue" className="group block rounded-2xl bg-cream/7 p-4 transition-colors hover:bg-cream/11">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-cream/45">Ops queue</div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[26px] font-black leading-none tracking-[-0.04em]">{total}</span>
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
      </div>
      <div className="mt-1 text-[12px] text-cream/55">
        {unassigned} unassigned · {pending} to verify · {refunds} refunds
      </div>
    </Link>
  );
}
