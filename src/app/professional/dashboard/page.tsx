"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, CircleCheck, IndianRupee, MapPin, Navigation, ScanLine, Star } from "lucide-react";
import { BarChart, DashHeader, EmptyState, InkButton, Kpi, Panel, Sparkline, greeting, relative, todayLabel, useNow } from "@/components/dashboard/kit";
import { ReadyGate } from "@/components/molecules/ready-gate";
import { statusLabel } from "@/components/molecules/status-badge";
import { EASE } from "@/components/motion/motion";
import { fmtDate, fmtTime, formatINR } from "@/lib/format";
import { DEMO_PROFESSIONAL_ID, getService } from "@/lib/mock-data";
import { payout } from "@/lib/pro-helpers";
import { dayKey, upcomingDays } from "@/lib/scheduling";
import { useApp, usePro, type Booking } from "@/lib/store";
import { cn } from "@/lib/utils";

const DAY_START = 8 * 60;
const DAY_END = 21 * 60;
const SPAN = DAY_END - DAY_START;
const ACTIVE = ["CONFIRMED", "ASSIGNED", "IN_PROGRESS"];

/** Minutes since midnight in IST (India has no DST). */
const istMinutes = (iso: string | number) => {
  const d = new Date(iso);
  return (d.getUTCHours() * 60 + d.getUTCMinutes() + 330) % 1440;
};
const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? "a" : "p"}`;

const HOUR_PX = 64; // fixed height per hour so every job block has room for its details
const GRID_H = (SPAN / 60) * HOUR_PX;
const PAD = 14; // keeps the first/last hour labels from being clipped
const yOf = (min: number) => ((Math.min(DAY_END, Math.max(DAY_START, min)) - DAY_START) / 60) * HOUR_PX;

function Schedule({ jobs, hours, now }: { jobs: Booking[]; hours: { start: number; end: number; breakStart: number; breakEnd: number }; now: number }) {
  const days = useMemo(() => upcomingDays(6, new Date(now)), [now]);
  const counts = days.map((d) => jobs.filter((j) => dayKey(new Date(j.start)) === d.key).length);
  const firstBusy = Math.max(0, counts.findIndex((c) => c > 0));
  const [sel, setSel] = useState<number | null>(null);
  const idx = sel ?? firstBusy;
  const day = days[idx];
  const dayJobs = jobs.filter((j) => dayKey(new Date(j.start)) === day.key).sort((a, b) => a.start.localeCompare(b.start));
  const isToday = idx === 0;
  const nowMin = istMinutes(now);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Bring the first job (or "now" on today) into view whenever the day changes.
  const focusMin = dayJobs[0] ? istMinutes(dayJobs[0].start) : isToday ? nowMin : hours.start * 60;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: Math.max(0, yOf(focusMin) + PAD - 48), behavior: "smooth" });
  }, [idx, focusMin]);

  const hatch = "bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,rgba(40,43,74,0.05)_6px,rgba(40,43,74,0.05)_12px)]";

  return (
    <div>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Day">
        {days.map((d, i) => (
          <button
            key={d.key}
            role="tab"
            aria-selected={i === idx}
            onClick={() => setSel(i)}
            className={cn("relative flex min-w-[76px] flex-col items-start rounded-2xl px-3 py-2 text-left transition-colors", i === idx ? "text-cream" : "text-ink/70 hover:bg-ink/[0.04]")}
          >
            {i === idx && <motion.span layoutId="sched-day" className="absolute inset-0 rounded-2xl bg-ink" transition={{ duration: 0.4, ease: EASE }} />}
            <span className="relative font-mono text-[10px] uppercase tracking-[0.12em] opacity-60">{i === 0 ? "Today" : fmtDate(d.date.toISOString()).split(",")[0]}</span>
            <span className="relative text-[15px] font-bold">{fmtDate(d.date.toISOString()).split(" ")[1]}</span>
            <span className="relative text-[11px] opacity-60">
              {counts[i]} job{counts[i] === 1 ? "" : "s"}
            </span>
          </button>
        ))}
      </div>

      {/* timeline — scrolls inside the panel */}
      <div ref={scrollRef} className="relative mt-5 max-h-[520px] overflow-y-auto overscroll-contain rounded-[20px] border border-ink/10 bg-cream/60" tabIndex={0} aria-label={`Schedule for ${fmtDate(day.date.toISOString())}`}>
        <div className="relative" style={{ height: GRID_H + PAD * 2 }}>
          <div className="absolute inset-x-0" style={{ top: PAD, height: GRID_H }}>
            {/* outside working hours */}
            <div className={cn("absolute inset-x-0", hatch)} style={{ top: -PAD, height: yOf(hours.start * 60) + PAD }} />
            <div className={cn("absolute inset-x-0", hatch)} style={{ top: yOf(hours.end * 60), bottom: -PAD }} />
            {/* break */}
            <div
              className="absolute inset-x-0 flex items-center justify-end border-y border-dashed border-ink/15 bg-ink/[0.04] pr-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40"
              style={{ top: yOf(hours.breakStart * 60), height: yOf(hours.breakEnd * 60) - yOf(hours.breakStart * 60) }}
            >
              Break
            </div>
            {/* hour lines + labels */}
            {Array.from({ length: SPAN / 60 + 1 }, (_, i) => {
              const h = DAY_START / 60 + i;
              return (
                <div key={h} className="absolute inset-x-0 flex items-center" style={{ top: yOf(h * 60) }}>
                  <span className="w-12 -translate-y-1/2 pl-3 font-mono text-[10px] leading-none text-ink/45">{hourLabel(h)}</span>
                  <span className="h-px flex-1 bg-ink/[0.07]" />
                </div>
              );
            })}
            {/* jobs */}
            {dayJobs.map((j, i) => {
              const top = yOf(istMinutes(j.start));
              const height = Math.max(32, yOf(istMinutes(j.end)) - top - 4);
              const live = j.status === "IN_PROGRESS";
              const compact = height < 52;
              const title = getService(j.serviceSlug)?.title;
              return (
                <motion.div
                  key={j.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.08 }}
                  className="absolute left-14 right-3"
                  style={{ top: top + 2, height }}
                >
                  <Link
                    href={`/professional/jobs/${j.id}`}
                    title={`${title} · ${j.customerName} · ${fmtTime(j.start)} – ${fmtTime(j.end)}`}
                    className={cn(
                      "group flex h-full min-w-0 overflow-hidden rounded-2xl border px-4 transition-shadow hover:shadow-[0_16px_32px_-18px_rgba(40,43,74,0.6)]",
                      compact ? "items-center gap-3 py-1.5" : "flex-col justify-center gap-1 py-2",
                      live ? "border-ink bg-ink text-cream" : "border-ink/15 bg-paper text-ink",
                    )}
                  >
                    {compact ? (
                      <>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{title}</span>
                        <span className={cn("shrink-0 font-mono text-[10.5px]", live ? "text-cream/60" : "text-ink/50")}>{fmtTime(j.start)}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50 transition-transform duration-300 group-hover:rotate-45" />
                      </>
                    ) : (
                      <>
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <span className="min-w-0 truncate text-[14px] font-bold leading-tight tracking-[-0.01em]">{title}</span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-300 group-hover:rotate-45" />
                        </div>
                        <div className={cn("min-w-0 truncate font-mono text-[10.5px] uppercase leading-tight tracking-[0.08em]", live ? "text-cream/65" : "text-ink/50")}>
                          {fmtTime(j.start)} – {fmtTime(j.end)} · {j.customerName} · {j.zone}
                        </div>
                      </>
                    )}
                  </Link>
                </motion.div>
              );
            })}
            {/* now line */}
            {isToday && nowMin >= DAY_START && nowMin <= DAY_END && (
              <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: yOf(nowMin) }}>
                <span className="ml-10 h-2.5 w-2.5 -translate-y-px rounded-full bg-ink ring-4 ring-ink/15" />
                <span className="h-[2px] flex-1 bg-ink" />
                <span className="mr-3 rounded-full bg-ink px-2 py-0.5 font-mono text-[10px] text-cream">Now</span>
              </div>
            )}
          </div>
        </div>
        {dayJobs.length === 0 && (
          <div className="pointer-events-none sticky bottom-1/2 flex justify-center">
            <span className="rounded-full bg-paper px-4 py-2 text-[13px] text-ink/55 shadow-sm">No jobs on this day</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ProDashboard() {
  const now = useNow(30_000);
  const pro = usePro(DEMO_PROFESSIONAL_ID)!;
  const all = useApp((s) => s.bookings);
  const mine = useMemo(() => all.filter((b) => b.professionalId === DEMO_PROFESSIONAL_ID), [all]);
  const active = mine.filter((b) => ACTIVE.includes(b.status)).sort((a, b) => a.start.localeCompare(b.start));
  const completed = mine.filter((b) => b.status === "COMPLETED").sort((a, b) => b.end.localeCompare(a.end));
  const next = active[0];
  const first = pro.name.split(" ")[0];

  const days14 = useMemo(() => upcomingDays(14, new Date(now - 13 * 86_400_000)), [now]);
  const earningsByDay = days14.map((d) => ({
    label: fmtDate(d.date.toISOString()),
    value: completed.filter((b) => dayKey(new Date(b.end)) === d.key).reduce((n, b) => n + payout(b), 0),
  }));
  const week = earningsByDay.slice(-7).reduce((n, d) => n + d.value, 0);
  const total = completed.reduce((n, b) => n + payout(b), 0);
  const reviews = completed.filter((b) => b.review);

  return (
    <>
      <DashHeader
        eyebrow={`${todayLabel(now)} · ${pro.trade}`}
        title={
          <>
            {greeting(now)},<br className="sm:hidden" /> {first}.
          </>
        }
        sub={active.length ? `${active.length} job${active.length > 1 ? "s" : ""} on your schedule. ${next ? `Next one ${relative(new Date(next.start).getTime() - now)}.` : ""}` : "Your schedule is clear."}
        actions={
          <>
            <InkButton href="/professional/availability" variant="outline">
              Availability
            </InkButton>
            <InkButton href="/professional/scan">
              <ScanLine className="h-4 w-4" /> Scan service QR
            </InkButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.55fr_1fr]">
        {next ? (
          <Panel tour="next-job" tone="ink" bodyClassName="p-6 sm:p-8">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream/50">
              Next job · {next.code} · {statusLabel(next.status)}
            </div>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-[0.95] tracking-[-0.045em]">{getService(next.serviceSlug)?.title}</div>
                <div className="mt-2 text-[15px] text-cream/75">
                  {next.customerName} · <span className="font-mono text-[12.5px]">{fmtTime(next.start)} – {fmtTime(next.end)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-cream/50">Starts</div>
                <div className="text-[22px] font-bold tracking-[-0.02em]">{relative(new Date(next.start).getTime() - now)}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[13px] text-cream/60">
              <MapPin className="h-3.5 w-3.5" /> {next.address}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(next.address + ", Ahmedabad")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-cream px-5 text-[13.5px] font-semibold text-ink"
              >
                <Navigation className="h-4 w-4" /> Navigate
              </a>
              <Link href="/professional/scan" className="inline-flex h-11 items-center gap-2 rounded-full border border-cream/25 px-5 text-[13.5px] font-semibold transition-colors hover:bg-cream hover:text-ink">
                <ScanLine className="h-4 w-4" /> Scan QR on arrival
              </Link>
              <Link href={`/professional/jobs/${next.id}`} className="ml-auto inline-flex items-center gap-1 text-[13px] font-medium text-cream/70 hover:text-cream">
                Job details <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-cream/10 pt-4 text-[13px]">
              <span className="text-cream/55">Your payout for this job</span>
              <span className="font-semibold tabular-nums">{formatINR(payout(next))}</span>
            </div>
          </Panel>
        ) : (
          <Panel tone="ink" bodyClassName="p-8">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream/50">No upcoming jobs</div>
            <div className="mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-[0.95] tracking-[-0.045em]">Enjoy the breather.</div>
            <p className="mt-2 text-cream/60">New assignments appear here as soon as admin confirms them.</p>
          </Panel>
        )}

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-1">
          <Kpi label="Earned · last 7 days" value={week} format={formatINR} icon={IndianRupee} hint={`${formatINR(total)} all time on HomeCrew`}>
            <Sparkline values={earningsByDay.map((d) => d.value)} />
          </Kpi>
          <Kpi label="Rating" value={pro.rating} format={(n) => (n / 1).toFixed(1)} icon={Star} hint={`${pro.jobsDone.toLocaleString("en-IN")} lifetime jobs`} />
          <Kpi label="Done on HomeCrew" value={completed.length} icon={CircleCheck} className="col-span-2 lg:col-span-1" hint={completed[0] ? `Last: ${getService(completed[0].serviceSlug)?.title}` : "No jobs yet"} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.55fr_1fr]">
        <Panel tour="schedule" eyebrow="Schedule" title="Your day" action={{ label: "All jobs", href: "/professional/jobs" }}>
          <Schedule jobs={active} hours={pro.hours} now={now} />
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel eyebrow="Earnings" title="Last 14 days" action={{ label: "Details", href: "/professional/earnings" }}>
            <BarChart data={earningsByDay} format={formatINR} label="Daily payouts over the last 14 days" />
          </Panel>

          <Panel eyebrow="Reputation" title="Recent reviews">
            {reviews.length ? (
              <ul className="stagger-fast space-y-4">
                {reviews.slice(0, 3).map((b) => (
                  <li key={b.id} className="rounded-[18px] border border-ink/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex gap-0.5" aria-label={`${b.review!.rating} stars`}>
                        {Array.from({ length: 5 }, (_, k) => (
                          <Star key={k} className={cn("h-3.5 w-3.5", k < b.review!.rating ? "fill-ink text-ink" : "text-ink/20")} />
                        ))}
                      </span>
                      <span className="font-mono text-[10.5px] text-ink/45">{b.code}</span>
                    </div>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-ink/75">“{b.review!.comment || "Great work."}”</p>
                    <div className="mt-2 text-[12px] text-ink/50">
                      {b.customerName} · {getService(b.serviceSlug)?.title}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No reviews yet" text="Finish a job and ask the customer to rate it in their app." />
            )}
            <div className="mt-4 flex items-center gap-2 text-[12.5px] text-ink/55">
              <BadgeCheck className="h-4 w-4 text-ink" /> ID, trade certificate and police verification on file
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <ProDashboard />
    </ReadyGate>
  );
}
