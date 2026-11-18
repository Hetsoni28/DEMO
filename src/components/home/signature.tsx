"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView } from "framer-motion";
import {
  AirVent,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Plus,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { EASE, LineReveal, Reveal } from "@/components/motion/motion";
import { formatINR } from "@/lib/format";
import { GST_RATE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** Editorial section label — "(06) Price approval ———— note" */
export function SectionLabel({
  index,
  title,
  note,
  light,
}: {
  index: string;
  title: string;
  note?: string;
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em]",
        light ? "text-cream/50" : "text-ink/50",
      )}
    >
      <span>({index})</span>
      <span className={light ? "text-cream" : "text-ink"}>{title}</span>
      <span
        className={cn("h-px flex-1", light ? "bg-cream/15" : "bg-ink/15")}
      />
      {note && <span>{note}</span>}
    </div>
  );
}

/* ───────────────────────── Price approval — interactive ───────────────────────── */
const BASE = 19900;
const EXTRA = 25000;

function AnimatedAmount({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const c = animate(from.current, value, {
      duration: 0.8,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    from.current = value;
    return () => c.stop();
  }, [value]);
  return <span className="tabular-nums">{formatINR(shown)}</span>;
}

export function PriceApproval() {
  const [state, setState] = useState<"pending" | "approved" | "declined">(
    "pending",
  );
  const subtotal = BASE + (state === "approved" ? EXTRA : 0);
  const total = subtotal + Math.round(subtotal * GST_RATE);

  return (
    <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <SectionLabel index="06" title="Price approval" note="Interactive demo" />
      <div className="mt-14 grid grid-cols-1 items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <h2 className="text-[clamp(2.75rem,6.5vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.05em]">
            <LineReveal
              onView
              lines={[
                "No surprises.",
                <span key="b" className="text-ink/35">
                  Ever.
                </span>,
              ]}
            />
          </h2>
          <Reveal className="mt-8 max-w-md text-lg leading-relaxed text-ink/70">
            Found something extra — a corroded valve, a worn AC part? Your
            professional sends a quote to your phone. Nothing is done — or
            charged — until you tap approve.
          </Reveal>
          <Reveal
            delay={0.1}
            className="mt-8 flex flex-wrap gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-ink/70"
          >
            {["Quote : itemised", "Decision : yours", "Invoice : matches"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-ink/15 px-3 py-1.5"
                >
                  {t}
                </span>
              ),
            )}
          </Reveal>
        </div>

        <Reveal delay={0.1} y={40}>
          <div className="relative rounded-[32px] bg-ink p-3 shadow-[0_50px_100px_-50px_rgba(40,43,74,0.7)]">
            <div className="rounded-[24px] bg-paper p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">
                    Booking HC-1042
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-[-0.03em]">
                    Tap Repair
                  </div>
                </div>
                <span className="rounded-full border border-ink/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink/60">
                  In progress
                </span>
              </div>

              <div className="mt-6 flex justify-between border-b border-dashed border-ink/15 pb-4 text-[15px]">
                <span className="text-ink/70">Tap repair · fixed price</span>
                <span className="font-semibold">{formatINR(BASE)}</span>
              </div>

              <motion.div
                layout
                className={cn(
                  "mt-4 rounded-2xl border p-4 transition-colors duration-500",
                  state === "pending" && "border-ink/25 bg-cream",
                  state === "approved" && "border-ink bg-ink text-cream",
                  state === "declined" && "border-ink/10 bg-paper text-ink/45",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] opacity-60">
                      <ReceiptText className="h-3.5 w-3.5" /> Extra work quote
                    </div>
                    <div
                      className={cn(
                        "mt-1.5 text-[16px] font-semibold",
                        state === "declined" && "line-through",
                      )}
                    >
                      Replace corroded angle valve
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-[16px] font-semibold",
                      state === "declined" && "line-through",
                    )}
                  >
                    +{formatINR(EXTRA)}
                  </span>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {state === "pending" ? (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-4 grid grid-cols-2 gap-2"
                    >
                      <button
                        onClick={() => setState("approved")}
                        className="flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-cream transition-transform active:scale-95"
                      >
                        <Check className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => setState("declined")}
                        className="flex h-11 items-center justify-center gap-2 rounded-full border border-ink/20 text-sm font-semibold transition-colors hover:bg-ink/5 active:scale-95"
                      >
                        <X className="h-4 w-4" /> Decline
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="status"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 flex items-center justify-between text-[13px]"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        {state === "approved" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        {state === "approved"
                          ? "Approved by you · professional notified"
                          : "Declined · no extra work done"}
                      </span>
                      <button
                        onClick={() => setState("pending")}
                        className="link-underline pb-0.5 font-mono text-[11px] uppercase tracking-[0.1em] opacity-70 hover:opacity-100"
                      >
                        Reset
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <dl className="mt-6 space-y-2 text-[14px]">
                <div className="flex justify-between text-ink/60">
                  <dt>GST ({GST_RATE * 100}%)</dt>
                  <dd className="tabular-nums">
                    <AnimatedAmount value={Math.round(subtotal * GST_RATE)} />
                  </dd>
                </div>
                <div className="flex items-end justify-between border-t border-ink/15 pt-4">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">
                    Final invoice
                  </dt>
                  <dd className="text-[40px] font-black leading-none tracking-[-0.05em]">
                    <AnimatedAmount value={total} />
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-ink/40">
            Try it · sample amounts · no real charge
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── Home passport — fanned records ───────────────────────── */
const records = [
  {
    icon: AirVent,
    title: "AC service",
    meta: "Bedroom · Split AC",
    date: "Apr 2026",
    tag: "Warranty · active",
    strong: true,
    details: [
      ["Pro", "Verified AC technician"],
      ["Work", "Jet-wash filters & coils, drain flush"],
      ["Paid", "₹707 · invoice saved"],
      ["Warranty", "30 days · active"],
    ],
  },
  {
    icon: Droplets,
    title: "Mixer tap replacement",
    meta: "Kitchen · Plumbing",
    date: "Jan 2026",
    tag: "Invoice saved",
    details: [
      ["Pro", "Verified plumber"],
      ["Work", "Cartridge + mixer swap, leak test"],
      ["Paid", "₹235 · invoice saved"],
      ["Warranty", "Ended Feb 2026"],
    ],
  },
  {
    icon: Sparkles,
    title: "Bathroom deep cleaning",
    meta: "Bathroom 2 · Cleaning",
    date: "Oct 2025",
    tag: "Report + 4 photos",
    details: [
      ["Pro", "Verified cleaning team"],
      ["Work", "Descaling, grout scrub, disinfection"],
      ["Paid", "₹707 · invoice saved"],
      ["Photos", "2 before · 2 after"],
    ],
  },
];

type RecordItem = (typeof records)[number];

/** Card contents, shared by the desktop fan and the mobile carousel. */
function RecordFace({ r, open }: { r: RecordItem; open: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-ink">
          <r.icon className="h-5 w-5" />
        </span>
        <span
          className={cn(
            "font-mono text-[10.5px] uppercase tracking-[0.14em]",
            r.strong ? "text-cream/50" : "text-ink/45",
          )}
        >
          {r.date}
        </span>
      </div>
      <div className="mt-6 text-[22px] font-bold leading-tight tracking-[-0.03em]">
        {r.title}
      </div>
      <div
        className={cn(
          "mt-1 text-[13px]",
          r.strong ? "text-cream/60" : "text-ink/55",
        )}
      >
        {r.meta}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.dl
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-2 font-mono text-[11.5px]">
              {r.details.map(([dk, dv]) => (
                <div
                  key={dk}
                  className={cn(
                    "flex justify-between gap-4 border-b border-dashed pb-2 last:border-0",
                    r.strong ? "border-cream/15" : "border-ink/12",
                  )}
                >
                  <dt
                    className={cn(
                      "shrink-0 uppercase tracking-[0.08em]",
                      r.strong ? "text-cream/50" : "text-ink/45",
                    )}
                  >
                    {dk}
                  </dt>
                  <dd className="text-right">{dv}</dd>
                </div>
              ))}
            </div>
          </motion.dl>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "mt-5 flex items-center gap-2 border-t pt-4 text-[12.5px] font-medium",
          r.strong ? "border-cream/15" : "border-ink/10",
        )}
      >
        <ShieldCheck className="h-4 w-4" /> {r.tag}
      </div>
    </>
  );
}

