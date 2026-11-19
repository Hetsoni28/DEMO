"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, Clock, Plus, QrCode, ShieldCheck, Star, Wallet, X } from "lucide-react";
import { ServiceImage } from "@/components/molecules/service-image";
import { ServiceTile } from "@/components/molecules/service-tile";
import { formatDuration, formatINR, priceBreakdown, pricingTypeLabel } from "@/lib/format";
import { getCategory, getService, GST_RATE, services } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Wallet, title: "Pick a time & pay", text: "Real slots from verified pros. Your booking confirms once payment is verified." },
  { icon: BadgeCheck, title: "A verified pro is assigned", text: "You see their name, rating and trade before they arrive." },
  { icon: QrCode, title: "They scan your QR", text: "Only your assigned professional can start the job." },
  { icon: ShieldCheck, title: "Report & warranty", text: "Photos, invoice and warranty are saved to your Home passport." },
];

export function AppServiceDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const service = getService(slug);
  const inCart = useApp((s) => s.cart.includes(slug));
  const add = useApp((s) => s.addToCart);
  const remove = useApp((s) => s.removeFromCart);

  if (!service)
    return (
      <div className="rounded-2xl border border-ink/8 bg-white p-10 text-center">
        <div className="text-[17px] font-bold text-ink">This service isn’t available</div>
        <Link href="/customer/services" className="mt-4 inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13.5px] font-semibold text-cream">
          Browse services
        </Link>
      </div>
    );

  const cat = getCategory(service.categorySlug)!;
  const price = priceBreakdown(service.pricePaise);
  const related = services.filter((s) => s.categorySlug === service.categorySlug && s.slug !== service.slug).slice(0, 5);
  const fromLabel = service.pricingType === "STARTING" ? "from " : service.pricingType === "INSPECTION" ? "visit " : "";

  const toggle = () => (inCart ? remove(slug) : add(slug));
  const bookNow = () => router.push(`/customer/checkout?service=${encodeURIComponent(slug)}`);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="min-w-0">
          {/* photo */}
          <div className="relative -mx-4 sm:mx-0">
            <ServiceImage categorySlug={service.categorySlug} alt={service.title} priority sizes="(min-width: 1024px) 720px, 100vw" className="aspect-16/10 w-full sm:rounded-2xl" />
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? router.back() : router.push("/customer/services"))}
              aria-label="Back"
              className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-ink shadow-md transition-transform active:scale-90"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            {service.popular && <span className="absolute right-3 top-3 rounded-lg bg-ink px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-cream">Popular</span>}
          </div>

          {/* title + facts */}
          <div className="mt-4">
            <Link href={`/customer/services?category=${cat.slug}`} className="text-[12.5px] font-semibold text-emerald-700">
              {cat.name}
            </Link>
            <h1 className="mt-0.5 text-[22px] font-bold leading-tight tracking-tight text-ink">{service.title}</h1>
            <p className="mt-1 text-[14px] leading-relaxed text-ink/65">{service.short}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-[12.5px] font-semibold text-ink ring-1 ring-ink/8">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {service.rating.toFixed(1)}
                <span className="font-normal text-ink/50">({service.reviews.toLocaleString("en-IN")})</span>
              </span>
              <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-[12.5px] font-semibold text-ink ring-1 ring-ink/8">
                <Clock className="h-3.5 w-3.5" /> {formatDuration(service.durationMin)}
              </span>
              {service.warrantyDays > 0 && (
                <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 text-[12.5px] font-semibold text-emerald-800 ring-1 ring-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" /> {service.warrantyDays}-day warranty
                </span>
              )}
            </div>
          </div>

          {/* about */}
          <section className="mt-5 rounded-2xl border border-ink/8 bg-white p-4">
            <h2 className="text-[16px] font-bold text-ink">About this service</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink/70">{service.description}</p>
          </section>

          {/* included / not included */}
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <section className="rounded-2xl border border-ink/8 bg-white p-4">
              <h2 className="text-[16px] font-bold text-ink">What’s included</h2>
              <ul className="mt-2 space-y-2">
                {service.inclusions.map((i) => (
                  <li key={i} className="flex gap-2 text-[13.5px] text-ink/75">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {i}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-ink/8 bg-white p-4">
              <h2 className="text-[16px] font-bold text-ink">Not included</h2>
              <ul className="mt-2 space-y-2">
                {service.exclusions.map((i) => (
                  <li key={i} className="flex gap-2 text-[13.5px] text-ink/75">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-ink/35" /> {i}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-3 rounded-2xl bg-ink p-4 text-cream">
            <h2 className="text-[15px] font-bold">Extra work? You decide.</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-cream/70">If the pro finds something outside this service, you get a quote in the app. Nothing extra is done or charged until you approve it.</p>
          </section>

          {/* how it works */}
          <section className="mt-6">
            <h2 className="mb-3 text-[17px] font-bold tracking-tight text-ink">How it works</h2>
            <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3 rounded-2xl border border-ink/8 bg-white p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-ink">
                    <s.icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-ink">
                      {i + 1}. {s.title}
                    </div>
                    <div className="mt-0.5 text-[12.5px] leading-snug text-ink/60">{s.text}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* desktop price card */}
        <aside className="hidden lg:sticky lg:top-32 lg:block">
          <div className="rounded-2xl border border-ink/8 bg-white p-4">
            <div className="text-[12.5px] font-medium text-ink/55">{pricingTypeLabel(service.pricingType)}</div>
            <div className="mt-0.5 text-[26px] font-bold tracking-tight text-ink">
              <span className="text-[14px] font-semibold text-ink/50">{fromLabel}</span>
              {formatINR(service.pricePaise)}
            </div>
            <dl className="mt-3 space-y-1.5 border-t border-ink/8 pt-3 text-[13.5px]">
              <div className="flex justify-between text-ink/65">
                <dt>Service</dt>
                <dd>{formatINR(price.base)}</dd>
              </div>
              <div className="flex justify-between text-ink/65">
                <dt>GST ({GST_RATE * 100}%)</dt>
                <dd>{formatINR(price.tax)}</dd>
              </div>
              <div className="flex justify-between font-bold text-ink">
                <dt>Total</dt>
                <dd>{formatINR(price.total)}</dd>
              </div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <AddButton inCart={inCart} onClick={toggle} />
              <button type="button" onClick={bookNow} className="h-11 rounded-xl bg-ink text-[14px] font-semibold text-cream transition-transform active:scale-95">
                Book now
              </button>
            </div>
            <ul className="mt-4 space-y-1.5 text-[12.5px] text-ink/60">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-700" /> Background-verified professionals
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700" /> Free cancellation up to 2 hours before
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* similar */}
      {related.length > 0 && (
        <section className="mt-7">
          <h2 className="mb-3 text-[17px] font-bold tracking-tight text-ink">More in {cat.name}</h2>
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
            {related.map((s) => (
              <ServiceTile key={s.slug} service={s} className="w-40 shrink-0 snap-start sm:w-auto" />
            ))}
          </div>
        </section>
      )}

      {/* phone: sticky action bar above the tab bar */}
      <div className="fixed inset-x-3 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-40 lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-ink/10 bg-white p-2.5 pl-4 shadow-[0_18px_40px_-16px_rgba(40,43,74,0.45)]">
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[16px] font-bold text-ink">
              <span className="text-[12px] font-semibold text-ink/50">{fromLabel}</span>
              {formatINR(service.pricePaise)}
            </div>
            <div className="text-[11.5px] text-ink/55">+ {GST_RATE * 100}% GST</div>
          </div>
          <AddButton inCart={inCart} onClick={toggle} compact />
          <button type="button" onClick={bookNow} className="h-10 rounded-xl bg-ink px-4 text-[13.5px] font-semibold text-cream transition-transform active:scale-95">
            Book now
          </button>
        </div>
      </div>
    </>
  );
}

function AddButton({ inCart, onClick, compact = false }: { inCart: boolean; onClick: () => void; compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={inCart}
      className={cn(
        "flex items-center justify-center gap-1 rounded-xl border text-[13.5px] font-bold transition-colors active:scale-95",
        compact ? "h-10 px-3" : "h-11",
        inCart ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-700 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
      )}
    >
      {inCart ? (
        <>
          <Check className="h-4 w-4" /> Added
        </>
      ) : (
        <>
          ADD <Plus className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
