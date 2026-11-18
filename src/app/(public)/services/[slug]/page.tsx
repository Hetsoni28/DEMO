import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ArrowLeft, BadgeCheck, Check, Clock, ShieldCheck, Star, X } from "lucide-react";
import { categoryIcons } from "@/components/atoms/icons";
import { Badge, Card, LinkButton } from "@/components/atoms/ui";
import { ServiceCard } from "@/components/molecules/service-card";
import { AddToCartButton } from "@/components/cart/cart";
import { LineReveal } from "@/components/motion/motion";
import { formatDuration, formatINR, priceLabel, pricingTypeLabel, priceBreakdown } from "@/lib/format";
import { getCategory, getService, GST_RATE, services } from "@/lib/mock-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return { title: "Service not found", robots: { index: false } };
  const warranty = s.warrantyDays ? ` · ${s.warrantyDays}-day warranty` : "";
  return pageMetadata({
    title: s.title,
    description: `${s.short} ${priceLabel(s.pricePaise, s.pricingType)} + ${GST_RATE * 100}% GST · ${formatDuration(s.durationMin)}${warranty}. Book a verified professional in Ahmedabad.`,
    path: `/services/${slug}`,
    ownImage: true,
  });
}

/** Reads the URL param inside Suspense so navigation stays instant. */
async function ServiceDetailContent({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const cat = getCategory(service.categorySlug)!;
  const Icon = categoryIcons[cat.icon];
  const price = priceBreakdown(service.pricePaise);
  const related = services.filter((s) => s.categorySlug === service.categorySlug && s.slug !== service.slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <Link href="/services" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> All services
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-teal-brand">
              <Icon className="h-6 w-6" />
            </span>
            <Badge tone="teal">{cat.name}</Badge>
          </div>
          <h1 className="mt-6 text-[clamp(2.75rem,6.5vw,5.5rem)] font-black leading-[0.9] tracking-[-0.055em] text-ink">
            <LineReveal lines={[service.title]} />
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-[13px] text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-ink text-ink" /> {service.rating} · {service.reviews.toLocaleString("en-IN")} reviews
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" /> ~{formatDuration(service.durationMin)}
            </span>
            {service.warrantyDays > 0 && (
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-teal-brand" /> {service.warrantyDays}-day warranty
              </span>
            )}
          </div>
          <p className="mt-6 max-w-2xl leading-relaxed text-slate-600">{service.description}</p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900">What&apos;s included</h3>
              <ul className="mt-3 space-y-2">
                {service.inclusions.map((i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {i}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900">Not included</h3>
              <ul className="mt-3 space-y-2">
                {service.exclusions.map((i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {i}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="mt-4 bg-navy-50/60 p-5">
            <h3 className="font-semibold text-slate-900">Additional work policy</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              If your professional finds something outside this service, they send a quotation to your app. Nothing extra is done or charged until you approve it.
            </p>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <div className="text-sm text-slate-500">{pricingTypeLabel(service.pricingType)}</div>
            <div className="mt-1 text-3xl font-semibold text-navy-900">{formatINR(service.pricePaise)}</div>
            <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Service charge</dt>
                <dd>{formatINR(price.base)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>GST ({GST_RATE * 100}%)</dt>
                <dd>{formatINR(price.tax)}</dd>
              </div>
              <div className="flex justify-between font-semibold text-slate-900">
                <dt>Total</dt>
                <dd>{formatINR(price.total)}</dd>
              </div>
            </dl>
            <LinkButton href={`/book/${service.slug}`} variant="teal" size="lg" className="mt-6 w-full">
              Book this now
            </LinkButton>
            <AddToCartButton slug={service.slug} variant="full" className="mt-3" />
            <p className="mt-2 text-center text-[12px] text-slate-500">Need more done? Add it to one booking and pay once.</p>
            <ul className="mt-5 space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-teal-brand" /> Background-verified professionals only
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-brand" /> Free cancellation up to 2 hours before
              </li>
            </ul>
          </Card>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold text-navy-900">Related services</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ServiceDetailFallback() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8" aria-busy>
      <div className="h-4 w-28 animate-pulse rounded bg-ink/10" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-ink/10" />
          <div className="mt-6 h-20 w-3/4 animate-pulse rounded-2xl bg-ink/10" />
          <div className="mt-6 h-24 animate-pulse rounded-2xl bg-ink/10" />
        </div>
        <div className="h-80 animate-pulse rounded-3xl bg-ink/10" />
      </div>
    </div>
  );
}

export default function ServiceDetail({ params }: Props) {
  return (
    <Suspense fallback={<ServiceDetailFallback />}>
      <ServiceDetailContent params={params} />
    </Suspense>
  );
}
