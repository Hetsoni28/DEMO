"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowRight, ArrowUpRight, Briefcase, CalendarCheck, HardHat, ImagePlus, MapPin, Paperclip, ReceiptText, X, Zap } from "lucide-react";
import { z } from "zod";
import { Field, PhoneInput, SubmitButton, TextInput } from "@/components/auth/fields";
import { EASE, LineReveal, Reveal } from "@/components/motion/motion";
import { SERVICE_AREA } from "@/lib/mock-data";
import { hourLabel, istNow, SUPPORT_HOURS } from "@/lib/support";
import { cn } from "@/lib/utils";

type Topic = "booking" | "refund" | "partners" | "business" | "other";

const channels: { topic: Topic; icon: typeof CalendarCheck; title: string; text: string; sla: string }[] = [
  { topic: "booking", icon: CalendarCheck, title: "Booking help", text: "Change a time, reach your professional or report a problem with a visit.", sla: "Reply · ~2 h" },
  { topic: "refund", icon: ReceiptText, title: "Payments & refunds", text: "Questions about a charge, an invoice or a refund in progress.", sla: "Reply · same day" },
  { topic: "partners", icon: HardHat, title: "For professionals", text: "Joining PipePilot, verification status or payouts.", sla: "Reply · 1 day" },
  { topic: "business", icon: Briefcase, title: "Business & press", text: "Societies, builders, property managers and media.", sla: "Reply · 2 days" },
];

const topics: { value: Topic; label: string }[] = [
  { value: "booking", label: "Booking" },
  { value: "refund", label: "Payment / refund" },
  { value: "partners", label: "Professional partner" },
  { value: "business", label: "Business" },
  { value: "other", label: "Something else" },
];

