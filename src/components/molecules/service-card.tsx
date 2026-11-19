import Link from "next/link";
import { Clock, Star } from "lucide-react";
import { categoryIcons } from "@/components/atoms/icons";
import { AddToCartButton } from "@/components/cart/cart";
import { ServiceImage } from "@/components/molecules/service-image";
import { formatDuration, priceLabel } from "@/lib/format";
import { getCategory, type Service } from "@/lib/mock-data";

/**
 * Service tile. The whole card links to the service page; the round "+" button
 * (a sibling, not nested in the link) adds the service to the booking basket.
 */
export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  const cat = getCategory(service.categorySlug)!;
  const Icon = categoryIcons[cat.icon];
  return (
    <div className="group relative h-full min-h-75 transition-[transform,box-shadow] duration-700 ease-out-expo hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(40,43,74,0.45)] rounded-[28px]">
      <Link href={`/services/${service.slug}`} className="relative flex h-full min-h-75 flex-col overflow-hidden rounded-[28px] border border-ink/12 bg-paper p-6">
        {/* ink flood on hover */}
        <span className="absolute inset-0 origin-bottom scale-y-0 rounded-[28px] bg-ink transition-transform duration-700 ease-out-expo group-hover:scale-y-100" />
        <div className="relative flex items-start justify-between">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50 transition-colors duration-500 group-hover:text-cream/50">
            {index !== undefined ? `(${String(index + 1).padStart(2, "0")}) ` : ""}
            {cat.name}
          </span>
          {service.popular && (
            <span className="rounded-full border border-ink/15 px-2.5 py-0.5 text-[11px] font-medium text-ink transition-colors duration-500 group-hover:border-cream/25 group-hover:text-cream">
              Popular
            </span>
          )}
        </div>
        <div className="relative mt-5">
          <ServiceImage
            categorySlug={service.categorySlug}
            slug={service.slug}
            alt={service.title}
            className="aspect-16/10 w-full rounded-2xl ring-1 ring-ink/8 transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
          />
          <span className="absolute -bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 bg-paper text-ink shadow-sm transition-transform duration-700 group-hover:rotate-[-8deg]">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <h3 className="relative mt-8 text-[26px] font-bold leading-[1.05] tracking-[-0.035em] text-ink transition-colors duration-500 group-hover:text-cream">{service.title}</h3>
        <p className="relative mt-2 line-clamp-2 text-sm text-ink/60 transition-colors duration-500 group-hover:text-cream/65">{service.short}</p>
        <div className="relative mt-auto pr-16 pt-8">
          <div className="text-xl font-bold tracking-[-0.02em] text-ink transition-colors duration-500 group-hover:text-cream">{priceLabel(service.pricePaise, service.pricingType)}</div>
          <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-ink/55 transition-colors duration-500 group-hover:text-cream/55">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" /> {service.rating}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDuration(service.durationMin)}
            </span>
          </div>
        </div>
      </Link>
      <AddToCartButton slug={service.slug} className="absolute bottom-6 right-6 z-10" />
    </div>
  );
}
