"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, CalendarDays, CreditCard, FileText, QrCode, ScanLine, ShieldCheck, Star, Wallet } from "lucide-react";
import { ServiceQr } from "@/components/atoms/service-qr";
import { CountUp, EASE, LineReveal, Magnetic, Reveal, useSectionProgress } from "@/components/motion/motion";
import { formatINR } from "@/lib/format";
import { categories, services, testimonials } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/* ─────────────── The split — homage to the cream/indigo poster ─────────────── */
function SplitBlock({
  tone,
  word,
  caption,
  metaL,
  footL,
  progress,
  range,
}: {
  tone: "cream" | "ink";
  word: string;
  caption: string;
  metaL: [string, string];
  footL: [string, string];
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const scale = useTransform(progress, range, [0.82, 1]);
  const track = useTransform(progress, range, ["0.08em", "-0.05em"]);
  const isInk = tone === "ink";
  return (
    <div className={cn("relative flex min-h-[78svh] flex-col px-5 py-7 sm:px-8", isInk ? "bg-ink text-cream" : "grain bg-cream text-ink")}>
      <div className="flex justify-between text-[13px]">
        <div>
          <div className="font-medium">{metaL[0]}</div>
          <div className={isInk ? "text-cream/60" : "text-ink/60"}>{metaL[1]}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <motion.div style={{ scale, letterSpacing: track }} className="text-[clamp(3.2rem,13vw,11.5rem)] font-black uppercase leading-[0.85]">
          {word}
        </motion.div>
        <div className={cn("mt-4 font-mono text-[12px] uppercase tracking-[0.06em] sm:text-sm", isInk ? "text-cream/75" : "text-ink/70")}>{caption}</div>
      </div>
      <div className="text-[13px]">
        <div className="font-medium">{footL[0]}</div>
        <div className={isInk ? "text-cream/60" : "text-ink/60"}>{footL[1]}</div>
      </div>
    </div>
  );
}

export function Split() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return (
    <section id="split" ref={ref} className="scroll-mt-0">
      <SplitBlock
        tone="cream"
        word="Guesswork"
        caption="Who : unknown · When : “10 to 6” · Cost : ???"
        metaL={["The old way", "Calling around"]}
        footL={["Before", "HomeCrew"]}
        progress={scrollYProgress}
        range={[0, 0.35]}
      />
      <SplitBlock
        tone="ink"
        word="Certainty"
        caption="Who : verified pro · When : 11:00 AM · Cost : ₹412 fixed"
        metaL={["The HomeCrew way", "Booked in 60 sec"]}
        footL={["2026", "Best way to fix a leak"]}
        progress={scrollYProgress}
        range={[0.3, 0.7]}
      />
    </section>
  );
}

