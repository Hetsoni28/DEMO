"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { CountUp, EASE } from "@/components/motion/motion";
import { cn } from "@/lib/utils";

/* ───────────── Time helpers (client-only screens) ───────────── */

/**
 * Current time for components that only render in the browser (dashboard content
 * inside <ReadyGate>). Do NOT use in anything rendered during prerender — use
 * `useMountedNow` there instead.
 */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/**
 * Current time that is `null` during prerender/hydration and starts ticking after
 * mount — safe for shell-level components (Next.js forbids `Date.now()` in prerender).
 */
export function useMountedNow(intervalMs = 60_000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [intervalMs]);
  return now;
}

export function relative(ms: number) {
  const abs = Math.abs(ms);
  const m = Math.round(abs / 60_000);
  if (m < 1) return ms >= 0 ? "now" : "just now";
  if (m < 60) return ms >= 0 ? `in ${m} min` : `${m} min ago`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return ms >= 0 ? `in ${h} h${rm ? ` ${rm} m` : ""}` : `${h} h ago`;
  const d = Math.round(h / 24);
  return ms >= 0 ? `in ${d} day${d > 1 ? "s" : ""}` : `${d} day${d > 1 ? "s" : ""} ago`;
}

export function greeting(now: number) {
  const h = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(now));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function todayLabel(now: number) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(now);
}

/* ───────────── Layout primitives ───────────── */

