"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/atoms/logo";
import { EASE } from "@/components/motion/motion";
import { INTRO_KEY } from "@/lib/intro";

/**
 * "Turn the key" welcome intro (home-services metaphor).
 * Drag the key a quarter turn (or click / press Enter): the lock opens, the
 * front door swings open, warm light floods out, we walk through the doorway,
 * the tagline lands and the curtain lifts. Shown once per browser session.
 */

const IntroContext = createContext(true);
/** `true` once the intro has finished — hero animations wait for this. */
export const useIntroDone = () => useContext(IntroContext);

const noopSubscribe = () => () => {};
const readSeen = () => {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
};

const TURN = 90; // a quarter turn unlocks the door
type Phase = "idle" | "opening" | "entering" | "filled";

/* ───────────── Key ───────────── */
function Key() {
  // Points straight up out of the keyhole; pivots at the bottom (the lock).
  return (
    <svg viewBox="0 0 40 100" className="h-full w-full" aria-hidden>
      <circle cx="20" cy="17" r="14" fill="currentColor" />
      <circle cx="20" cy="17" r="5.5" fill="#282B4A" />
      <rect x="17" y="28" width="6" height="64" rx="3" fill="currentColor" />
      <rect x="23" y="70" width="7" height="5" rx="1.5" fill="currentColor" />
      <rect x="23" y="80" width="5" height="5" rx="1.5" fill="currentColor" />
      <rect
        x="13"
        y="36"
        width="14"
        height="4"
        rx="2"
        fill="#282B4A"
        fillOpacity="0.25"
      />
    </svg>
  );
}

function Corner({
  k,
  v,
  className,
}: {
  k: ReactNode;
  v: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[13px] font-medium text-cream">{k}</div>
      <div className="text-[13px] text-cream/55">{v}</div>
    </div>
  );
}

const WORDMARK = "HomeCrew";
const TRADES = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "AC & appliances",
  "Carpentry",
  "Painting",
  "Pest control",
];
/** How long the welcome room holds before the curtain lifts. */
const HOLD_MS = 2900;

