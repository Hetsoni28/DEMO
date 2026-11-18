"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Clock, Phone, QrCode, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { categoryIcons } from "@/components/atoms/icons";
import { greeting, relative, useNow } from "@/components/dashboard/kit";
import { ReadyGate } from "@/components/molecules/ready-gate";
import { ServiceTile } from "@/components/molecules/service-tile";
import { statusLabel } from "@/components/molecules/status-badge";
import { fmtDate, fmtTime, formatINR } from "@/lib/format";
import { categories, getService, services } from "@/lib/mock-data";
import { useAccount, useApp, useMyCustomerId } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEPS = ["Booked", "Pro assigned", "Started", "Done"];
const stepIndex: Record<string, number> = { CONFIRMED: 0, ASSIGNED: 1, IN_PROGRESS: 2, COMPLETED: 3 };
const UPCOMING = ["CONFIRMED", "ASSIGNED", "IN_PROGRESS"];

/** Section heading used on every app screen: one size, optional "See all". */
function Section({ title, href, children, className }: { title: string; href?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("mt-7", className)}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-bold tracking-tight text-ink">{title}</h2>
        {href && (
          <Link href={href} className="flex items-center gap-0.5 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function CustomerHome() {
  const now = useNow(30_000);
  const me = useMyCustomerId();
  const account = useAccount();
  const all = useApp((s) => s.bookings);
  const pros = useApp((s) => s.pros);
  const addresses = useApp((s) => s.addresses);
  const first = (account?.name ?? "there").split(" ")[0];
  const zone = addresses[0]?.zone ?? "Ahmedabad";

  const mine = useMemo(() => all.filter((b) => b.customerId === me), [all, me]);
  const upcoming = mine.filter((b) => UPCOMING.includes(b.status)).sort((a, b) => a.start.localeCompare(b.start));
  const next = upcoming[0];
  const pro = pros.find((p) => p.id === next?.professionalId);
  const nextSvc = next ? getService(next.serviceSlug) : undefined;
  const spent = mine.filter((b) => b.payment.status === "CAPTURED").reduce((n, b) => n + b.amounts.total, 0);

  const warranties = mine
    .filter((b) => b.status === "COMPLETED")
    .map((b) => {
      const svc = getService(b.serviceSlug)!;
      const until = new Date(b.end).getTime() + svc.warrantyDays * 86_400_000;
      return { b, svc, daysLeft: Math.ceil((until - now) / 86_400_000) };
    })
    .filter((w) => w.svc.warrantyDays > 0 && w.daysLeft > 0);

  const popular = services.filter((s) => s.popular);
  const bookAgain = [...new Set(mine.filter((b) => b.status === "COMPLETED").map((b) => b.serviceSlug))].map((slug) => getService(slug)!).filter(Boolean);

  return (
    <>
      {/* greeting + quick stats */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-ink">
            {greeting(now)}, {first}
          </h1>
          <p className="mt-0.5 text-[14px] text-ink/60">What needs fixing at home today?</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {[
            { k: "Upcoming", v: String(upcoming.length), href: "/customer/bookings" },
            { k: "Paid", v: formatINR(spent), href: "/customer/bookings" },
            { k: "Warranties", v: String(warranties.length), href: "/customer/home-passport" },
          ].map((c) => (
            <Link key={c.k} href={c.href} className="shrink-0 rounded-xl border border-ink/8 bg-white px-3 py-2 transition-colors hover:border-ink/20">
              <div className="text-[11px] font-medium text-ink/50">{c.k}</div>
              <div className="text-[15px] font-bold leading-tight text-ink">{c.v}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* next visit */}
      {next && nextSvc && (
        <section data-tour="next-visit" className="mt-5 rounded-2xl border border-ink/8 bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink text-cream">
              {(() => {
                const cat = categories.find((c) => c.slug === nextSvc.categorySlug);
                const Icon = cat ? categoryIcons[cat.icon] : Clock;
                return <Icon className="h-5 w-5" />;
              })()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11.5px] font-semibold uppercase tracking-wide text-emerald-700">Next visit · {relative(new Date(next.start).getTime() - now)}</span>
                <span className="rounded-md bg-ink/6 px-1.5 py-0.5 text-[11px] font-medium text-ink/60">{next.code}</span>
              </div>
              <div className="mt-0.5 truncate text-[16px] font-bold text-ink">{nextSvc.title}</div>
              <div className="text-[13px] text-ink/60">
                {fmtDate(next.start)} · {fmtTime(next.start)} – {fmtTime(next.end)}
              </div>
            </div>
            <Link
              href={`/customer/bookings/${next.id}`}
              data-tour="qr"
              className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-ink/10 px-3 py-2 text-[11.5px] font-semibold text-ink transition-colors hover:border-ink/30"
            >
              <QrCode className="h-5 w-5" /> Show QR
            </Link>
          </div>

          {/* status steps */}
          <ol className="mt-4 grid grid-cols-4 gap-1.5" aria-label={`Status: ${statusLabel(next.status)}`}>
            {STEPS.map((s, i) => {
              const done = i <= (stepIndex[next.status] ?? 0);
              return (
                <li key={s}>
                  <div className={cn("h-1 rounded-full", done ? "bg-emerald-600" : "bg-ink/10")} />
                  <div className={cn("mt-1.5 text-[11px]", done ? "font-semibold text-ink" : "text-ink/45")}>{s}</div>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 flex items-center gap-3 border-t border-ink/8 pt-3">
            {pro ? (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-[12px] font-bold text-ink">
                  {pro.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold text-ink">{pro.name}</div>
                  <div className="flex items-center gap-1 text-[12px] text-ink/55">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {pro.rating.toFixed(1)} · {pro.trade}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.message(`Calling ${pro.name.split(" ")[0]} (demo)`, { description: "Calls are masked so neither side sees the other's number." })}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink transition-colors hover:border-ink/30"
                  aria-label={`Call ${pro.name}`}
                >
                  <Phone className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="text-[13px] text-ink/60">We’re assigning a verified professional. You’ll be notified.</div>
            )}
          </div>
        </section>
      )}

      {/* trades */}
      <Section title="Book by trade" href="/services">
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7">
          {categories.map((c) => {
            const Icon = categoryIcons[c.icon];
            return (
              <Link key={c.slug} href={`/services?category=${c.slug}`} className="group flex flex-col items-center gap-1.5 text-center">
                <span className="flex aspect-square w-full items-center justify-center rounded-2xl border border-ink/8 bg-white transition-colors group-hover:border-ink/25">
                  <Icon className="h-6 w-6 text-ink" strokeWidth={1.8} />
                </span>
                <span className="line-clamp-2 min-h-[2.4em] text-[12px] font-medium leading-[1.2] text-ink/80">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* popular */}
      <Section title={`Popular in ${zone}`} href="/services">
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {popular.map((s) => (
            <ServiceTile key={s.slug} service={s} className="w-40 shrink-0 snap-start sm:w-auto" />
          ))}
        </div>
      </Section>

      {/* book again */}
      {bookAgain.length > 0 && (
        <Section title="Book again" href="/customer/bookings">
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
            {bookAgain.map((s) => (
              <ServiceTile key={s.slug} service={s} className="w-40 shrink-0 snap-start sm:w-auto" />
            ))}
          </div>
        </Section>
      )}

      {/* warranty */}
      {warranties[0] && (
        <Link href="/customer/home-passport" className="mt-7 flex items-center gap-3 rounded-2xl border border-ink/8 bg-white p-4 transition-colors hover:border-ink/20">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-semibold text-ink">{warranties[0].svc.title} is under warranty</div>
            <div className="text-[12.5px] text-ink/55">
              {warranties[0].daysLeft} days left · saved in your Home passport
              {warranties.length > 1 ? ` · +${warranties.length - 1} more` : ""}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-ink/35" />
        </Link>
      )}
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <CustomerHome />
    </ReadyGate>
  );
}
