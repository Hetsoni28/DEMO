"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { EASE } from "@/components/motion/motion";
import { useApp, type Role } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * First-run guided tour. Spotlights the real controls of each dashboard, one at a
 * time, so a new user learns the app by looking at it — not by reading a manual.
 * Targets are `[data-tour="…"]`; when several match (sidebar vs. mobile tab bar),
 * the visible one wins, so the same steps work on phone and desktop.
 */
type Step = { target: string; title: string; body: string };

const STEPS: Record<Role, Step[]> = {
  customer: [
    {
      target: "tabs",
      title: "Everything is one tap away",
      body: "Home, your bookings, the Home passport and saved places live here.",
    },
    {
      target: "cta",
      title: "Book any home service",
      body: "Plumbing to pest control. Add several services to one basket and pay once.",
    },
    {
      target: "next-visit",
      title: "Your next visit, live",
      body: "Countdown, who is coming and where the job stands, updated as it happens.",
    },
    {
      target: "qr",
      title: "Show this QR at the door",
      body: "Your professional scans it to start the job. Only the pro assigned to you can.",
    },
    {
      target: "account",
      title: "Your account",
      body: "Switch role, reset the demo or replay this guide any time from here.",
    },
  ],
  professional: [
    {
      target: "next-job",
      title: "Your next job",
      body: "Customer, time, address and your payout. Navigate opens directions.",
    },
    {
      target: "cta",
      title: "Scan to start",
      body: "At the door, scan the customer's QR. It confirms you are at the right booking.",
    },
    {
      target: "schedule",
      title: "Your day, hour by hour",
      body: "Jobs, breaks and travel buffers. Tap a job for its details.",
    },
    {
      target: "tabs",
      title: "Jobs, hours and earnings",
      body: "Set working hours and days off. Customers only see slots you can take.",
    },
    {
      target: "account",
      title: "Pause new jobs",
      body: "Turn off “Accepting jobs” here when you need a break. Replay this guide from here too.",
    },
  ],
  admin: [
    {
      target: "period",
      title: "Pick the period",
      body: "7, 14 or 30 days. Every number and chart below updates.",
    },
    {
      target: "kpis",
      title: "The numbers that matter",
      body: "Revenue, bookings, order value and completion, each compared to the previous period.",
    },
    {
      target: "queue",
      title: "What needs you now",
      body: "Assign professionals, approve verifications and handle refunds straight from the queue.",
    },
    {
      target: "search",
      title: "Jump anywhere",
      body: "Search pages and actions. On a keyboard, press Ctrl K.",
    },
    {
      target: "tabs",
      title: "The full console",
      body: "Bookings, professionals, payments and the service catalogue.",
    },
  ],
};

const noop = () => () => {};
const seenKey = (role: Role) => `hc-tour-${role}`;
const REPLAY_EVENT = "hc:tour";

/** Ask the mounted tour to start again (used by "How it works" buttons). */
export function replayTour() {
  window.dispatchEvent(new Event(REPLAY_EVENT));
}

