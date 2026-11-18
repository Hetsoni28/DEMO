"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, HardHat, Mail, ShieldCheck, Smartphone, User } from "lucide-react";
import { DemoNote, Field, OtpInput, PasswordInput, PhoneInput, Segmented, SubmitButton, TextInput } from "@/components/auth/fields";
import { EASE, LineReveal } from "@/components/motion/motion";
import { useApp, type Role } from "@/lib/store";

const roles: { value: Role; label: string; icon: typeof User }[] = [
  { value: "customer", label: "Customer", icon: User },
  { value: "professional", label: "Professional", icon: HardHat },
  { value: "admin", label: "Admin", icon: ShieldCheck },
];
const destination: Record<Role, string> = { customer: "/customer/dashboard", professional: "/professional/dashboard", admin: "/admin/dashboard" };
const demoEmail: Record<Role, string> = { customer: "aarav@example.com", professional: "ramesh@pipepilot.example", admin: "ops@pipepilot.example" };

/** Demo accounts — shared credentials for clients and testers. Not real people. */
const DEMO_PASSWORD = "demo1234";
const DEMO_OTP = "123456";
const demoAccounts: { role: Role; name: string; initials: string; label: string; email: string; phone: string }[] = [
  { role: "customer", name: "Aarav Mehta", initials: "AM", label: "Customer", email: demoEmail.customer, phone: "9876543210" },
  { role: "professional", name: "Ramesh Patel", initials: "RP", label: "Professional", email: demoEmail.professional, phone: "9876543211" },
  { role: "admin", name: "Ops Admin", initials: "OA", label: "Admin", email: demoEmail.admin, phone: "9876543212" },
];

const phoneOk = (p: string) => /^[6-9]\d{9}$/.test(p);
const emailSchema = z.email();

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.4, ease: EASE },
};

