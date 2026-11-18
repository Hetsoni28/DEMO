"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CalendarCheck,
  CircleCheck,
  IndianRupee,
  MapPin,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  UserCheck,
} from "lucide-react";
import { categoryIcons } from "@/components/atoms/icons";
import {
  AreaChart,
  DashHeader,
  Delta,
  InkButton,
  Kpi,
  Panel,
  Sparkline,
  relative,
  todayLabel,
  useNow,
} from "@/components/dashboard/kit";
import { ReadyGate } from "@/components/molecules/ready-gate";
import { StatusBadge, statusLabel } from "@/components/molecules/status-badge";
import { EASE } from "@/components/motion/motion";
import {
  categoryMix,
  dailySeries,
  delta,
  summarize,
  zoneLoad,
} from "@/lib/admin-insights";
import { fmtDate, fmtDateTime, formatINR } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { useApp, type BookingStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const PIPELINE: BookingStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
];
const PERIODS = [7, 14, 30] as const;
type Period = (typeof PERIODS)[number];

const compactINR = (paise: number) => {
  const r = paise / 100;
  if (r >= 100000) return `₹${(r / 100000).toFixed(1)}L`;
  if (r >= 1000) return `₹${(r / 1000).toFixed(r >= 10000 ? 0 : 1)}k`;
  return `₹${Math.round(r)}`;
};

function HBar({
  label,
  value,
  max,
  icon,
  delay = 0,
}: {
  label: string;
  value: number;
  max: number;
  icon?: React.ReactNode;
  delay?: number;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,140px)_1fr_auto] items-center gap-3">
      <span className="flex min-w-0 items-center gap-2 text-[13px] text-ink/70">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="h-2.5 overflow-hidden rounded-full bg-ink/[0.07]">
        <motion.span
          className="block h-full rounded-full bg-ink"
          initial={{ width: 0 }}
          animate={{ width: `${max ? (value / max) * 100 : 0}%` }}
          transition={{ duration: 0.9, ease: EASE, delay }}
        />
      </span>
      <span className="w-8 text-right font-mono text-[12px] tabular-nums text-ink">
        {value}
      </span>
    </div>
  );
}