/* ───────────── Provider ───────────── */
export function IntroProvider({ children }: { children: ReactNode }) {
  const seen = useSyncExternalStore(noopSubscribe, readSeen, () => false);
  const [finished, setFinished] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);
  const [touched, setTouched] = useState(false);
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const lockRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ last: number; moved: number } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rot = useMotionValue(0);
  const done = seen || finished;

  useMotionValueEvent(rot, "change", (v) =>
    setPct(Math.round((Math.max(0, v) / TURN) * 100)),
  );

  useEffect(() => {
    const root = document.documentElement;
    if (done) {
      root.style.overflow = "";
      lenis?.start();
      return;
    }
    root.style.overflow = "hidden";
    lenis?.stop();
    lockRef.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = "";
    };
  }, [done, lenis]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
    setFinished(true);
  };

  const unlock = () => {
    if (phase !== "idle") return;
    setPhase("opening");
    try {
      navigator.vibrate?.(16);
    } catch {}
    const swing = reduce ? 100 : 900;
    const walk = reduce ? 150 : 1000;
    const hold = reduce ? 300 : HOLD_MS;
    timers.current.push(setTimeout(() => setPhase("entering"), swing));
    timers.current.push(setTimeout(() => setPhase("filled"), swing + walk));
    timers.current.push(setTimeout(finish, swing + walk + hold));
  };

  /** Click / Enter: the key turns itself the rest of the way. */
  const autoTurn = () => {
    if (phase !== "idle") return;
    setTouched(true);
    animate(rot, TURN, {
      duration: reduce ? 0.05 : 0.55,
      ease: [0.65, 0, 0.35, 1],
      onComplete: unlock,
    });
  };

  const angleAt = (e: React.PointerEvent) => {
    const r = lockRef.current!.getBoundingClientRect();
    return (
      (Math.atan2(
        e.clientY - (r.top + r.height / 2),
        e.clientX - (r.left + r.width / 2),
      ) *
        180) /
      Math.PI
    );
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== "idle") return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    rot.stop();
    drag.current = { last: angleAt(e), moved: 0 };
    setTouched(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || phase !== "idle") return;
    const a = angleAt(e);
    let delta = a - drag.current.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    drag.current.last = a;
    drag.current.moved += Math.abs(delta);
    const next = Math.min(TURN, Math.max(0, rot.get() + delta));
    rot.set(next);
    if (next >= TURN) {
      drag.current = null;
      unlock();
    }
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    const { moved } = drag.current;
    drag.current = null;
    if (moved < 5) return autoTurn();
    if (rot.get() < TURN)
      animate(rot, 0, { type: "spring", stiffness: 140, damping: 14 }); // spring-loaded lock
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (phase !== "idle") return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      autoTurn();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setTouched(true);
      const next = Math.min(TURN, rot.get() + 30);
      animate(rot, next, {
        duration: 0.2,
        ease: EASE,
        onComplete: next >= TURN ? unlock : undefined,
      });
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      animate(rot, Math.max(0, rot.get() - 30), { duration: 0.2, ease: EASE });
    }
  };

  const busy = phase !== "idle";
  const ring = 2 * Math.PI * 30;

  return (
    <IntroContext.Provider value={done}>
      <AnimatePresence>
        {!done && (
          <motion.div
            key="intro"
            role="dialog"
            aria-modal="true"
            aria-label="Welcome to HomeCrew"
            className="pp-intro fixed inset-0 z-[100] overflow-hidden bg-ink text-cream"
            exit={{ y: "-100%" }}
            transition={{ duration: 1, ease: EASE }}
          >
            {/* Poster corners */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: busy ? 0 : 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute inset-x-0 top-0 flex items-start justify-between px-5 py-6 sm:px-8">
                <div className="flex items-start gap-3">
                  <LogoMark light className="mt-0.5" />
                  <Corner k="Made by" v="HomeCrew" />
                </div>
                <Corner
                  k="Turn to open"
                  v="or press Enter"
                  className="text-right"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-5 py-6 sm:px-8">
                <Corner k="2026" v="Home services · Ahmedabad" />
                <button
                  type="button"
                  onClick={finish}
                  className="group inline-flex items-center gap-2 rounded-full border border-cream/20 bg-ink/60 px-4 py-2 text-[12px] font-medium text-cream/75 backdrop-blur transition-colors hover:border-cream hover:text-cream"
                >
                  Skip intro
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </motion.div>

            {/* Composition */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <motion.div
                animate={busy ? { opacity: 0, y: -24 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div className="overflow-hidden">
                  <motion.h2
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                    className="text-[clamp(2.6rem,7.5vw,6rem)] font-black uppercase leading-[0.85] tracking-[-0.06em]"
                  >
                    Turn the key
                  </motion.h2>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="mt-4 font-mono text-[11.5px] uppercase tracking-[0.14em] text-cream/60 tabular-nums"
                >
                  Lock : {pct >= 100 ? "open" : "engaged"} &nbsp;·&nbsp;{" "}
                  {String(pct).padStart(3, "0")}%
                </motion.p>
              </motion.div>

              {/* Doorway */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: phase === "entering" || phase === "filled" ? 16 : 1,
                }}
                transition={
                  phase === "entering"
                    ? {
                        scale: {
                          duration: reduce ? 0.1 : 1.05,
                          ease: [0.7, 0, 0.84, 0],
                        },
                      }
                    : { duration: 1.1, ease: EASE, delay: 0.15 }
                }
                className="relative mt-10 h-[min(48vh,380px)] w-[min(38vh,270px)] sm:mt-12"
                style={{ perspective: 1400, transformOrigin: "50% 60%" }}
              >
                {/* frame + warm light behind the door */}
                <div
                  className="absolute -inset-3 rounded-t-[999px] border-2 border-cream/25"
                  aria-hidden
                />
                <div
                  className="absolute inset-0 overflow-hidden rounded-t-[999px] bg-cream"
                  aria-hidden
                >
                  <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_70%,#f8f6ec,transparent_75%)]" />
                </div>
                {/* floor line */}
                <div
                  className="absolute -bottom-3 left-1/2 h-px w-[160%] -translate-x-1/2 bg-cream/25"
                  aria-hidden
                />

                {/* door leaf */}
                <motion.div
                  className="absolute inset-0 rounded-t-[999px] border border-cream/30 bg-ink-soft shadow-[inset_0_0_0_10px_rgba(29,31,55,0.35)]"
                  style={{
                    transformOrigin: "0% 50%",
                    transformStyle: "preserve-3d",
                  }}
                  animate={{ rotateY: busy ? -108 : 0 }}
                  transition={{
                    duration: reduce ? 0.1 : 0.95,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                >
                  {/* panels */}
                  <div
                    className="absolute inset-x-[14%] top-[12%] h-[34%] rounded-t-[999px] border border-cream/15"
                    aria-hidden
                  />
                  <div
                    className="absolute inset-x-[14%] bottom-[8%] h-[38%] rounded-md border border-cream/15"
                    aria-hidden
                  />
                  {/* handle */}
                  <div
                    className="absolute right-[10%] top-[50%] h-2.5 w-9 -translate-y-1/2 rounded-full bg-cream/85"
                    aria-hidden
                  />

                  {/* lock + key */}
                  <div
                    ref={lockRef}
                    role="slider"
                    tabIndex={0}
                    aria-label="Key. Turn it, or press Enter, to open HomeCrew"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                    aria-valuetext={`Unlocked ${pct} percent`}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onKeyDown={onKeyDown}
                    className="absolute right-[6%] top-[60%] h-[72px] w-[72px] -translate-y-1/2 translate-x-[18%] cursor-grab touch-none select-none rounded-full outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-cream/60"
                  >
                    {/* progress ring */}
                    <svg
                      viewBox="0 0 72 72"
                      className="absolute inset-0 h-full w-full -rotate-90"
                      aria-hidden
                    >
                      <circle
                        cx="36"
                        cy="36"
                        r="30"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.15"
                        strokeWidth="2"
                      />
                      <circle
                        cx="36"
                        cy="36"
                        r="30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={ring}
                        strokeDashoffset={ring * (1 - pct / 100)}
                      />
                    </svg>
                    {/* escutcheon + keyhole */}
                    <div
                      className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream/90"
                      aria-hidden
                    >
                      <span className="absolute left-1/2 top-[30%] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-ink" />
                      <span className="absolute left-1/2 top-[48%] h-3 w-1.5 -translate-x-1/2 rounded-b-sm bg-ink" />
                    </div>
                    {/* key — pivots on the keyhole */}
                    <motion.div
                      style={{ rotate: rot, originX: 0.5, originY: 1 }}
                      className="pointer-events-none absolute bottom-1/2 left-1/2 h-[88px] w-[34px] -translate-x-1/2 text-cream drop-shadow-[0_10px_18px_rgba(0,0,0,0.4)]"
                    >
                      <Key />
                    </motion.div>
                  </div>
                </motion.div>

                {/* turn hint */}
                <AnimatePresence>
                  {!touched && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ delay: 1.6, duration: 0.6 }}
                      className="pointer-events-none absolute -right-28 top-[34%] hidden items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-cream/55 sm:flex"
                      aria-hidden
                    >
                      <svg viewBox="0 0 60 40" className="h-8 w-12">
                        <motion.path
                          d="M6 34 C 10 12, 34 4, 52 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeDasharray="3 5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: [0, 1, 1] }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            delay: 1.6,
                          }}
                        />
                        <path
                          d="M45 8 L53 14 L44 19"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Turn
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Inside: warm cream room + tagline */}
            <AnimatePresence>
              {phase === "filled" && (
                <motion.div
                  key="inside"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="grain absolute inset-0 flex flex-col bg-cream px-5 py-6 text-ink sm:px-8"
                >
                  {/* poster corners */}
                  <div className="flex items-start justify-between text-[13px]">
                    <div className="flex items-start gap-3">
                      <LogoMark className="mt-0.5" />
                      <div>
                        <div className="font-medium">Welcome home</div>
                        <div className="text-ink/55">HomeCrew</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">2026</div>
                      <div className="text-ink/55">Ahmedabad</div>
                    </div>
                  </div>

                  {/* Centre stage: the house draws itself, the name rises, the trades arrive */}
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-14 w-14 sm:h-16 sm:w-16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <motion.path
                        d="M3.5 11 12 4l8.5 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.55, ease: EASE }}
                      />
                      <motion.path
                        d="M6 9.5V20h4v-5h4v5h4V9.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.75, ease: EASE, delay: 0.3 }}
                      />
                    </svg>

                    <h2
                      aria-label="HomeCrew"
                      className="mt-6 flex overflow-hidden pb-[0.04em] text-[clamp(3.6rem,15.5vw,13.5rem)] font-black uppercase leading-[0.86] tracking-[-0.06em]"
                    >
                      {WORDMARK.split("").map((ch, i) => (
                        <motion.span
                          key={i}
                          aria-hidden
                          initial={{ y: "108%", rotate: 6 }}
                          animate={{ y: "0%", rotate: 0 }}
                          transition={{
                            duration: 0.85,
                            ease: EASE,
                            delay: 0.35 + i * 0.05,
                          }}
                          className={
                            i >= 4 ? "inline-block text-ink/35" : "inline-block"
                          }
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </h2>

                    <motion.p
                      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.95 }}
                      className="mt-6 text-[clamp(1.05rem,2.3vw,1.6rem)] font-semibold tracking-[-0.02em]"
                    >
                      Home problems.{" "}
                      <span className="text-ink/45">
                        Professionally solved.
                      </span>
                    </motion.p>

                    <ul
                      className="mt-8 flex max-w-2xl flex-wrap justify-center gap-2"
                      aria-label="Services"
                    >
                      {TRADES.map((t, i) => (
                        <motion.li
                          key={t}
                          initial={{ opacity: 0, scale: 0.6, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                            delay:
                              1.2 +
                              Math.abs(i - (TRADES.length - 1) / 2) * 0.07,
                          }}
                          className="rounded-full border border-ink/20 bg-paper/60 px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/70"
                        >
                          {t}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Hold meter — grows from the centre while the room settles */}
                  <div className="flex flex-col items-center gap-3 pb-1">
                    <div className="h-px w-full max-w-xs overflow-hidden bg-ink/10">
                      <motion.div
                        className="h-full bg-ink"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: (HOLD_MS - 200) / 1000,
                          ease: "linear",
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/45">
                      Opening the door to every trade
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </IntroContext.Provider>
  );
}
