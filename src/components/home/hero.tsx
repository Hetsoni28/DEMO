"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, MapPin, Pause, Play, Search, Volume2, VolumeX } from "lucide-react";
import { EASE, LineReveal } from "@/components/motion/motion";
import { useIntroDone } from "./intro";

const quick = [
  { label: "AC service", q: "ac service" },
  { label: "Deep cleaning", q: "deep cleaning" },
  { label: "Leaking tap", q: "tap" },
  { label: "Fan installation", q: "fan" },
];
const fixing = ["plumbers", "electricians", "cleaners", "AC techs", "carpenters", "painters", "pest control"];

function Meta({ k, v, align = "left", delay = 0, play }: { k: string; v: React.ReactNode; align?: "left" | "right"; delay?: number; play: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={play ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, ease: EASE, delay }}
      className={align === "right" ? "text-right" : ""}
    >
      <div className="text-[13px] font-medium text-cream">{k}</div>
      <div className="text-[13px] text-cream/65">{v}</div>
    </motion.div>
  );
}

/** Live Ahmedabad time — rendered after mount only, so prerendering stays static. */
function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
    const tick = () => setTime(fmt.format(new Date()));
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  return <span className="tabular-nums">{time ? `${time} IST` : "IST"}</span>;
}

function RotatingWord({ play }: { play: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!play) return;
    const t = setInterval(() => setI((x) => (x + 1) % fixing.length), 1800);
    return () => clearInterval(t);
  }, [play]);
  return (
    <motion.span layout transition={{ duration: 0.4, ease: EASE }} className="relative inline-block h-[1.5em] overflow-hidden align-top leading-[1.5]">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={fixing[i]}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="block whitespace-nowrap text-cream"
        >
          {fixing[i]}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

export function Hero() {
  const router = useRouter();
  const play = useIntroDone();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const filmScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16]);

  const go = (term: string) => router.push(term ? `/services?q=${encodeURIComponent(term)}` : "/services");

  // Start the film from the top once the intro has finished (never auto-plays for reduced-motion users).
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !play || reduce) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [play, reduce]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted && v.paused) v.play().catch(() => {});
  };

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden bg-ink text-cream">
      {/* ── Full-bleed film ── */}
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ clipPath: "inset(6% 4% 6% 4% round 32px)" }}
        animate={play ? { clipPath: "inset(0% 0% 0% 0% round 0px)" } : undefined}
        transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
      >
        <motion.div style={{ scale: reduce ? 1.04 : filmScale }} className="absolute inset-0">
          <video
            ref={videoRef}
            className="h-full w-full object-cover object-[64%_center] md:object-[58%_center] lg:object-center"
            src="/media/homecrew-film.mp4"
            poster="/media/homecrew-film-poster.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="HomeCrew brand film: professionals cleaning, fixing a kitchen sink, servicing an AC and installing a light while a homeowner relaxes."
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        </motion.div>
        {/* indigo washes keep cream text legible on bright frames */}
        <div aria-hidden className="absolute inset-0 bg-ink/45" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(29,31,55,0.78)_0%,rgba(29,31,55,0.35)_55%,rgba(29,31,55,0.15)_100%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-deep/85 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink-deep/60 to-transparent" />
      </motion.div>

      {/* ── Content ── */}
      <div className="relative mx-auto flex min-h-[calc(100svh-108px)] max-w-7xl flex-col px-5 pb-8 pt-6 sm:px-8">
        <div className="flex items-start justify-between">
          <Meta k="Made for" v="Ahmedabad homes" delay={0.1} play={play} />
          <Meta k="Ahmedabad, now" v={<LocalTime />} align="right" delay={0.2} play={play} />
        </div>

        <motion.div style={{ y: headY, opacity: fade }} className="flex flex-1 flex-col justify-center py-10">
          <h1 className="text-[clamp(3.6rem,15.5vw,13.5rem)] font-black uppercase leading-[0.82] tracking-[-0.065em] text-cream drop-shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            <span className="sr-only">HomeCrew — home problems, professionally solved.</span>
            <span aria-hidden>
              <LineReveal lines={["Home,", "sorted."]} delay={0.2} stagger={0.12} play={play} />
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={play ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-5 flex flex-wrap items-start gap-x-2 font-mono text-[13px] uppercase leading-[1.5] tracking-[0.08em] text-cream/75 sm:text-sm"
          >
            <span className="inline-flex items-start gap-[1ch]">
              <span>Booking :</span>
              <RotatingWord play={play} />
            </span>
            <span className="text-cream/40">·</span>
            <span>Paid : before visit</span>
            <span className="text-cream/40">·</span>
            <span>QR : checked at door</span>
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1fr_auto]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={play ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 1, ease: EASE, delay: 0.7 }} className="max-w-xl">
            <p className="text-lg leading-relaxed text-cream/85 sm:text-xl">
              Plumbers, electricians, cleaners, AC technicians and more — background-checked and bookable in under a minute. Real time slots, fixed prices, and a one-time QR so you know exactly who&apos;s at your door.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                go(q);
              }}
              className="mt-7 flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 p-1.5 pl-5 backdrop-blur-md transition focus-within:border-cream/60 focus-within:bg-cream/15"
            >
              <Search className="h-4 w-4 shrink-0 text-cream/70" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What needs fixing?"
                aria-label="Search services"
                className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-cream outline-none placeholder:text-cream/55"
              />
              <span className="hidden items-center gap-1 pr-2 text-[13px] text-cream/65 sm:flex">
                <MapPin className="h-3.5 w-3.5" /> Ahmedabad
              </span>
              <button type="submit" className="group flex h-11 items-center gap-2 rounded-full bg-cream px-5 text-sm font-semibold text-ink">
                Find
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {quick.map((t, i) => (
                <motion.button
                  key={t.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={play ? { opacity: 1, y: 0 } : undefined}
                  transition={{ delay: 1 + i * 0.06, ease: EASE, duration: 0.6 }}
                  onClick={() => go(t.q)}
                  className="rounded-full border border-cream/25 bg-ink/20 px-3.5 py-1.5 text-[13px] text-cream/85 backdrop-blur-sm transition-colors hover:border-cream hover:bg-cream hover:text-ink"
                >
                  {t.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={play ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: EASE, delay: 1.3 }}
            className="hidden items-center gap-2 self-end rounded-full bg-paper/95 px-4 py-2.5 text-[13px] font-medium text-ink shadow-xl lg:flex"
          >
            <BadgeCheck className="h-4 w-4" /> Sample · AC service confirmed
          </motion.div>
        </div>

        {/* bottom bar: meta + film controls */}
        <div className="mt-10 flex items-end justify-between border-t border-cream/20 pt-4">
          <Meta k="2026" v="Ahmedabad’s home services app" delay={1} play={play} />
          <motion.div initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : undefined} transition={{ delay: 1.2 }} className="flex items-center gap-3">
            <span className="hidden items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-cream/65 sm:flex">
              <span className={`h-1.5 w-1.5 rounded-full ${playing ? "animate-pulse bg-cream" : "bg-cream/40"}`} />
              HomeCrew · Film
            </span>
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause film" : "Play film"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 bg-ink/30 backdrop-blur transition-colors hover:bg-cream hover:text-ink"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
            </button>
            <button
              type="button"
              onClick={toggleSound}
              aria-label={muted ? "Turn sound on" : "Mute"}
              aria-pressed={!muted}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/30 bg-ink/30 backdrop-blur transition-colors hover:bg-cream hover:text-ink"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