export function LoginForm() {
  const router = useRouter();
  const setRole = useApp((s) => s.setRole);
  const [role, setR] = useState<Role>("customer");
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"enter" | "verify">("enter");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(demoEmail.customer);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const signIn = async (as: Role = role) => {
    setLoading(true);
    await wait(700);
    setRole(as);
    toast.success(`Signed in as ${roles.find((r) => r.value === as)!.label.toLowerCase()}`);
    router.push(destination[as]);
  };

  /** Fill the email form with a demo account (user can still press Sign in). */
  const fillDemo = (a: (typeof demoAccounts)[number]) => {
    setR(a.role);
    setMethod("email");
    setStep("enter");
    setErrors({});
    setEmail(a.email);
    setPassword(DEMO_PASSWORD);
  };

  const sendCode = async () => {
    if (!phoneOk(phone)) return setErrors({ phone: "Enter a valid 10-digit mobile number" });
    setErrors({});
    setLoading(true);
    await wait(700);
    setLoading(false);
    setOtp("");
    setSeconds(30);
    setStep("verify");
    toast.message("Code sent (demo) — enter any 6 digits");
  };

  const verify = async () => {
    if (otp.length < 6) return setErrors({ otp: "Enter all 6 digits" });
    setErrors({});
    await signIn();
  };

  const emailLogin = async () => {
    const e: Record<string, string> = {};
    if (!emailSchema.safeParse(email).success) e.email = "Enter a valid email address";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    if (Object.keys(e).length) return;
    await signIn();
  };

  const maskedPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

  return (
    <div>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50">Sign in</span>
      <h1 className="mt-3 text-[clamp(2.5rem,6vw,3.5rem)] font-black leading-[0.9] tracking-[-0.05em] text-ink">
        <LineReveal lines={["Welcome back."]} />
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/60">Manage bookings, jobs or operations — all from one account.</p>

      <div className="mt-8 space-y-5">
        <Segmented
          label="Account type"
          layoutId="login-role"
          options={roles}
          value={role}
          onChange={(r) => {
            setR(r);
            setEmail(demoEmail[r]);
          }}
        />

        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait" initial={false}>
            {method === "phone" && step === "enter" && (
              <motion.form
                key="phone"
                {...slide}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  sendCode();
                }}
                className="space-y-5"
              >
                <Field label="Mobile number" htmlFor="phone" error={errors.phone} hint="We’ll text you a 6-digit code.">
                  <PhoneInput
                    id="phone"
                    autoFocus
                    placeholder="98XXX XXXXX"
                    value={phone}
                    invalid={!!errors.phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </Field>
                <SubmitButton loading={loading}>
                  Send code <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </SubmitButton>
              </motion.form>
            )}

            {method === "phone" && step === "verify" && (
              <motion.form
                key="otp"
                {...slide}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  verify();
                }}
                className="space-y-5"
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep("enter");
                    setErrors({});
                  }}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink/60 hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" /> Change number
                </button>
                <Field
                  label={`Enter the code sent to ${maskedPhone}`}
                  error={errors.otp}
                  aside={
                    seconds > 0 ? (
                      <span className="font-mono text-[11.5px] tabular-nums text-ink/45">Resend in 0:{String(seconds).padStart(2, "0")}</span>
                    ) : (
                      <button type="button" onClick={sendCode} className="link-underline pb-0.5 text-[12.5px] font-medium text-ink">
                        Resend code
                      </button>
                    )
                  }
                >
                  <OtpInput value={otp} onChange={setOtp} invalid={!!errors.otp} autoFocus />
                </Field>
                <SubmitButton loading={loading} disabled={otp.length < 6}>
                  Verify &amp; sign in
                </SubmitButton>
              </motion.form>
            )}

            {method === "email" && (
              <motion.form
                key="email"
                {...slide}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  emailLogin();
                }}
                className="space-y-5"
              >
                <Field label="Email" htmlFor="email" error={errors.email}>
                  <TextInput id="email" type="email" autoComplete="email" value={email} invalid={!!errors.email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field
                  label="Password"
                  htmlFor="password"
                  error={errors.password}
                  aside={
                    <button type="button" onClick={() => toast.message("Password reset link sent (demo)")} className="link-underline pb-0.5 text-[12.5px] font-medium text-ink/70 hover:text-ink">
                      Forgot password?
                    </button>
                  }
                >
                  <PasswordInput id="password" autoComplete="current-password" placeholder="At least 6 characters" value={password} invalid={!!errors.password} onChange={(e) => setPassword(e.target.value)} />
                </Field>
                <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-ink/70">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-[#282B4A]" /> Keep me signed in on this device
                </label>
                <SubmitButton loading={loading}>
                  Sign in <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </SubmitButton>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.16em] text-ink/40">
          <span className="h-px flex-1 bg-ink/15" /> or <span className="h-px flex-1 bg-ink/15" />
        </div>

        <button
          type="button"
          onClick={() => {
            setMethod(method === "phone" ? "email" : "phone");
            setStep("enter");
            setErrors({});
          }}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-ink/15 text-[14.5px] font-medium text-ink transition-colors hover:border-ink hover:bg-ink/[0.03]"
        >
          {method === "phone" ? (
            <>
              <Mail className="h-4 w-4" /> Continue with email
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4" /> Continue with mobile number
            </>
          )}
        </button>

        {/* Demo accounts */}
        <section aria-labelledby="demo-accounts" className="overflow-hidden rounded-[24px] border border-ink/15 bg-paper">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
            <h2 id="demo-accounts" className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink">
              Demo accounts
            </h2>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink/45">
              Password {DEMO_PASSWORD} · OTP {DEMO_OTP}
            </span>
          </div>
          <ul className="divide-y divide-ink/10">
            {demoAccounts.map((a) => (
              <li key={a.role} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-cream">{a.initials}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                    {a.name}
                    <span className="rounded-full border border-ink/15 px-2 py-px text-[10.5px] font-medium text-ink/60">{a.label}</span>
                  </div>
                  <div className="truncate font-mono text-[11.5px] text-ink/55">
                    {a.email} · +91 {a.phone.slice(0, 5)} {a.phone.slice(5)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemo(a)}
                    className="hidden h-9 rounded-full px-3 text-[12.5px] font-medium text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink sm:inline-flex sm:items-center"
                  >
                    Fill form
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => signIn(a.role)}
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-ink px-3.5 text-[12.5px] font-semibold text-cream transition-transform active:scale-95 disabled:opacity-60"
                  >
                    Sign in <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <DemoNote>Demo build: these accounts are samples, and any valid-looking number with any 6-digit code also works. Nothing is sent or stored on a server.</DemoNote>

        <p className="pt-2 text-center text-[14px] text-ink/60">
          New to PipePilot?{" "}
          <Link href="/register" className="link-underline pb-0.5 font-semibold text-ink">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
