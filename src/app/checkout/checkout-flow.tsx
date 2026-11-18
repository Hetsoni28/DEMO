"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/atoms/ui";
import { ReadyGate } from "@/components/molecules/ready-gate";
import { BookingFlow } from "@/components/organisms/booking-flow";
import { useApp } from "@/lib/store";

/**
 * Takes a snapshot of the basket when checkout starts, so the flow (and the
 * confirmation screen) stay stable even after payment empties the basket.
 */
function Checkout() {
  const cart = useApp((s) => s.cart);
  const [slugs] = useState(() => cart);

  if (!slugs.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
        <h1 className="mt-5 text-3xl font-black tracking-[-0.04em]">Your basket is empty.</h1>
        <p className="mt-2 text-slate-500">Add every service you need, then book them together with a single payment.</p>
        <Link href="/services" className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-cream">
          Browse services <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );

  return <BookingFlow slugs={slugs} backHref="/services" backLabel="Keep browsing services" />;
}

export function CheckoutFlow() {
  return (
    <ReadyGate
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-8 h-96" />
        </div>
      }
    >
      <Checkout />
    </ReadyGate>
  );
}
