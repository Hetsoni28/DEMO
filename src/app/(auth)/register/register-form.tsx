"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, FileUp, HardHat, Home, X } from "lucide-react";
import { DemoNote, Field, OtpInput, PhoneInput, SubmitButton, TextInput } from "@/components/auth/fields";
import { EASE, LineReveal } from "@/components/motion/motion";
import { categories, SERVICE_AREA } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type AccountType = "customer" | "professional";
type Step = "type" | "details" | "verify" | "documents" | "done";

const stepsFor = (t: AccountType | null): Step[] => (t === "professional" ? ["type", "details", "verify", "documents", "done"] : ["type", "details", "verify", "done"]);
const stepLabel: Record<Step, string> = { type: "Account", details: "Details", verify: "Verify", documents: "Documents", done: "Done" };

const DOCS = [
  { key: "id", label: "Aadhaar / ID proof", required: true },
  { key: "trade", label: "Trade certificate", required: true },
  { key: "police", label: "Police verification", required: false },
] as const;

const slide = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
  transition: { duration: 0.45, ease: EASE },
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const setRole = useApp((s) => s.setRole);

  const [type, setType] = useState<AccountType | null>(params.get("role") === "professional" ? "professional" : null);
  const [step, setStep] = useState<Step>(params.get("role") === "professional" ? "details" : "type");
  const [form, setForm] = useState({ name: "", phone: "", email: "", zone: SERVICE_AREA.zones[0], years: "3–5 years", skills: [] as string[] });
  const [otp, setOtp] = useState("");
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const steps = stepsFor(type);
  const idx = steps.indexOf(step);
  const visibleSteps = steps.filter((s) => s !== "done");
  const progress = step === "done" ? 1 : idx / visibleSteps.length;
  const go = (s: Step) => {
    setErrors({});
    setStep(s);
  };
  const back = () => go(steps[Math.max(0, idx - 1)]);

  const submitDetails = async () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit mobile number";
    if (form.email && !z.email().safeParse(form.email).success) e.email = "Enter a valid email or leave it empty";
    if (type === "professional" && form.skills.length === 0) e.skills = "Pick at least one skill";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    await wait(700);
    setLoading(false);
    setOtp("");
    setSeconds(30);
    go("verify");
    toast.message("Code sent (demo) — enter any 6 digits");
  };

  const submitOtp = async () => {
    if (otp.length < 6) return setErrors({ otp: "Enter all 6 digits" });
    setLoading(true);
    await wait(700);
    setLoading(false);
    if (type === "customer") {
      setRole("customer");
      go("done");
    } else go("documents");
  };

  const submitDocs = async () => {
    const missing = DOCS.filter((d) => d.required && !docs[d.key]);
    if (missing.length) return setErrors({ docs: `Upload: ${missing.map((m) => m.label).join(", ")}` });
    setLoading(true);
    await wait(900);
    setLoading(false);
    go("done");
  };

  const first = form.name.trim().split(" ")[0];

  return (
    <div>
      {/* Progress */}
      {step !== "done" && (
        <div className="mb-10">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">
            <span>
              Step {idx + 1} of {visibleSteps.length} · <span className="text-ink">{stepLabel[step]}</span>
            </span>
            {idx > 0 && (
              <button type="button" onClick={back} className="inline-flex items-center gap-1 normal-case tracking-normal text-[13px] font-medium text-ink/60 hover:text-ink">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
          </div>
          <div className="mt-3 flex gap-1.5">
            {visibleSteps.map((s, i) => (
              <span key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                <motion.span className="block h-full bg-ink" initial={false} animate={{ width: i <= idx ? "100%" : "0%" }} transition={{ duration: 0.6, ease: EASE }} />
              </span>
            ))}
          </div>
          <span className="sr-only">{Math.round(progress * 100)}% complete</span>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {/* ── Step: account type ── */}
        {step === "type" && (
          <motion.div key="type" {...slide}>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50">Create account</span>
            <h1 className="mt-3 text-[clamp(2.5rem,6vw,3.5rem)] font-black leading-[0.9] tracking-[-0.05em]">
              <LineReveal lines={["Let’s get", "you set up."]} />
            </h1>
            <p className="mt-3 text-[15px] text-ink/60">How will you use HomeCrew?</p>
            <div className="mt-8 grid gap-3" role="radiogroup" aria-label="Account type">
              {[
                { v: "customer" as const, icon: Home, title: "I need a service", text: "Book verified professionals, track visits and keep your home’s service record." },
                { v: "professional" as const, icon: HardHat, title: "I’m a professional", text: "Plumber, electrician, cleaner, AC tech and more — get pre-paid jobs in your area, on your own schedule. Verification required." },
              ].map((o) => {
                const on = type === o.v;
                return (
                  <button
                    key={o.v}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setType(o.v)}
                    className={cn(
                      "group flex items-start gap-4 rounded-[22px] border p-5 text-left transition-all duration-300",
                      on ? "border-ink bg-ink text-cream shadow-[0_24px_48px_-28px_rgba(40,43,74,0.7)]" : "border-ink/15 bg-paper hover:border-ink/40",
                    )}
                  >
                    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors", on ? "bg-cream text-ink" : "bg-cream text-ink")}>
                      <o.icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[17px] font-bold tracking-[-0.02em]">{o.title}</span>
                      <span className={cn("mt-1 block text-[13.5px] leading-relaxed", on ? "text-cream/70" : "text-ink/60")}>{o.text}</span>
                    </span>
                    <span className={cn("mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors", on ? "border-cream bg-cream text-ink" : "border-ink/25")}>
                      {on && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
            <SubmitButton type="button" className="mt-6" disabled={!type} onClick={() => go("details")}>
              Continue <ArrowRight className="h-4 w-4" />
            </SubmitButton>
            <p className="mt-6 text-center text-[14px] text-ink/60">
              Already have an account?{" "}
              <Link href="/login" className="link-underline pb-0.5 font-semibold text-ink">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}

        {/* ── Step: details ── */}
        {step === "details" && (
          <motion.form
            key="details"
            {...slide}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              submitDetails();
            }}
          >
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-black leading-[0.92] tracking-[-0.05em]">{type === "professional" ? "About your work." : "About you."}</h1>
            <p className="mt-3 text-[15px] text-ink/60">{type === "professional" ? "Customers see your name, skills and service area." : "We’ll use this to confirm bookings."}</p>
            <div className="mt-8 space-y-5">
              <Field label="Full name" htmlFor="name" error={errors.name}>
                <TextInput id="name" autoComplete="name" autoFocus value={form.name} invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Mobile number" htmlFor="phone" error={errors.phone} hint="Used for sign-in codes and booking updates.">
                <PhoneInput
                  id="phone"
                  placeholder="98XXX XXXXX"
                  value={form.phone}
                  invalid={!!errors.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email} aside={<span className="text-[12px] text-ink/40">Optional</span>}>
                <TextInput id="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <div className={cn("grid gap-5", type === "professional" && "sm:grid-cols-2")}>
                <Field label={type === "professional" ? "Main service area" : "Your area"} htmlFor="zone">
                  <select
                    id="zone"
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    className="h-[52px] w-full rounded-2xl border border-ink/15 bg-paper px-4 text-[15px] outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(40,43,74,0.08)]"
                  >
                    {SERVICE_AREA.zones.map((z) => (
                      <option key={z}>{z}</option>
                    ))}
                  </select>
                </Field>
                {type === "professional" && (
                  <Field label="Experience" htmlFor="years">
                    <select
                      id="years"
                      value={form.years}
                      onChange={(e) => setForm({ ...form, years: e.target.value })}
                      className="h-[52px] w-full rounded-2xl border border-ink/15 bg-paper px-4 text-[15px] outline-none focus:border-ink focus:shadow-[0_0_0_4px_rgba(40,43,74,0.08)]"
                    >
                      {["Under 2 years", "3–5 years", "6–10 years", "10+ years"].map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>
              {type === "professional" && (
                <Field label="Skills" error={errors.skills}>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Skills">
                    {categories.map((c) => {
                      const on = form.skills.includes(c.slug);
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setForm({ ...form, skills: on ? form.skills.filter((s) => s !== c.slug) : [...form.skills, c.slug] })}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition-colors",
                            on ? "border-ink bg-ink text-cream" : "border-ink/15 bg-paper text-ink/75 hover:border-ink/40",
                          )}
                        >
                          {on && <Check className="h-3.5 w-3.5" />}
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
              <SubmitButton loading={loading}>
                Send verification code <ArrowRight className="h-4 w-4" />
              </SubmitButton>
            </div>
          </motion.form>
        )}

        {/* ── Step: verify ── */}
        {step === "verify" && (
          <motion.form
            key="verify"
            {...slide}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              submitOtp();
            }}
          >
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-black leading-[0.92] tracking-[-0.05em]">Check your phone.</h1>
            <p className="mt-3 text-[15px] text-ink/60">
              We sent a 6-digit code to <span className="font-semibold text-ink">+91 {form.phone.slice(0, 5)} {form.phone.slice(5)}</span>.
            </p>
            <div className="mt-8 space-y-5">
              <Field
                label="Verification code"
                error={errors.otp}
                aside={
                  seconds > 0 ? (
                    <span className="font-mono text-[11.5px] tabular-nums text-ink/45">Resend in 0:{String(seconds).padStart(2, "0")}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSeconds(30);
                        toast.message("New code sent (demo)");
                      }}
                      className="link-underline pb-0.5 text-[12.5px] font-medium text-ink"
                    >
                      Resend code
                    </button>
                  )
                }
              >
                <OtpInput value={otp} onChange={setOtp} invalid={!!errors.otp} autoFocus />
              </Field>
              <SubmitButton loading={loading} disabled={otp.length < 6}>
                {type === "professional" ? "Verify & continue" : "Verify & create account"}
              </SubmitButton>
              <DemoNote>Demo: any 6 digits verify. No SMS is sent.</DemoNote>
            </div>
          </motion.form>
        )}

        {/* ── Step: documents (professionals) ── */}
        {step === "documents" && (
          <motion.form
            key="documents"
            {...slide}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              submitDocs();
            }}
          >
            <h1 className="text-[clamp(2.25rem,5vw,3rem)] font-black leading-[0.92] tracking-[-0.05em]">Verification.</h1>
            <p className="mt-3 text-[15px] text-ink/60">Our team reviews these before your profile goes live. Files are private to you and our admins.</p>
            <ul className="mt-8 space-y-3">
              {DOCS.map((d) => {
                const file = docs[d.key];
                return (
                  <li key={d.key}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-4 rounded-[20px] border p-4 transition-colors",
                        file ? "border-ink bg-ink text-cream" : "border-dashed border-ink/25 bg-paper hover:border-ink/50",
                      )}
                    >
                      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", file ? "bg-cream text-ink" : "bg-cream text-ink")}>
                        {file ? <Check className="h-5 w-5" /> : <FileUp className="h-5 w-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold">
                          {d.label} {!d.required && <span className={cn("font-normal", file ? "text-cream/60" : "text-ink/45")}>· optional</span>}
                        </span>
                        <span className={cn("block truncate text-[12.5px]", file ? "text-cream/65" : "text-ink/50")}>{file ?? "PDF, JPG or PNG · up to 5 MB"}</span>
                      </span>
                      {file ? (
                        <button
                          type="button"
                          aria-label={`Remove ${d.label}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setDocs((prev) => {
                              const next = { ...prev };
                              delete next[d.key];
                              return next;
                            });
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-cream/70 hover:bg-cream/10 hover:text-cream"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[12.5px] font-semibold">Upload</span>
                      )}
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setDocs((prev) => ({ ...prev, [d.key]: f.name }));
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
            {errors.docs && (
              <p role="alert" className="mt-3 text-[12.5px] font-medium text-[#B42318]">
                {errors.docs}
              </p>
            )}
            <button
              type="button"
              onClick={() => setDocs({ id: "aadhaar-sample.pdf", trade: "trade-certificate-sample.pdf" })}
              className="link-underline mt-4 pb-0.5 text-[12.5px] font-medium text-ink/60 hover:text-ink"
            >
              Use sample files (demo)
            </button>
            <SubmitButton loading={loading} className="mt-6">
              Submit application
            </SubmitButton>
          </motion.form>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <motion.div key="done" {...slide} className="text-center">
            <svg viewBox="0 0 96 96" className="mx-auto h-24 w-24" aria-hidden>
              <motion.circle cx="48" cy="48" r="44" fill="none" stroke="#282B4A" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: EASE }} />
              <motion.path
                d="M30 49 L43 62 L67 36"
                fill="none"
                stroke="#282B4A"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
              />
            </svg>
            <h1 className="mt-8 text-[clamp(2.25rem,5vw,3rem)] font-black leading-[0.92] tracking-[-0.05em]">
              <LineReveal lines={type === "professional" ? ["Application", "received."] : [`Welcome${first ? `, ${first}` : ""}.`]} delay={0.4} />
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ink/60">
              {type === "professional"
                ? "Our team will review your documents. You’ll get a message as soon as your profile is verified and active."
                : "Your account is ready. Book a verified professional whenever you need one."}
            </p>
            <div className="mt-8 grid gap-3">
              {type === "professional" ? (
                <>
                  <SubmitButton type="button" onClick={() => router.push("/professional/dashboard")}>
                    Preview the professional app <ArrowUpRight className="h-4 w-4" />
                  </SubmitButton>
                  <Link href="/" className="flex h-[52px] items-center justify-center rounded-full border border-ink/15 text-[14.5px] font-medium hover:border-ink">
                    Back to home
                  </Link>
                </>
              ) : (
                <>
                  <SubmitButton type="button" onClick={() => router.push("/services")}>
                    Book a service <ArrowRight className="h-4 w-4" />
                  </SubmitButton>
                  <Link href="/customer/dashboard" className="flex h-[52px] items-center justify-center rounded-full border border-ink/15 text-[14.5px] font-medium hover:border-ink">
                    Go to my dashboard
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
