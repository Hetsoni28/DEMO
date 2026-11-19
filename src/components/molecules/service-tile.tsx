"use client";

import Link from "next/link";
import { Check, Clock, Plus, Star } from "lucide-react";
import { ServiceImage } from "@/components/molecules/service-image";
import { formatDuration, formatINR, priceLabel } from "@/lib/format";
import { type Service } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * App-style service tile (Blinkit/Zepto pattern): every tile is the same size —
 * icon area, two-line title, time + rating, price and an ADD button.
 */
export function ServiceTile({ service, className, href }: { service: Service; className?: string; href?: string }) {
  const inCart = useApp((s) => s.cart.includes(service.slug));
  const add = useApp((s) => s.addToCart);
  const remove = useApp((s) => s.removeFromCart);

  return (
    <div className={cn("relative flex h-full flex-col rounded-2xl border border-ink/8 bg-white p-2.5 transition-shadow hover:shadow-[0_12px_30px_-18px_rgba(40,43,74,0.35)]", className)}>
      <Link href={href ?? `/customer/services/${service.slug}`} className="flex flex-1 flex-col after:absolute after:inset-0 after:content-['']" aria-label={`${service.title}, ${priceLabel(service.pricePaise, service.pricingType)}`}>
        <div className="relative">
          <ServiceImage categorySlug={service.categorySlug} alt={service.title} className="aspect-4/3 w-full rounded-xl" />
          {service.popular && <span className="absolute left-2 top-2 rounded-md bg-ink px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-cream">Popular</span>}
        </div>
        <div className="mt-2.5 line-clamp-2 min-h-[2.6em] text-[13.5px] font-semibold leading-[1.3] text-ink">{service.title}</div>
        <div className="mt-1 flex items-center gap-2 text-[11.5px] text-ink/55">
          <span className="flex items-center gap-0.5">
            <Clock className="h-3 w-3" />
            {formatDuration(service.durationMin)}
          </span>
          <span className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {service.rating.toFixed(1)}
          </span>
        </div>
      </Link>
      <div className="relative z-10 mt-2.5 flex items-center justify-between gap-2">
        {/* one line always: "from" / "visit" sit above the amount so every tile keeps the same height */}
        <span className="min-w-0 leading-none">
          <span className="block h-3 text-[10px] font-medium text-ink/50">{service.pricingType === "STARTING" ? "from" : service.pricingType === "INSPECTION" ? "visit" : ""}</span>
          <span className="block whitespace-nowrap text-[14px] font-bold text-ink">{formatINR(service.pricePaise)}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            if (inCart) {
              remove(service.slug);
              return;
            }
            add(service.slug);
          }}
          aria-pressed={inCart}
          aria-label={inCart ? `Remove ${service.title} from basket` : `Add ${service.title} to basket`}
          className={cn(
            "flex h-8 min-w-16 items-center justify-center gap-1 rounded-lg border px-2.5 text-[12.5px] font-bold transition-colors active:scale-95",
            inCart ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-700 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
          )}
        >
          {inCart ? (
            <>
              <Check className="h-3.5 w-3.5" /> Added
            </>
          ) : (
            <>
              ADD <Plus className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