const MAX = 800;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ───────────── Support hours (today highlighted, computed after mount) ───────────── */
function Hours() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setToday(istNow().day), 0);
    return () => clearTimeout(t);
  }, []);
  const order = [1, 2, 3, 4, 5, 6, 0]; // Mon → Sun
  return (
    <ul className="space-y-1.5 font-mono text-[12px]">
      {order.map((d) => {
        const h = SUPPORT_HOURS[d];
        const isToday = d === today;
        return (
          <li key={h.day} className={cn("flex justify-between rounded-lg px-2.5 py-1.5 transition-colors", isToday ? "bg-cream text-ink" : "text-cream/65")}>
            <span>
              {h.day.slice(0, 3)}
              {isToday && <span className="ml-2 text-[10px] uppercase tracking-[0.12em] text-ink/50">Today</span>}
            </span>
            <span>{h.open === null ? "Closed" : `${hourLabel(h.open)} – ${hourLabel(h.close!)}`}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* ───────────── Main experience ───────────── */
export function ContactExperience() {
  const lenis = useLenis();
  const formRef = useRef<HTMLDivElement>(null);
  const [topic, setTopic] = useState<Topic>("booking");
  const [form, setForm] = useState({ name: "", replyVia: "email" as "email" | "whatsapp", email: "", phone: "", reference: "", message: "" });
  const [file, setFile] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const needsRef = topic === "booking" || topic === "refund";

  const pickChannel = (t: Topic) => {
    setTopic(t);
    setTicket(null);
    const el = formRef.current;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -130, duration: 1.2 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Tell us your name";
    if (form.replyVia === "email" && !z.email().safeParse(form.email).success) e.email = "Enter a valid email";
    if (form.replyVia === "whatsapp" && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit number";
    if (needsRef && form.reference && !/^PP-\d{3,6}$/i.test(form.reference.trim())) e.reference = "Booking IDs look like PP-1042";
    if (form.message.trim().length < 15) e.message = "A little more detail helps us reply faster (15+ characters)";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    await wait(900);
    setLoading(false);
    const n = String(Math.floor(1000 + Math.random() * 9000));
    setTicket(`SUP-${n}`);
  };

  const reset = () => {
    setTicket(null);
    setForm({ name: "", replyVia: "email", email: "", phone: "", reference: "", message: "" });
    setFile(null);
    setErrors({});
  };

  return (
    <>
      {/* Channels */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">
          <span>(01)</span>
          <span className="text-ink">How can we help?</span>
          <span className="h-px flex-1 bg-ink/15" />
          <span>Pick a topic</span>
        </div>
        <ul className="mt-10 grid grid-cols-1 border-l border-t border-ink/20 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c, i) => (
            <Reveal as="li" key={c.topic} delay={i * 0.06} className="border-b border-r border-ink/20">
              <button type="button" onClick={() => pickChannel(c.topic)} className="group relative flex h-full w-full flex-col overflow-hidden p-7 text-left">
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
                <span className="relative flex items-center justify-between">
                  <span className="font-mono text-xs text-ink/45 transition-colors group-hover:text-cream/50">({String(i + 1).padStart(2, "0")})</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-cream group-hover:bg-cream group-hover:text-ink">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </span>
                <c.icon className="relative mt-10 h-6 w-6 transition-colors group-hover:text-cream" />
                <span className="relative mt-4 text-[22px] font-bold tracking-[-0.03em] transition-colors group-hover:text-cream">{c.title}</span>
                <span className="relative mt-2 text-[14px] leading-relaxed text-ink/60 transition-colors group-hover:text-cream/70">{c.text}</span>
                <span className="relative mt-6 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/50 transition-colors group-hover:text-cream/60">{c.sla}</span>
              </button>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Form + side panel */}
      <section className="grain border-y border-ink/15">
        <div className="mx-auto grid grid-cols-1 max-w-7xl gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14">
          <div ref={formRef} className="scroll-mt-32">
            <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">
              <span>(02)</span>
              <span className="text-ink">Write to us</span>
              <span className="h-px flex-1 bg-ink/15" />
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {ticket ? (
                <motion.div key="done" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.5, ease: EASE }} className="mt-10">
                  <svg viewBox="0 0 96 96" className="h-20 w-20" aria-hidden>
                    <motion.circle cx="48" cy="48" r="44" fill="none" stroke="#282B4A" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: EASE }} />
                    <motion.path d="M30 49 L43 62 L67 36" fill="none" stroke="#282B4A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, ease: EASE, delay: 0.6 }} />
                  </svg>
                  <h2 className="mt-8 text-[clamp(2.5rem,5vw,4rem)] font-black leading-[0.9] tracking-[-0.05em]">
                    <LineReveal lines={["Message received.", <span key="b" className="text-ink/40">We’re on it.</span>]} delay={0.3} />
                  </h2>
                  <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-ink/15 bg-paper px-5 py-2.5 font-mono text-[13px]">
                    <span className="text-ink/50">TICKET :</span> <span className="font-semibold">{ticket}</span>
                  </div>
                  <ol className="stagger-fast mt-10 max-w-md space-y-5 border-l border-ink/20 pl-6">
                    {[
                      ["Received", "Your message is in our queue with the ticket above."],
                      ["Reviewed", "The right team picks it up — usually within a couple of hours."],
                      ["Reply", form.replyVia === "whatsapp" ? "We’ll message you on WhatsApp." : "We’ll reply to your email."],
                    ].map(([t, d], i) => (
                      <li key={t} className="relative">
                        <span className={cn("absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-cream", i === 0 ? "bg-ink" : "bg-ink/25")} />
                        <div className="text-[15px] font-semibold">{t}</div>
                        <div className="text-[14px] text-ink/60">{d}</div>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-8 text-[12.5px] text-ink/45">Demo build — no message was actually sent.</p>
                  <button type="button" onClick={reset} className="link-underline mt-4 pb-0.5 text-[14px] font-semibold">
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  noValidate
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="mt-10 space-y-6"
                >
                  <h2 className="text-[clamp(2.25rem,4.5vw,3.5rem)] font-black leading-[0.92] tracking-[-0.05em]">
                    <LineReveal onView lines={["Tell us what’s", <span key="b" className="text-ink/40">going on.</span>]} />
                  </h2>

                  <Field label="Topic">
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Topic">
                      {topics.map((t) => {
                        const on = topic === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => setTopic(t.value)}
                            className={cn("relative rounded-full border px-4 py-2 text-[13.5px] transition-colors", on ? "border-ink text-cream" : "border-ink/15 bg-paper text-ink/70 hover:border-ink/40")}
                          >
                            {on && <motion.span layoutId="contact-topic" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.45, ease: EASE }} />}
                            <span className="relative">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label="Your name" htmlFor="c-name" error={errors.name}>
                    <TextInput id="c-name" autoComplete="name" value={form.name} invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </Field>

                  <Field label="How should we reply?">
                    <div className="grid grid-cols-2 gap-2">
                      {(["email", "whatsapp"] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={form.replyVia === v}
                          onClick={() => setForm({ ...form, replyVia: v })}
                          className={cn(
                            "h-12 rounded-2xl border text-[14px] font-medium transition-colors",
                            form.replyVia === v ? "border-ink bg-ink text-cream" : "border-ink/15 bg-paper text-ink/70 hover:border-ink/40",
                          )}
                        >
                          {v === "email" ? "Email" : "WhatsApp"}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <AnimatePresence mode="wait" initial={false}>
                    {form.replyVia === "email" ? (
                      <motion.div key="em" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                        <Field label="Email" htmlFor="c-email" error={errors.email}>
                          <TextInput id="c-email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </Field>
                      </motion.div>
                    ) : (
                      <motion.div key="ph" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                        <Field label="WhatsApp number" htmlFor="c-phone" error={errors.phone}>
                          <PhoneInput id="c-phone" placeholder="98XXX XXXXX" value={form.phone} invalid={!!errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence initial={false}>
                    {needsRef && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                        <Field label="Booking ID" htmlFor="c-ref" error={errors.reference} aside={<span className="text-[12px] text-ink/40">Optional</span>} hint="Find it on your booking page, e.g. PP-1042.">
                          <TextInput id="c-ref" placeholder="PP-1042" value={form.reference} invalid={!!errors.reference} onChange={(e) => setForm({ ...form, reference: e.target.value.toUpperCase() })} className="font-mono uppercase" />
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Field label="Message" htmlFor="c-msg" error={errors.message} aside={<span className={cn("font-mono text-[11.5px] tabular-nums", form.message.length > MAX - 50 ? "text-[#B42318]" : "text-ink/40")}>{form.message.length}/{MAX}</span>}>
                    <textarea
                      id="c-msg"
                      rows={6}
                      maxLength={MAX}
                      value={form.message}
                      aria-invalid={!!errors.message || undefined}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={topic === "booking" ? "What happened, and when? The more detail, the faster we can help." : "How can we help?"}
                      className={cn(
                        "w-full resize-none rounded-2xl border bg-paper px-4 py-3.5 text-[15px] leading-relaxed outline-none transition-[border-color,box-shadow] placeholder:text-ink/35 focus:border-ink focus:shadow-[0_0_0_4px_rgba(40,43,74,0.08)]",
                        errors.message ? "border-[#B42318]/60" : "border-ink/15",
                      )}
                    />
                  </Field>

                  <div>
                    {file ? (
                      <div className="flex items-center gap-3 rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-[13.5px]">
                        <Paperclip className="h-4 w-4 text-ink/50" />
                        <span className="min-w-0 flex-1 truncate">{file}</span>
                        <button type="button" onClick={() => setFile(null)} aria-label="Remove attachment" className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-ink/25 px-4 py-3.5 text-[13.5px] text-ink/60 transition-colors hover:border-ink/50 hover:text-ink">
                        <ImagePlus className="h-4 w-4" />
                        Add a photo of the issue <span className="text-ink/40">· optional</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setFile(f.name);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>

                  <SubmitButton loading={loading}>
                    Send message <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </SubmitButton>
                  <p className="text-center text-[12px] text-ink/45">Demo build — messages aren’t sent anywhere yet.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Side panel */}
          <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            <Reveal className="relative overflow-hidden rounded-[28px] bg-ink p-7 text-cream">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55">
                <Zap className="h-3.5 w-3.5" /> Urgent problem?
              </div>
              <p className="mt-4 text-[26px] font-bold leading-[1.05] tracking-[-0.03em]">Don’t wait for a reply — book the earliest slot.</p>
              <p className="mt-3 text-[14px] leading-relaxed text-cream/65">Leak, sparking socket or AC down? Make it safe first — turn off the water main or the MCB — then book. Most areas have same-day slots.</p>
              <Link href="/services" className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-cream pl-5 pr-1.5 text-[14px] font-semibold text-ink">
                Book now
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-cream transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </Reveal>

            <Reveal delay={0.08} className="rounded-[28px] bg-ink-soft p-7 text-cream">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-cream/55">Support hours</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream/40">IST · sample</span>
              </div>
              <div className="mt-4">
                <Hours />
              </div>
            </Reveal>

            <Reveal delay={0.16} className="rounded-[28px] border border-ink/15 bg-paper p-7">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/55">
                <MapPin className="h-3.5 w-3.5" /> Where we work
              </div>
              <p className="mt-3 text-[15px] font-semibold">{SERVICE_AREA.city}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {SERVICE_AREA.zones.map((z) => (
                  <li key={z} className="rounded-full border border-ink/15 px-3 py-1 text-[12.5px] text-ink/70">
                    {z}
                  </li>
                ))}
              </ul>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* Before you write */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">
          <span>(03)</span>
          <span className="text-ink">Before you write</span>
          <span className="h-px flex-1 bg-ink/15" />
        </div>
        <ul className="mt-10 border-t border-ink/20">
          {[
            { label: "Track or change a booking", note: "Your booking page has live status, your professional and your service QR.", href: "/customer/bookings" },
            { label: "Cancellation & refunds", note: "Free cancellation up to 2 hours before the visit.", href: "/legal/cancellation" },
            { label: "How PipePilot works", note: "Real slots, payment verification and QR-checked visits.", href: "/#how-it-works" },
          ].map((l, i) => (
            <Reveal as="li" key={l.href} delay={i * 0.05} y={14}>
              <Link href={l.href} className="group relative block overflow-hidden border-b border-ink/20">
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100" />
                <span className="relative grid grid-cols-[1fr_auto] items-center gap-6 py-7 transition-colors duration-500 group-hover:text-cream md:grid-cols-[1.1fr_1fr_auto]">
                  <span className="text-[clamp(1.4rem,3vw,2.25rem)] font-bold tracking-[-0.035em] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3">{l.label}</span>
                  <span className="hidden text-[14px] text-ink/60 group-hover:text-cream/70 md:block">{l.note}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 transition-all duration-500 group-hover:rotate-45 group-hover:border-cream group-hover:bg-cream group-hover:text-ink">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