/* ───────────────────────── Services index ───────────────────────── */
export function ServiceIndex() {
  return (
    <section className="grain mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.045em]">
          <LineReveal onView lines={["What needs", "fixing today?"]} />
        </h2>
        <Reveal className="max-w-sm text-ink/70">
          Seven trades, one standard — every professional is a verified specialist in the work they take on, not a jack of all trades.
        </Reveal>
      </div>

      <ul className="mt-16 border-t border-ink/20">
        {categories.map((c, i) => {
          const list = services.filter((s) => s.categorySlug === c.slug);
          const from = Math.min(...list.map((s) => s.pricePaise));
          return (
            <Reveal as="li" key={c.slug} delay={i * 0.04} y={20}>
              <Link href={`/services?category=${c.slug}`} className="group relative block overflow-hidden border-b border-ink/20">
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
                <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 transition-colors duration-500 group-hover:text-cream sm:gap-8 sm:py-8 md:grid-cols-[60px_1.2fr_1fr_140px_56px]">
                  <span className="font-mono text-xs text-ink/50 transition-colors group-hover:text-cream/50">({String(i + 1).padStart(2, "0")})</span>
                  <span className="text-[clamp(1.5rem,3.6vw,3rem)] font-bold leading-none tracking-[-0.04em] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3">
                    {c.name}
                  </span>
                  <span className="hidden text-sm text-ink/60 group-hover:text-cream/70 md:block">{c.blurb}</span>
                  <span className="hidden text-right font-mono text-xs text-ink/60 group-hover:text-cream/70 md:block">
                    {list.length} svc · from {formatINR(from)}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center justify-self-end rounded-full border border-ink/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-cream group-hover:bg-cream group-hover:text-ink">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

/* ───────────────────────── How it works (sticky) ───────────────────────── */
const steps = [
  { icon: CalendarDays, title: "Pick a real slot", text: "Availability is calculated from each professional's hours, breaks, existing jobs and travel time. If you can see it, you can book it.", k: "SLOT", v: "Thu · 11:00 AM" },
  { icon: CreditCard, title: "Pay — then we confirm", text: "Your slot is held for 10 minutes while you pay via Razorpay. The booking confirms only after our server verifies the payment.", k: "PAYMENT", v: "Verified · ₹412" },
  { icon: QrCode, title: "Scan at the door", text: "You get a one-time service QR. Only the assigned professional can scan it to start the job — no strangers, no swaps.", k: "QR", v: "ppq_8HX2…  ✓" },
  { icon: FileText, title: "Report, invoice, warranty", text: "Before/after photos, materials and an invoice land in your Home Passport — your home's permanent service history.", k: "WARRANTY", v: "30 days left" },
];

export function HowItWorks() {
  const { ref, progress } = useSectionProgress();
  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length * 0.999)))));
  const bar = useTransform(progress, [0, 1], [0, 1]);
  const Icon = steps[active].icon;

  return (
    <section id="how-it-works" className="scroll-mt-28 bg-ink text-cream">
      <div ref={ref} className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:h-[340vh]">
        <div className="top-0 flex flex-col py-24 lg:sticky lg:h-svh lg:justify-center lg:py-0">
          <div className="flex items-end justify-between border-b border-cream/15 pb-6">
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.045em]">
              <LineReveal onView lines={["How it works"]} />
            </h2>
            <span className="hidden font-mono text-xs text-cream/50 sm:block">4 steps · ~60 seconds</span>
          </div>

          {/* Desktop: sticky stage driven by scroll */}
          <div className="mt-12 hidden grid-cols-[1fr_1.1fr] gap-16 lg:grid">
            <div className="relative">
              <div className="relative h-[clamp(9rem,18vw,16rem)] overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.8, ease: EASE }}
                    className="absolute inset-0 text-[clamp(9rem,18vw,16rem)] font-black leading-[0.82] tracking-[-0.07em]"
                  >
                    0{active + 1}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-8 h-[2px] w-full bg-cream/10">
                <motion.div style={{ scaleX: bar }} className="h-full origin-left bg-cream" />
              </div>
              <div className="mt-3 flex justify-between font-mono text-[11px] text-cream/50">
                {steps.map((s, i) => (
                  <span key={s.title} className={cn("transition-colors", i <= active && "text-cream")}>
                    0{i + 1}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative min-h-[22rem]">
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.6, ease: EASE }}>
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-ink">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-8 text-4xl font-bold tracking-[-0.035em]">{steps[active].title}</h3>
                  <p className="mt-4 max-w-md text-lg leading-relaxed text-cream/70">{steps[active].text}</p>
                  <div className="mt-8 inline-flex rounded-full border border-cream/20 px-4 py-2 font-mono text-sm">
                    <span className="text-cream/50">{steps[active].k} :&nbsp;</span>
                    {steps[active].v}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile: simple stacked reveal */}
          <div className="mt-10 space-y-4 lg:hidden">
            {steps.map((s, i) => (
              <Reveal key={s.title} className="rounded-3xl border border-cream/15 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-5xl font-black tracking-[-0.06em]">0{i + 1}</span>
                  <s.icon className="h-6 w-6 text-cream/70" />
                </div>
                <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em]">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-cream/70">{s.text}</p>
                <div className="mt-4 font-mono text-xs text-cream/60">
                  {s.k} : <span className="text-cream">{s.v}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Numbers ───────────────────────── */
export function Numbers() {
  const stats = [
    { to: 10, suffix: "K+", label: "Jobs completed" },
    { to: 4.8, decimals: 1, suffix: "★", label: "Average rating" },
    { to: 120, suffix: "+", label: "Verified professionals" },
    { to: 0, prefix: "₹", label: "Surprise charges" },
  ];
  return (
    <section className="grain mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid grid-cols-2 border-l border-t border-ink/20 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="min-w-0 overflow-hidden border-b border-r border-ink/20 p-6 sm:p-8 lg:p-10">
            <div className="whitespace-nowrap text-[clamp(2.5rem,5vw,4.5rem)] font-black leading-none tracking-[-0.06em]">
              <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} decimals={s.decimals} />
            </div>
            <div className="mt-3 text-sm text-ink/60">{s.label}</div>
          </Reveal>
        ))}
      </div>
      <p className="mt-3 text-right font-mono text-[11px] text-ink/40">Demo figures</p>
    </section>
  );
}