const cardSkin = (r: RecordItem) =>
  cn(
    "rounded-[26px] p-5 text-left shadow-[0_30px_60px_-30px_rgba(40,43,74,0.5)]",
    r.strong ? "bg-ink text-cream" : "border border-ink/10 bg-paper text-ink",
  );

/** Desktop / tablet: three records fanned out; the selected one opens in the centre. */
function RecordCard({
  r,
  spread,
  active,
  fanned,
  onSelect,
}: {
  r: RecordItem;
  spread: number;
  active: boolean;
  fanned: boolean;
  onSelect: () => void;
}) {
  const k = fanned ? 1 : 0;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={
        active ? `${r.title} — details shown` : `Show ${r.title} record`
      }
      initial={false}
      animate={{
        x: `${spread * 36 * k}%`,
        y: Math.abs(spread) * 22 * k,
        rotate: spread * 7 * k,
        scale: active ? 1 : 0.9,
      }}
      whileHover={active ? undefined : { scale: 0.93 }}
      transition={{ type: "spring", stiffness: 170, damping: 22, mass: 0.9 }}
      style={{ zIndex: active ? 30 : 20 - Math.abs(spread) }}
      className={cn(
        "absolute left-1/2 top-1/2 w-[310px] -translate-x-1/2 -translate-y-1/2 outline-offset-4 focus-visible:outline-2 focus-visible:outline-ink",
        cardSkin(r),
        !active && "cursor-pointer",
      )}
    >
      <RecordFace r={r} open={active} />
    </motion.button>
  );
}

