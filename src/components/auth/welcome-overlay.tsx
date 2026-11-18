"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CrewWave } from "@/components/auth/crew-wave";
import { EASE } from "@/components/motion/motion";
import { PORTAL_LABEL, ROLE_LABEL } from "@/lib/rbac";
import { useApp } from "@/lib/store";

/** How long the welcome holds before the curtain lifts (long enough for the wave). */
const HOLD_MS = 2700;

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Full-screen welcome played right after someone signs in: a HomeCrew crew member
 * pops up and waves hello while the portal loads underneath, then the curtain lifts.
 * Tap, Enter or Esc skips; reduced motion gets a still character and a short fade.
 */
export function WelcomeOverlay() {
  const welcome = useApp((s) => s.welcome);
  const account = useApp((s) => s.accounts.find((a) => a.id === s.welcome?.accountId));
  const pro = useApp((s) => s.pros.find((p) => p.id === account?.proId));
  const dismiss = useApp((s) => s.dismissWelcome);
  const reduce = useReducedMotion();
  const show = !!welcome && !!account;
  const hold = reduce ? 1100 : HOLD_MS;

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(dismiss, hold);
    try {
      navigator.vibrate?.(10);
    } catch {}
    return () => clearTimeout(t);
  }, [show, hold, dismiss, welcome?.at]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => (e.key === "Escape" || e.key === "Enter") && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, dismiss]);

  const first = account?.name.split(" ")[0] ?? "";
  const pending = account?.role === "professional" && account.status !== "ACTIVE";
  const detail =
    account?.role === "professional" ? (pro ? `${pro.trade} · ${pro.area}` : ROLE_LABEL.professional) : account?.role === "admin" ? "Operations · Ahmedabad" : "Customer";
  const opening = pending ? "Opening your application status" : `Opening your ${account ? PORTAL_LABEL[account.role] : "app"}`;
  const hello = pending ? `Hi ${first}! Nearly there.` : account?.role === "admin" ? `Hi ${first}! All set.` : `Hi ${first}!`;

  return (
    <AnimatePresence>
      {show && account && (
        <motion.div
          key={welcome!.at}
          role="status"
          aria-live="polite"
          aria-label={`Welcome, ${first}. ${opening}.`}
          onClick={dismiss}
          className="grain fixed inset-0 z-[110] flex cursor-pointer flex-col overflow-hidden bg-cream px-6 pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] text-ink sm:px-10"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)" }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }}
          exit={reduce ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: reduce ? 0.25 : 0.65, ease: EASE }}
        >
          {/* soft spotlight behind the character */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(55% 42% at 50% 40%, rgba(255,255,255,0.75), rgba(255,255,255,0) 72%)" }} />

          <div className="relative flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/45">
            <span>HomeCrew</span>
            <span>Tap to skip</span>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center text-center">
            <div className="relative">
              <CrewWave className="h-[clamp(190px,32vh,280px)] w-auto" />
              {/* speech bubble */}
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.4, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 20, delay: reduce ? 0 : 0.75 }}
                style={{ transformOrigin: "0% 100%" }}
                className="absolute -right-10 -top-3 whitespace-nowrap rounded-2xl rounded-bl-md bg-ink px-4 py-2.5 text-[15px] font-bold tracking-[-0.01em] text-cream shadow-[0_14px_30px_-12px_rgba(40,43,74,0.55)] sm:-right-32 sm:text-[17px]"
              >
                {hello}
              </motion.div>
            </div>

            <h2 className="mt-8 text-[clamp(2.25rem,7vw,4.75rem)] font-black leading-[0.95] tracking-tighter">
              <span className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 0.75, ease: EASE, delay: reduce ? 0 : 0.95 }}>
                  {greeting()}, <span className="text-ink/35">{first}.</span>
                </motion.span>
              </span>
            </h2>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 1.2 }}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-3.5 py-1.5 text-[13px] text-ink/75"
            >
              <span className={pending ? "h-1.5 w-1.5 rounded-full bg-amber-500" : "h-1.5 w-1.5 rounded-full bg-emerald-600"} />
              {detail}
              {pending ? " · in review" : ""}
            </motion.div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="h-0.75 w-full overflow-hidden rounded-full bg-ink/10">
              <motion.div className="h-full origin-left rounded-full bg-ink" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: hold / 1000, ease: [0.4, 0, 0.2, 1] }} />
            </div>
            <div className="mt-3 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/50">{opening}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