export function DashHeader({ eyebrow, title, sub, actions }: { eyebrow: ReactNode; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">{eyebrow}</div>
        <h1 className="mt-3 text-[clamp(2.25rem,4.5vw,3.5rem)] font-black leading-[0.92] tracking-[-0.05em] text-ink">{title}</h1>
        {sub && <p className="mt-3 max-w-xl text-[15px] text-ink/60">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  eyebrow,
  action,
  className,
  bodyClassName,
  children,
  tone = "paper",
  tour,
}: {
  /** Anchor for the guided tour (data-tour). */
  tour?: string;
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: { label: string; href: string } | ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  tone?: "paper" | "ink";
}) {
  const isInk = tone === "ink";
  return (
    <section data-tour={tour} className={cn("min-w-0 rounded-[26px] border", isInk ? "border-ink bg-ink text-cream" : "border-ink/10 bg-paper", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-6 pt-5">
          <div>
            {eyebrow && <div className={cn("font-mono text-[10.5px] uppercase tracking-[0.16em]", isInk ? "text-cream/50" : "text-ink/45")}>{eyebrow}</div>}
            {title && <h2 className="mt-1 text-[17px] font-bold tracking-[-0.02em]">{title}</h2>}
          </div>
          {action && typeof action === "object" && "href" in (action as object) ? (
            <Link
              href={(action as { href: string }).href}
              className={cn("group inline-flex shrink-0 items-center gap-1 text-[12.5px] font-medium", isInk ? "text-cream/70 hover:text-cream" : "text-ink/60 hover:text-ink")}
            >
              {(action as { label: string }).label}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
            </Link>
          ) : (
            (action as ReactNode)
          )}
        </header>
      )}
      <div className={cn("p-6", (title || action) && "pt-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Kpi({
  label,
  value,
  format,
  hint,
  icon: Icon,
  children,
  emphasis,
  className,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
  hint?: ReactNode;
  icon?: LucideIcon;
  children?: ReactNode;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col rounded-[24px] border p-5", emphasis ? "border-ink bg-ink text-cream" : "border-ink/10 bg-paper", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em]", emphasis ? "text-cream/55" : "text-ink/50")}>{label}</span>
        {Icon && <Icon className={cn("h-4 w-4", emphasis ? "text-cream/60" : "text-ink/40")} />}
      </div>
      <div className="mt-4 truncate text-[clamp(1.9rem,3vw,2.6rem)] font-black leading-none tracking-[-0.05em]">
        {format ? <FormattedCount to={value} format={format} /> : <CountUp to={value} />}
      </div>
      {hint && <div className={cn("mt-2 text-[12.5px]", emphasis ? "text-cream/60" : "text-ink/55")}>{hint}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

/** Count-up that renders through a custom formatter (e.g. ₹ amounts). */
function FormattedCount({ to, format }: { to: number; format: (n: number) => string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span className="tabular-nums">{format(Math.round(v))}</span>;
}

export function Progress({ value, className, tone = "ink" }: { value: number; className?: string; tone?: "ink" | "cream" }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full", tone === "cream" ? "bg-cream/15" : "bg-ink/10", className)}>
      <motion.div
        className={cn("h-full rounded-full", tone === "cream" ? "bg-cream" : "bg-ink")}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
      />
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-ink/20 px-6 py-10 text-center">
      <div className="text-[17px] font-bold tracking-[-0.02em]">{title}</div>
      <p className="mx-auto mt-1 max-w-xs text-[13.5px] text-ink/55">{text}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function InkButton({ href, children, variant = "ink", className }: { href: string; children: ReactNode; variant?: "ink" | "cream" | "outline"; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-11 items-center gap-2 rounded-full px-5 text-[13.5px] font-semibold transition-colors",
        variant === "ink" && "bg-ink text-cream hover:bg-ink-soft",
        variant === "cream" && "bg-cream text-ink hover:bg-paper",
        variant === "outline" && "border border-ink/15 text-ink hover:border-ink",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ───────────── Charts (single series, ink; hover tooltip) ───────────── */

export function BarChart({
  data,
  format = (n) => String(n),
  height = 140,
  tone = "ink",
  label,
}: {
  data: { label: string; value: number; note?: string }[];
  format?: (n: number) => string;
  height?: number;
  tone?: "ink" | "cream";
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const isCream = tone === "cream";
  return (
    <figure aria-label={label} className="relative">
      <div className="relative flex items-end gap-1.5" style={{ height }}>
        {/* recessive baseline + midline */}
        <span aria-hidden className={cn("absolute inset-x-0 bottom-0 h-px", isCream ? "bg-cream/20" : "bg-ink/15")} />
        <span aria-hidden className={cn("absolute inset-x-0 h-px border-t border-dashed", isCream ? "border-cream/10" : "border-ink/10")} style={{ bottom: height / 2 }} />
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 4);
          return (
            <button
              key={d.label + i}
              type="button"
              aria-label={`${d.label}: ${format(d.value)}`}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="group relative flex h-full flex-1 items-end justify-center outline-none"
            >
              <motion.span
                className={cn(
                  "block w-full max-w-[22px] rounded-t-[4px] transition-opacity",
                  isCream ? "bg-cream" : "bg-ink",
                  hover !== null && hover !== i && "opacity-35",
                  d.value === 0 && (isCream ? "bg-cream/25" : "bg-ink/20"),
                )}
                initial={{ height: 0 }}
                animate={{ height: Math.max(d.value === 0 ? 2 : 4, h) }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.035 }}
              />
            </button>
          );
        })}
        {hover !== null && (
          <div
            role="status"
            className={cn(
              "pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl px-3 py-2 text-[12px] shadow-xl",
              isCream ? "bg-cream text-ink" : "bg-ink text-cream",
            )}
            style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-60">{data[hover].label}</div>
            <div className="font-semibold tabular-nums">{format(data[hover].value)}</div>
            {data[hover].note && <div className="opacity-60">{data[hover].note}</div>}
          </div>
        )}
      </div>
      <figcaption className={cn("mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.1em]", isCream ? "text-cream/45" : "text-ink/40")}>
        <span>{data[0]?.label}</span>
        <span>{data.at(-1)?.label}</span>
      </figcaption>
    </figure>
  );
}

/** Single-series area chart with a crosshair tooltip. */
export function AreaChart({
  data,
  format,
  secondary,
  height = 240,
  label,
}: {
  data: { label: string; value: number; secondary?: number }[];
  format: (n: number) => string;
  secondary?: (n: number) => string;
  height?: number;
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 1000;
  const H = height;
  const top = 12;
  const bottom = 26;
  const max = Math.max(1, ...data.map((d) => d.value)) * 1.12;
  const x = (i: number) => (i / Math.max(1, data.length - 1)) * W;
  const y = (v: number) => top + (1 - v / max) * (H - top - bottom);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H - bottom} L0 ${H - bottom} Z`;
  const ticks = [0.25, 0.5, 0.75, 1].map((f) => (max / 1.12) * f);

  return (
    <figure aria-label={label} className="relative select-none">
      <div
        className="relative"
        style={{ height: H }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left) / r.width) * (data.length - 1));
          setHover(Math.max(0, Math.min(data.length - 1, i)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#282B4A" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#282B4A" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <line key={t} x1="0" x2={W} y1={y(t)} y2={y(t)} stroke="#282B4A" strokeOpacity="0.08" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="0" x2={W} y1={H - bottom} y2={H - bottom} stroke="#282B4A" strokeOpacity="0.18" vectorEffect="non-scaling-stroke" />
          <motion.path d={area} fill="url(#area-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
          <motion.path
            d={line}
            fill="none"
            stroke="#282B4A"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={top} y2={H - bottom} stroke="#282B4A" strokeOpacity="0.35" vectorEffect="non-scaling-stroke" />}
        </svg>

        {/* y-axis labels */}
        {ticks.map((t) => (
          <span key={t} className="pointer-events-none absolute left-0 -translate-y-full pb-0.5 font-mono text-[10px] text-ink/40" style={{ top: y(t) }}>
            {format(Math.round(t))}
          </span>
        ))}

        {hover !== null && (
          <>
            <span
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-ink shadow"
              style={{ left: `${(hover / Math.max(1, data.length - 1)) * 100}%`, top: y(data[hover].value) }}
            />
            <div
              role="status"
              className="pointer-events-none absolute z-10 -translate-y-full whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-[12px] text-cream shadow-xl"
              style={{
                top: Math.max(56, y(data[hover].value) - 12),
                left: `${(hover / Math.max(1, data.length - 1)) * 100}%`,
                transform: `translate(${hover > data.length * 0.7 ? "-100%" : hover < data.length * 0.15 ? "0%" : "-50%"}, -100%)`,
              }}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream/60">{data[hover].label}</div>
              <div className="font-semibold tabular-nums">{format(data[hover].value)}</div>
              {secondary && data[hover].secondary !== undefined && <div className="text-cream/65">{secondary(data[hover].secondary!)}</div>}
            </div>
          </>
        )}
      </div>
      <figcaption className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-ink/40">
        <span>{data[0]?.label}</span>
        <span>{data[Math.floor(data.length / 2)]?.label}</span>
        <span>{data.at(-1)?.label}</span>
      </figcaption>
    </figure>
  );
}

export function Delta({ value, inverse }: { value: number; inverse?: boolean }) {
  const up = value >= 0;
  const good = inverse ? !up : up;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold tabular-nums",
        value === 0 ? "bg-ink/[0.06] text-ink/55" : good ? "bg-[#E8F3EC] text-[#1E7A4A]" : "bg-[#FBEAEA] text-[#B42318]",
      )}
      aria-label={`${up ? "Up" : "Down"} ${Math.abs(value)} percent versus previous period`}
    >
      {value === 0 ? "—" : up ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

export function Sparkline({ values, className, tone = "ink" }: { values: number[]; className?: string; tone?: "ink" | "cream" }) {
  const w = 120;
  const h = 32;
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * w, h - 2 - (v / max) * (h - 4)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-8 w-full", className)} preserveAspectRatio="none" aria-hidden>
      <motion.path d={d} fill="none" stroke={tone === "cream" ? "#EEEBDA" : "#282B4A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: EASE, delay: 0.2 }} />
    </svg>
  );
}