/** Phones: one complete card at a time — swipe or use the arrows. Nothing is cropped. */
function RecordCarousel({
  active,
  setActive,
}: {
  active: number;
  setActive: (i: number) => void;
}) {
  const [dir, setDir] = useState(1);
  const go = (step: number) => {
    setDir(step);
    setActive((active + step + records.length) % records.length);
  };
  const r = records[active];
  return (
    <div>
      <div className="grid">
        <AnimatePresence initial={false} custom={dir}>
          <motion.article
            key={r.title}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 56, opacity: 0, rotate: d * 2 }),
              center: { x: 0, opacity: 1, rotate: 0 },
              exit: (d: number) => ({ x: d * -56, opacity: 0, rotate: d * -2 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50 || info.velocity.x < -400) go(1);
              else if (info.offset.x > 50 || info.velocity.x > 400) go(-1);
            }}
            aria-roledescription="slide"
            aria-label={`${active + 1} of ${records.length}: ${r.title}`}
            className={cn(
              "[grid-area:1/1] w-full touch-pan-y select-none self-start",
              cardSkin(r),
            )}
          >
            <RecordFace r={r} open />
          </motion.article>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous record"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 transition-colors hover:border-ink"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5" role="group" aria-label="Choose a record">
          {records.map((x, i) => (
            <button
              key={x.title}
              type="button"
              aria-label={`Show ${x.title}`}
              aria-pressed={i === active}
              onClick={() => {
                setDir(i > active ? 1 : -1);
                setActive(i);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                i === active ? "w-7 bg-ink" : "w-2 bg-ink/25",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next record"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-cream"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45">
        Swipe to browse records
      </p>
    </div>
  );
}

export function Passport() {
  const ref = useRef<HTMLDivElement>(null);
  const fanned = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const [active, setActive] = useState(0);
  // The selected card sits in the centre; the others keep their order on either side.
  const others = records.map((_, i) => i).filter((i) => i !== active);
  const spreadOf = (i: number) =>
    i === active ? 0 : others.indexOf(i) === 0 ? -1 : 1;
  return (
    <section className="grain overflow-x-clip border-y border-ink/15">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <SectionLabel index="07" title="Home passport" note="Sample records" />
        <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-[clamp(2.75rem,6.5vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.05em]">
              <LineReveal
                onView
                lines={[
                  "Your home",
                  "has a memory",
                  <span key="c" className="text-ink/35">
                    now.
                  </span>,
                ]}
              />
            </h2>
            <Reveal className="mt-8 max-w-md text-lg leading-relaxed text-ink/70">
              Every repair, installation, invoice and warranty — saved
              automatically against your address. Next time, you&apos;ll know
              exactly what was done and what&apos;s still covered.
            </Reveal>
            <ul className="mt-8 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 text-[14px]">
              {[
                "Repair history",
                "Installations",
                "Invoices",
                "Warranty status",
                "Before / after photos",
                "Materials used",
              ].map((t, i) => (
                <Reveal
                  as="li"
                  key={t}
                  delay={i * 0.04}
                  y={10}
                  className="flex items-center gap-2 text-ink/80"
                >
                  <span className="h-1.5 w-1.5 rotate-45 bg-ink" /> {t}
                </Reveal>
              ))}
            </ul>
          </div>
          <div className="sm:hidden">
            <RecordCarousel active={active} setActive={setActive} />
          </div>
          <div className="hidden sm:block">
            <div ref={ref} className="relative h-[500px]">
              {records.map((r, i) => (
                <RecordCard
                  key={r.title}
                  r={r}
                  spread={spreadOf(i)}
                  active={i === active}
                  fanned={fanned}
                  onSelect={() => setActive(i)}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/45">
                Tap a card to open it
              </span>
              <div
                className="flex gap-1.5"
                role="group"
                aria-label="Choose a record"
              >
                {records.map((r, i) => (
                  <button
                    key={r.title}
                    type="button"
                    aria-label={`Show ${r.title}`}
                    aria-pressed={i === active}
                    onClick={() => setActive(i)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      i === active
                        ? "w-7 bg-ink"
                        : "w-2 bg-ink/25 hover:bg-ink/50",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FAQ — numbered editorial rows ───────────────────────── */
const faqs = [
  {
    q: "How do I know the professional is genuine?",
    a: "Every professional's ID and trade documents are reviewed before activation. On arrival they scan your one-time service QR — the job can only start if it matches your booking and their assignment.",
  },
  {
    q: "When is my booking actually confirmed?",
    a: "Your slot is held while you pay. The booking confirms only after the payment is verified on our server — a browser 'success' screen alone never confirms anything.",
  },
  {
    q: "What if more work is needed?",
    a: "Your professional sends an itemised quote to your app. Nothing extra is done or charged unless you approve it, and the final invoice matches what you approved.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes — cancel free of charge up to 2 hours before the visit and the payment is refunded to its original source. Full policies are published before launch.",
  },
  {
    q: "Is there a warranty?",
    a: "Eligible services include a workmanship warranty (up to 60 days). It's attached to the booking and visible in your Home Passport.",
  },
  {
    q: "Where do you operate?",
    a: "We're starting in Ahmedabad and expanding area by area once the service is reliable — every trade, done properly.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
      <SectionLabel
        index="09"
        title="Questions"
        note={`${faqs.length} answers`}
      />
      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-[clamp(2.75rem,6vw,5rem)] font-bold leading-[0.92] tracking-[-0.05em] lg:sticky lg:top-36 lg:self-start">
          <LineReveal
            onView
            lines={[
              "Asked,",
              <span key="b" className="text-ink/35">
                answered.
              </span>,
            ]}
          />
        </h2>
        <ul className="border-t border-ink/20">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal
                as="li"
                key={f.q}
                delay={i * 0.04}
                y={14}
                className="border-b border-ink/20"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                  id={`faq-q-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-start gap-5 py-6 text-left"
                >
                  <span className="mt-1.5 font-mono text-xs text-ink/45">
                    ({String(i + 1).padStart(2, "0")})
                  </span>
                  <span className="flex-1 text-[clamp(1.15rem,2.2vw,1.6rem)] font-semibold leading-snug tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-1">
                    {f.q}
                  </span>
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)]",
                      isOpen
                        ? "rotate-45 border-ink bg-ink text-cream"
                        : "border-ink/20 group-hover:border-ink",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 pl-12 pr-14 text-[16px] leading-relaxed text-ink/70">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