/* ───────────────────────── Trust / QR showcase ───────────────────────── */
export function Trust() {
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setVerified((v) => !v), 2600);
    return () => clearInterval(t);
  }, []);
  const pillars = [
    { icon: BadgeCheck, title: "Verified professionals", text: "ID, trade certificate and police check — reviewed by our team before activation." },
    { icon: Wallet, title: "No surprise charges", text: "Extra work needs your approval in the app before anything is done or billed." },
    { icon: ShieldCheck, title: "Warranty, tracked", text: "Up to 60 days, attached to every booking in your Home Passport." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 pb-28 sm:px-8">
      <div className="grid grid-cols-1 overflow-hidden rounded-[36px] bg-ink text-cream lg:grid-cols-2">
        <div className="p-8 sm:p-14">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-cream/50">Safety, by design</span>
          <h2 className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.045em]">
            <LineReveal onView lines={["One scan.", <span key="b" className="text-cream/45">Right professional.</span>]} />
          </h2>
          <ul className="mt-10 space-y-6">
            {pillars.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.08} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cream/20">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-cream/65">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <div className="relative flex items-center justify-center bg-ink-soft/40 p-10 sm:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(238,235,218,0.12),transparent_60%)]" />
          <div className="relative">
            <div className="relative rounded-[28px] bg-cream p-6">
              <ServiceQr token="ppq_TRUSTSECTION9X" size={220} />
              {["left-2 top-2 border-l-[3px] border-t-[3px]", "right-2 top-2 border-r-[3px] border-t-[3px]", "bottom-2 left-2 border-b-[3px] border-l-[3px]", "bottom-2 right-2 border-b-[3px] border-r-[3px]"].map((c) => (
                <span key={c} className={`absolute h-8 w-8 rounded-sm border-ink ${c}`} />
              ))}
              {!verified && <span className="absolute left-6 right-6 h-[2px] animate-scan bg-ink shadow-[0_0_18px_3px_rgba(40,43,74,0.45)]" />}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={String(verified)}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-paper px-4 py-2.5 text-sm font-medium text-ink shadow-xl"
              >
                {verified ? (
                  <>
                    <BadgeCheck className="h-4 w-4" /> Verified · job started
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4" /> Scanning service QR…
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Testimonials ───────────────────────── */
export function Voices() {
  const [i, setI] = useState(0);
  const n = testimonials.length;
  useEffect(() => {
    const t = setTimeout(() => setI((x) => (x + 1) % n), 7000);
    return () => clearTimeout(t);
  }, [i, n]);
  const t = testimonials[i];
  return (
    <section className="grain border-t border-ink/15">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50">What homes say</span>
          <div className="flex items-center gap-2">
            {[
              { icon: ArrowLeft, d: -1, label: "Previous" },
              { icon: ArrowRight, d: 1, label: "Next" },
            ].map((b) => (
              <button
                key={b.label}
                aria-label={b.label}
                onClick={() => setI((x) => (x + b.d + n) % n)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-cream"
              >
                <b.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-12 min-h-[18rem] sm:min-h-[15rem]">
          <AnimatePresence mode="wait">
            <motion.figure key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7, ease: EASE }}>
              <blockquote className="max-w-5xl text-[clamp(1.75rem,4vw,3.4rem)] font-semibold leading-[1.1] tracking-[-0.035em]">“{t.text}”</blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, k) => (
                    <Star key={k} className={k < t.rating ? "h-4 w-4 fill-ink text-ink" : "h-4 w-4 text-ink/20"} />
                  ))}
                </span>
                <span className="text-sm font-medium">{t.name}</span>
                <span className="text-sm text-ink/50">{t.area}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="mt-10 flex gap-2">
          {testimonials.map((_, k) => (
            <span key={k} className="h-[2px] flex-1 overflow-hidden bg-ink/15">
              {k === i && <motion.span key={i} className="block h-full origin-left bg-ink" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 7, ease: "linear" }} />}
              {k < i && <span className="block h-full bg-ink" />}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Professional CTA ───────────────────────── */
export function ProCta() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-28 sm:px-8">
      <div className="grid grid-cols-1 items-center gap-10 border-t border-ink/20 pt-16 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink/50">For professionals</span>
          <h2 className="mt-4 text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.045em]">
            <LineReveal onView lines={["Skilled professional?", <span key="b" className="text-ink/40">Get pre-paid jobs.</span>]} />
          </h2>
        </div>
        <Reveal className="space-y-6">
          <p className="text-lg leading-relaxed text-ink/70">Set your own hours, skills and service zones. Every job is paid before you leave home — no chasing customers for money.</p>
          <Magnetic strength={0.2}>
            <Link href="/professionals" className="group inline-flex h-14 items-center gap-3 rounded-full bg-ink pl-7 pr-2 font-medium text-cream">
              Join HomeCrew
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-ink transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