function AdminDashboard() {
  const now = useNow(60_000);
  const bookings = useApp((s) => s.bookings);
  const pros = useApp((s) => s.pros);
  const events = useApp((s) => s.events);
  const assign = useApp((s) => s.assign);
  const setVerification = useApp((s) => s.setVerification);
  const [period, setPeriod] = useState<Period>(14);

  /* ── analytics (sample history + live store) ── */
  const series = useMemo(
    () => dailySeries(bookings, period * 2, now),
    [bookings, period, now],
  );
  const prev = summarize(series.slice(0, period));
  const curPoints = series.slice(period);
  const cur = summarize(curPoints);
  const chart = curPoints.map((p) => ({
    label: fmtDate(p.date.toISOString()),
    value: p.revenue,
    secondary: p.bookings,
  }));
  const zones = zoneLoad(bookings, cur.bookings);
  const zoneMax = Math.max(1, ...zones.map((z) => z.bookings));
  const mix = categoryMix(
    bookings,
    cur.bookings,
    (slug) => getService(slug)?.categorySlug,
  );
  const mixMax = Math.max(1, ...mix.map((m) => m.n));

  /* ── live operations (real store only) ── */
  const activePros = pros.filter(
    (p) => p.verification === "VERIFIED" && p.active,
  );
  const unassigned = bookings.filter(
    (b) => b.status === "CONFIRMED" && !b.professionalId,
  );
  const pendingPros = pros.filter((p) => p.verification === "PENDING");
  const refunds = bookings.filter((b) => b.payment.status === "REFUND_PENDING");
  const holds = bookings.filter((b) => b.status === "PENDING_PAYMENT");
  const queueCount = unassigned.length + pendingPros.length + refunds.length;
  const pipeline = PIPELINE.map((s) => ({
    s,
    n: bookings.filter((b) => b.status === s).length,
  }));
  const pipeMax = Math.max(1, ...pipeline.map((p) => p.n));
  const latest = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const failedEvents = events.filter((e) => !e.signatureVerified).length;
  const proName = (id: string | null) =>
    pros.find((p) => p.id === id)?.name ?? "—";

  return (
    <>
      <DashHeader
        eyebrow={`${todayLabel(now)} · Ahmedabad operations`}
        title="Operations."
        sub="Revenue, demand and every live booking, professional and payment — in one place."
        actions={
          <>
            <div
              role="radiogroup"
              aria-label="Period"
              className="flex rounded-full border border-ink/10 bg-paper p-1"
            >
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={period === p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "relative h-9 rounded-full px-4 font-mono text-[12px] transition-colors",
                    period === p ? "text-cream" : "text-ink/60 hover:text-ink",
                  )}
                >
                  {period === p && (
                    <motion.span
                      layoutId="admin-period"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  )}
                  <span className="relative">{p}D</span>
                </button>
              ))}
            </div>
            <InkButton href="/admin/bookings">
              All bookings{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            </InkButton>
          </>
        }
      />

      {/* system status */}
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[22px] border border-ink/10 bg-paper px-5 py-3 text-[12.5px]">
        <span className="flex items-center gap-2 font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1E9E5A]/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1E9E5A]" />
          </span>
          All systems normal
        </span>
        <span className="text-ink/60">Payments gateway · operational</span>
        <span className="text-ink/60">
          Webhooks · {failedEvents} signature failures
        </span>
        <span className="text-ink/60">Slot holds · {holds.length} active</span>
        <span className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/40">
          Charts include sample history (demo)
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        <Kpi
          label={`GMV · ${period}D`}
          value={cur.revenue}
          format={compactINR}
          icon={IndianRupee}
          hint={
            <span className="flex items-center gap-2">
              <Delta value={delta(cur.revenue, prev.revenue)} /> <span className="hidden sm:inline">vs previous {period}D</span>
            </span>
          }
        >
          <Sparkline values={curPoints.map((p) => p.revenue)} />
        </Kpi>
        <Kpi
          label={`Bookings · ${period}D`}
          value={cur.bookings}
          icon={CalendarCheck}
          hint={
            <span className="flex items-center gap-2">
              <Delta value={delta(cur.bookings, prev.bookings)} /> <span className="hidden sm:inline">vs previous {period}D</span>
            </span>
          }
        >
          <Sparkline values={curPoints.map((p) => p.bookings)} />
        </Kpi>
        <Kpi
          label="Avg order value"
          value={cur.aov}
          format={formatINR}
          icon={ShoppingBag}
          hint={
            <span className="flex items-center gap-2">
              <Delta value={delta(cur.aov, prev.aov)} /> <span className="hidden sm:inline">vs previous {period}D</span>
            </span>
          }
        />
        <Kpi
          label="Completion rate"
          value={cur.completion}
          format={(n) => `${n}%`}
          icon={CircleCheck}
          emphasis
          hint={
            <span className="text-cream/70">
              {activePros.length} active pros · {pendingPros.length} in review
            </span>
          }
        />
      </div>

      {/* Revenue + queue */}
      <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          eyebrow={`Revenue · last ${period} days`}
          title={formatINR(cur.revenue)}
          action={<Delta value={delta(cur.revenue, prev.revenue)} />}
        >
          <AreaChart
            data={chart}
            format={compactINR}
            secondary={(n) => `${n} bookings`}
            label={`Daily revenue for the last ${period} days`}
          />
        </Panel>

        <div id="queue" className="min-w-0 scroll-mt-24">
          <Panel
            tone="ink"
            eyebrow="Ops queue"
            title={
              queueCount
                ? `${queueCount} need${queueCount === 1 ? "s" : ""} attention`
                : "All clear"
            }
          >
            {queueCount === 0 && (
              <p className="text-[14px] text-cream/60">
                Nothing waiting. New bookings and applications will appear here.
              </p>
            )}
            <ul className="stagger-fast max-h-[330px] space-y-2.5 overflow-y-auto pr-1">
              {unassigned.map((b) => {
                const eligible = activePros.filter((p) =>
                  p.skills.includes(b.serviceSlug),
                );
                return (
                  <li key={b.id} className="rounded-[18px] bg-cream/[0.06] p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-ink">
                        <CalendarCheck className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-semibold">
                          {getService(b.serviceSlug)?.title} · {b.code}
                        </div>
                        <div className="truncate text-[12px] text-cream/55">
                          Unassigned · {b.customerName} · {fmtDateTime(b.start)}
                        </div>
                      </div>
                    </div>
                    <select
                      defaultValue=""
                      aria-label={`Assign a professional to ${b.code}`}
                      onChange={(e) => {
                        const r = assign(b.id, e.target.value);
                        if (r.ok) toast.success("Professional assigned");
                        else toast.error(r.error);
                      }}
                      className="mt-3 h-10 w-full rounded-full border border-cream/20 bg-ink px-3 text-[13px] text-cream outline-none focus:border-cream"
                    >
                      <option value="" disabled>
                        Assign a professional…
                      </option>
                      {eligible.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} · {p.trade}
                        </option>
                      ))}
                    </select>
                  </li>
                );
              })}
              {pendingPros.map((p) => (
                <li key={p.id} className="rounded-[18px] bg-cream/[0.06] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-ink">
                      <UserCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold">
                        {p.name} · {p.trade}
                      </div>
                      <div className="truncate text-[12px] text-cream/55">
                        Verification ·{" "}
                        {
                          p.documents.filter((d) => d.status === "VERIFIED")
                            .length
                        }
                        /{p.documents.length} documents checked
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setVerification(p.id, "VERIFIED");
                        toast.success(`${p.name} verified and activated`);
                      }}
                      className="h-9 rounded-full bg-cream text-[13px] font-semibold text-ink"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVerification(p.id, "REJECTED");
                        toast(`${p.name} rejected`);
                      }}
                      className="h-9 rounded-full border border-cream/20 text-[13px] font-medium text-cream/80 hover:border-cream"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
              {refunds.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center gap-3 rounded-[18px] bg-cream/[0.06] p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-ink">
                    <ReceiptText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold">
                      Refund in progress · {b.code}
                    </div>
                    <div className="truncate text-[12px] text-cream/55">
                      {formatINR(b.amounts.total)} to {b.customerName}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Zones · pipeline · demand */}
      <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <Panel eyebrow={`Zones · ${period}D`} title="Demand by area">
          <ul className="stagger-fast grid grid-cols-2 gap-2">
            {zones.map((z) => {
              const k = z.bookings / zoneMax;
              const dark = k > 0.62;
              return (
                <li
                  key={z.zone}
                  className={cn(
                    "flex min-h-[78px] min-w-0 flex-col justify-between rounded-[16px] p-3 transition-colors",
                    dark ? "text-cream" : "text-ink",
                  )}
                  style={{
                    backgroundColor: `rgba(40,43,74,${(0.08 + k * 0.85).toFixed(2)})`,
                  }}
                  title={`${z.zone}: ${z.bookings} bookings, ${z.live} live now`}
                >
                  <span className="flex min-w-0 items-center gap-1 text-[12px] font-semibold">
                    <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                    <span className="truncate">{z.zone}</span>
                  </span>
                  <span className="flex items-end justify-between gap-2">
                    <span className="text-[20px] font-black leading-none tracking-[-0.03em] tabular-nums">
                      {z.bookings}
                    </span>
                    {z.live > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 font-mono text-[9.5px]",
                          dark ? "bg-cream text-ink" : "bg-ink text-cream",
                        )}
                      >
                        {z.live} live
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink/45">
            Low
            <span className="h-1.5 flex-1 rounded-full bg-[linear-gradient(90deg,rgba(40,43,74,0.08),rgba(40,43,74,0.93))]" />
            High
          </div>
        </Panel>

        <Panel
          eyebrow="Pipeline · live"
          title="Bookings by status"
          action={{ label: "Manage", href: "/admin/bookings" }}
        >
          <div className="space-y-3">
            {pipeline.map((p, i) => (
              <HBar
                key={p.s}
                label={statusLabel(p.s)}
                value={p.n}
                max={pipeMax}
                delay={0.1 + i * 0.05}
              />
            ))}
          </div>
        </Panel>

        <Panel
          eyebrow={`Demand · ${period}D`}
          title="Paid bookings by trade"
          action={{ label: "Catalogue", href: "/admin/services" }}
        >
          <div className="space-y-3">
            {mix.map((m, i) => {
              const Icon = categoryIcons[m.c.icon];
              return (
                <HBar
                  key={m.c.slug}
                  label={m.c.name}
                  value={m.n}
                  max={mixMax}
                  icon={<Icon className="h-3.5 w-3.5 shrink-0 text-ink/50" />}
                  delay={0.1 + i * 0.05}
                />
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Live bookings · roster + gateway */}
      <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          eyebrow="Live"
          title="Latest bookings"
          action={{ label: "All bookings", href: "/admin/bookings" }}
          bodyClassName="px-0 pb-2"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead>
                <tr className="border-b border-ink/10 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink/45">
                  <th className="px-6 py-2.5 font-normal">Booking</th>
                  <th className="px-3 py-2.5 font-normal">Customer</th>
                  <th className="px-3 py-2.5 font-normal">Professional</th>
                  <th className="px-3 py-2.5 font-normal">Status</th>
                  <th className="px-6 py-2.5 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody className="stagger-fast">
                {latest.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-ink/[0.06] transition-colors last:border-0 hover:bg-ink/[0.03]"
                  >
                    <td className="px-6 py-3">
                      <div className="font-semibold">
                        {getService(b.serviceSlug)?.title}
                      </div>
                      <div className="font-mono text-[11px] text-ink/45">
                        {b.code} ·{" "}
                        {relative(new Date(b.createdAt).getTime() - now)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div>{b.customerName}</div>
                      <div className="text-[11.5px] text-ink/45">{b.zone}</div>
                    </td>
                    <td className="px-3 py-3 text-ink/75">
                      {proName(b.professionalId)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-6 py-3 text-right font-semibold tabular-nums">
                      {formatINR(b.amounts.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel
            eyebrow="Roster"
            title="Professionals"
            action={{ label: "Manage", href: "/admin/professionals" }}
            bodyClassName="px-3 pb-3"
          >
            <ul className="stagger-fast">
              {pros
                .filter((p) => p.verification === "VERIFIED")
                .slice(0, 5)
                .map((p) => {
                  const load = bookings.filter(
                    (b) =>
                      b.professionalId === p.id &&
                      ["CONFIRMED", "ASSIGNED", "IN_PROGRESS"].includes(
                        b.status,
                      ),
                  ).length;
                  return (
                    <li
                      key={p.id}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-ink/[0.04]"
                    >
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-[11.5px] font-bold">
                        {p.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")}
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-paper",
                            p.active ? "bg-[#1E9E5A]" : "bg-ink/30",
                          )}
                          aria-label={p.active ? "Active" : "Inactive"}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13.5px] font-semibold">
                          {p.name}
                        </div>
                        <div className="truncate text-[12px] text-ink/55">
                          {p.trade} · ★ {p.rating}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-ink/[0.06] px-2 py-0.5 font-mono text-[11px] tabular-nums">
                        {load} upcoming
                      </span>
                    </li>
                  );
                })}
            </ul>
          </Panel>

          <Panel
            eyebrow="Payments"
            title="Gateway events"
            action={{ label: "Ledger", href: "/admin/payments" }}
          >
            <ul className="stagger-fast space-y-3">
              {[...events]
                .sort((a, b) => b.at.localeCompare(a.at))
                .slice(0, 5)
                .map((e) => (
                  <li key={e.id} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-[12px]">
                        {e.type}
                      </div>
                      <div className="truncate text-[11.5px] text-ink/50">
                        {e.bookingCode} ·{" "}
                        {relative(new Date(e.at).getTime() - now)}
                      </div>
                    </div>
                    <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                      {formatINR(e.amount)}
                    </span>
                  </li>
                ))}
            </ul>
            <Link
              href="/admin/payments"
              className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink/60 hover:text-ink"
            >
              View full ledger <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <AdminDashboard />
    </ReadyGate>
  );
}