function findTarget(name: string): HTMLElement | null {
  const all = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`),
  );
  return (
    all.find(
      (el) =>
        el.offsetParent !== null || getComputedStyle(el).position === "fixed",
    ) ?? null
  );
}

type Rect = { top: number; left: number; width: number; height: number };
const PAD = 8;

export function Tour({ role }: { role: Role }) {
  const ready = useApp((s) => s.ready);
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(180);
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  const start = useCallback(() => {
    // Only keep steps whose target exists right now (e.g. no "next visit" when nothing is booked).
    const available = STEPS[role].filter((s) => findTarget(s.target));
    if (!available.length) return;
    setSteps(available);
    setI(0);
    setOpen(true);
  }, [role]);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(seenKey(role), "1");
    } catch {}
  }, [role]);

  // A newly approved pro sees the welcome first; its "Show me around" starts the tour.
  const welcomePending = useApp((s) => s.accounts.find((x) => x.id === s.accountId)?.approvalSeen === false);

  // First visit: wait for demo data so the real cards exist, then start.
  useEffect(() => {
    if (!ready || welcomePending) return;
    let seen = false;
    try {
      seen = localStorage.getItem(seenKey(role)) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(start, 900);
    return () => clearTimeout(t);
  }, [ready, role, start, welcomePending]);

  // Replay on request.
  useEffect(() => {
    window.addEventListener(REPLAY_EVENT, start);
    return () => window.removeEventListener(REPLAY_EVENT, start);
  }, [start]);

  const step = open ? steps[i] : undefined;

  // Bring the target into view, then keep the spotlight glued to it.
  useEffect(() => {
    if (!step) return;
    const el = findTarget(step.target);
    if (!el) return;
    const r0 = el.getBoundingClientRect();
    const fixed =
      getComputedStyle(el).position === "fixed" ||
      !!el.closest("nav[aria-label='Primary'], header");
    if (!fixed && (r0.top < 80 || r0.bottom > window.innerHeight - 120))
      el.scrollIntoView({
        block: "center",
        behavior: reduce ? "auto" : "smooth",
      });
    let raf = 0;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      });
      setVp({ w: window.innerWidth, h: window.innerHeight });
    };
    const loop = () => {
      measure();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [step, reduce]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [step, vp.w]);

  // Keyboard + scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight")
        setI((n) => (n < steps.length - 1 ? n + 1 : n));
      if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, steps.length, close]);

  if (!mounted) return null;

  const last = i === steps.length - 1;
  const next = () => (last ? close() : setI(i + 1));
  const back = () => setI(Math.max(0, i - 1));

  // Card placement: below the target if there is room, otherwise above; clamped to the screen.
  const W = Math.min(360, vp.w - 32);
  let cardTop = 0;
  let cardLeft = 16;
  if (rect) {
    const below = rect.top + rect.height + 14;
    const above = rect.top - cardH - 14;
    cardTop =
      below + cardH < vp.h - 12
        ? below
        : above > 12
          ? above
          : Math.max(12, vp.h - cardH - 12);
    cardLeft = Math.min(
      Math.max(16, rect.left + rect.width / 2 - W / 2),
      vp.w - W - 16,
    );
  }

  return createPortal(
    <AnimatePresence>
      {open && step && rect && (
        <motion.div
          key="tour"
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label="How it works"
        >
          {/* Dim everything except the spotlight (huge box-shadow trick keeps it one element) */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute rounded-[22px] ring-2 ring-cream/90"
            initial={false}
            animate={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 32 }
            }
            style={{ boxShadow: "0 0 0 9999px rgba(28,30,54,0.72)" }}
          />
          {/* Clicking the dimmed area moves on; the spotlight itself stays interactive-looking but inert */}
          <button
            type="button"
            aria-label="Next tip"
            className="absolute inset-0 cursor-default"
            onClick={next}
          />

          <motion.div
            ref={cardRef}
            key={step.target}
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: EASE }}
            drag={reduce ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) next();
              else if (info.offset.x > 50) back();
            }}
            style={{ top: cardTop, left: cardLeft, width: W }}
            className="absolute rounded-3xl bg-cream p-5 text-ink shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
                How it works
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Skip guide"
                className="-m-1.5 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-1.5 text-[19px] font-bold leading-tight tracking-[-0.02em]">
              {step.title}
            </h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink/65">
              {step.body}
            </p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex gap-1.5" aria-hidden>
                {steps.map((s, n) => (
                  <span
                    key={s.target}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      n === i ? "w-5 bg-ink" : "w-1.5 bg-ink/20",
                    )}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    aria-label="Previous tip"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 transition-colors hover:border-ink/40 active:scale-95"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13.5px] font-semibold text-cream transition-transform active:scale-95"
                >
                  {last ? "Got it" : "Next"}
                  {!last && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <span className="sr-only" aria-live="polite">
              Tip {i + 1} of {steps.length}: {step.title}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
