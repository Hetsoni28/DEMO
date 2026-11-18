"use client";

import Link from "next/link";
import { useMemo } from "react";
import { toast } from "sonner";
import { ArrowUpRight, CalendarCheck, Check, MapPin, Phone, QrCode, ShieldCheck, Star, Wallet } from "lucide-react";
import { categoryIcons } from "@/components/atoms/icons";
import { ServiceQr } from "@/components/atoms/service-qr";
import { DashHeader, EmptyState, InkButton, Kpi, Panel, Progress, greeting, relative, todayLabel, useNow } from "@/components/dashboard/kit";
import { ReadyGate } from "@/components/molecules/ready-gate";
import { BookingRow } from "@/components/molecules/booking-row";
import { statusLabel } from "@/components/molecules/status-badge";
import { fmtDate, fmtTime, formatINR } from "@/lib/format";
import { categories, DEMO_CUSTOMER, getService, services } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEPS = ["Booked", "Pro assigned", "Job started", "Completed"];
const stepIndex: Record<string, number> = { CONFIRMED: 0, ASSIGNED: 1, IN_PROGRESS: 2, COMPLETED: 3 };

function CustomerDashboard() {
  const now = useNow(30_000);
  const all = useApp((s) => s.bookings);
  const pros = useApp((s) => s.pros);
  const first = DEMO_CUSTOMER.name.split(" ")[0];

  const mine = useMemo(() => all.filter((b) => b.customerId === DEMO_CUSTOMER.id).sort((a, b) => b.start.localeCompare(a.start)), [all]);
  const upcoming = mine.filter((b) => ["CONFIRMED", "ASSIGNED", "IN_PROGRESS"].includes(b.status)).sort((a, b) => a.start.localeCompare(b.start));
  const next = upcoming[0];
  const pro = pros.find((p) => p.id === next?.professionalId);
  const spent = mine.filter((b) => ["CAPTURED"].includes(b.payment.status)).reduce((n, b) => n + b.amounts.total, 0);

  const warranties = mine
    .filter((b) => b.status === "COMPLETED")
    .map((b) => {
      const svc = getService(b.serviceSlug)!;
      const until = new Date(b.end).getTime() + svc.warrantyDays * 86_400_000;
      return { b, svc, daysLeft: Math.ceil((until - now) / 86_400_000) };
    })
    .filter((w) => w.svc.warrantyDays > 0);
  const activeWarranties = warranties.filter((w) => w.daysLeft > 0);

  const activity = mine
    .flatMap((b) => b.history.map((h) => ({ ...h, b })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  return (
    <>
      <DashHeader
        eyebrow={`${todayLabel(now)} · ${greeting(now)}`}
        title={<>Hi, {first}.</>}
        sub="Everything happening at home — visits, payments, warranties — in one place."
        actions={
          <>
            <InkButton href="/customer/home-passport" variant="outline">
              Home passport
            </InkButton>
            <InkButton href="/services">
              Book a service <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            </InkButton>
          </>
        }
      />

      {/* Next visit + KPIs */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.55fr_1fr]">
        {next ? (
          <Panel tour="next-visit" tone="ink" className="relative overflow-hidden" bodyClassName="p-6 sm:p-8">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-stretch sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream/50">
                  Next visit · {next.code} · {statusLabel(next.status)}
                </div>
                <div className="mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-[0.95] tracking-[-0.045em]">{getService(next.serviceSlug)?.title}</div>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-[22px] font-bold tracking-[-0.02em]">{relative(new Date(next.start).getTime() - now)}</span>
                  <span className="font-mono text-[12px] text-cream/60">
                    {fmtDate(next.start)} · {fmtTime(next.start)} – {fmtTime(next.end)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[13px] text-cream/60">
                  <MapPin className="h-3.5 w-3.5" /> {next.address}
                </div>

                {/* stepper */}
                <ol className="mt-7 grid grid-cols-4 gap-2" aria-label="Visit progress">
                  {STEPS.map((s, i) => {
                    const done = i <= (stepIndex[next.status] ?? 0);
                    return (
                      <li key={s}>
                        <div className={cn("h-1 rounded-full", done ? "bg-cream" : "bg-cream/15")} />
                        <div className={cn("mt-2 flex items-center gap-1 text-[11.5px]", done ? "text-cream" : "text-cream/40")}>
                          {done && <Check className="h-3 w-3" />} {s}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  {pro ? (
                    <div className="flex items-center gap-3 rounded-full bg-cream/[0.08] py-1.5 pl-1.5 pr-4">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-[12px] font-bold text-ink">
                        {pro.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </span>
                      <span className="text-[13px]">
                        <span className="font-semibold">{pro.name}</span>
                        <span className="ml-2 inline-flex items-center gap-1 text-cream/60">
                          <Star className="h-3 w-3 fill-current" /> {pro.rating} · {pro.trade}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <span className="rounded-full bg-cream/[0.08] px-4 py-2 text-[13px] text-cream/70">Professional being assigned</span>
                  )}
                  {pro && (
                    <button
                      type="button"
                      onClick={() => toast.message(`Calling ${pro.name} via masked number (demo)`)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:bg-cream hover:text-ink"
                      aria-label={`Call ${pro.name}`}
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <Link
                href={`/customer/bookings/${next.id}`}
                className="group flex shrink-0 flex-col items-center justify-between rounded-[22px] bg-cream p-4 text-ink sm:w-[190px]"
                aria-label="Open service QR"
                data-tour="qr"
              >
                {next.qr && !next.qr.consumedAt ? <ServiceQr token={next.qr.token} size={150} /> : <QrCode className="m-8 h-16 w-16 text-ink/30" />}
                <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold">
                  Show at the door <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </Link>
            </div>
          </Panel>
        ) : (
          <Panel tone="ink" bodyClassName="p-8">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream/50">No upcoming visits</div>
            <div className="mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-[0.95] tracking-[-0.045em]">Everything’s working. For now.</div>
            <InkButton href="/services" variant="cream" className="mt-6">
              Book a service <ArrowUpRight className="h-4 w-4" />
            </InkButton>
          </Panel>
        )}

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-1">
          <Kpi label="Upcoming visits" value={upcoming.length} icon={CalendarCheck} hint={upcoming[1] ? `Then ${getService(upcoming[1].serviceSlug)?.title} · ${fmtDate(upcoming[1].start)}` : "Nothing else booked"} />
          <Kpi label="Paid · verified" value={spent} format={formatINR} icon={Wallet} hint={`${mine.filter((b) => b.payment.status === "CAPTURED").length} payments`} />
          <Kpi label="Active warranties" value={activeWarranties.length} icon={ShieldCheck} className="col-span-2 lg:col-span-1" hint={activeWarranties[0] ? `${activeWarranties[0].svc.title} · ${activeWarranties[0].daysLeft} days left` : "None right now"}>
            {activeWarranties[0] && <Progress value={activeWarranties[0].daysLeft / activeWarranties[0].svc.warrantyDays} />}
          </Kpi>
        </div>
      </div>

      {/* Quick book */}
      <section className="mt-5" aria-labelledby="quick-book">
        <div className="mb-3 flex items-end justify-between">
          <h2 id="quick-book" className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">
            Book again · 7 trades
          </h2>
          <Link href="/services" className="text-[12.5px] font-medium text-ink/60 hover:text-ink">
            All {services.length} services →
          </Link>
        </div>
        <ul className="stagger-fast -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-7 lg:overflow-visible lg:px-0">
          {categories.map((c) => {
            const Icon = categoryIcons[c.icon];
            const from = Math.min(...services.filter((s) => s.categorySlug === c.slug).map((s) => s.pricePaise));
            return (
              <li key={c.slug} className="w-[150px] shrink-0 lg:w-auto">
                <Link href={`/services?category=${c.slug}`} className="group relative block h-full overflow-hidden rounded-[22px] border border-ink/10 bg-paper p-4">
                  <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
                  <Icon className="relative h-5 w-5 transition-colors group-hover:text-cream" />
                  <div className="relative mt-6 text-[14px] font-bold leading-tight tracking-[-0.02em] transition-colors group-hover:text-cream">{c.name}</div>
                  <div className="relative mt-1 font-mono text-[10.5px] text-ink/50 transition-colors group-hover:text-cream/60">from {formatINR(from)}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Bookings + activity */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.55fr_1fr]">
        <Panel eyebrow="Bookings" title="Recent" action={{ label: "View all", href: "/customer/bookings" }} bodyClassName="px-3 pb-3">
          {mine.length ? (
            <div className="stagger-fast">
              {mine.slice(0, 5).map((b) => (
                <BookingRow key={b.id} booking={b} href={`/customer/bookings/${b.id}`} sub={pros.find((p) => p.id === b.professionalId)?.name} />
              ))}
            </div>
          ) : (
            <EmptyState title="No bookings yet" text="Your first booking will appear here." action={<InkButton href="/services">Book a service</InkButton>} />
          )}
        </Panel>

        <Panel eyebrow="Timeline" title="Activity">
          <ol className="stagger-fast relative space-y-5 border-l border-ink/15 pl-5">
            {activity.map((a, i) => (
              <li key={`${a.b.id}-${a.at}-${a.status}`} className="relative">
                <span className={cn("absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-paper", i === 0 ? "bg-ink" : "bg-ink/25")} />
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[13.5px] font-semibold">
                    {getService(a.b.serviceSlug)?.title} · {statusLabel(a.status)}
                  </span>
                  <span className="shrink-0 font-mono text-[10.5px] text-ink/45">{relative(new Date(a.at).getTime() - now)}</span>
                </div>
                {a.note && <div className="mt-0.5 text-[12.5px] text-ink/55">{a.note}</div>}
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      {/* Warranties */}
      {warranties.length > 0 && (
        <Panel className="mt-5" eyebrow="Home passport" title="Warranties" action={{ label: "Open passport", href: "/customer/home-passport" }}>
          <ul className="stagger-fast grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {warranties.map(({ b, svc, daysLeft }) => (
              <li key={b.id} className="rounded-[20px] border border-ink/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-[14px] font-semibold">{svc.title}</span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold", daysLeft > 0 ? "bg-[#E8F3EC] text-[#1E7A4A]" : "bg-ink/[0.06] text-ink/50")}>
                    {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-ink/45">Done {fmtDate(b.end)}</div>
                <Progress className="mt-3" value={Math.max(0, daysLeft) / svc.warrantyDays} />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <CustomerDashboard />
    </ReadyGate>
  );
}
