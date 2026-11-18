"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Mail, Smartphone } from "lucide-react";
import { DemoNote, Field, OtpInput, PasswordInput, PhoneInput, SubmitButton, TextInput } from "@/components/auth/fields";
import { EASE, LineReveal } from "@/components/motion/motion";
import { PORTAL_HOME, ROLE_LABEL, STATUS_LABEL, type Account } from "@/lib/rbac";
import { useApp } from "@/lib/store";

/** Demo credentials shared by every sample account. Not real people. */
const DEMO_PASSWORD = "demo1234";
const DEMO_OTP = "123456";
/** Sample accounts shown for one-tap sign-in, in this order. */
const DEMO_IDS = ["c1", "a_p1", "a_p4", "a_admin"];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

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
  const accounts = useApp((s) => s.accounts);
  const signInAccount = useApp((s) => s.signIn);
  const demoAccounts = DEMO_IDS.map((id) => accounts.find((a) => a.id === id)).filter((a): a is Account => !!a);
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"enter" | "verify">("enter");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("aarav@example.com");
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

  /** Sign in as a real account. Its role decides which portal opens (RBAC). */
  const signIn = async (account: Account | undefined) => {
    if (!account) {
      setErrors({ form: "No HomeCrew account uses those details. Check them, or create an account." });
      return;
    }
    setLoading(true);
    await wait(600);
    const r = signInAccount(account.id);
    if (!r.ok) {
      setLoading(false);
      setErrors({ form: r.error });
      return;
    }
    const first = account.name.split(" ")[0];
    if (account.status === "PENDING") toast.message(`Hi ${first}, your application is still in review`);
    else if (account.status === "REJECTED") toast.message(`Hi ${first}, see the update on your application`);
    else toast.success(`Welcome back, ${first}`, { description: `Signed in as ${ROLE_LABEL[account.role].toLowerCase()}` });
    // Return to the page that asked for sign-in, if it belongs to this account's portal.
    const next = new URLSearchParams(window.location.search).get("next");
    const home = PORTAL_HOME[account.role];
    router.push(next && next.startsWith(home.split("/").slice(0, 2).join("/")) ? next : home);
  };

  /** Fill the email form with a demo account (user can still press Sign in). */
  const fillDemo = (a: Account) => {
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
    toast.message(`Code sent (demo): use ${DEMO_OTP}`);
  };

  const verify = async () => {
    if (otp.length < 6) return setErrors({ otp: "Enter all 6 digits" });
    if (otp !== DEMO_OTP) return setErrors({ otp: `That code doesn’t match. In the demo it’s ${DEMO_OTP}.` });
    setErrors({});
    await signIn(accounts.find((a) => a.phone.replace(/\D/g, "").endsWith(phone)));
  };

  const emailLogin = async () => {
    const e: Record<string, string> = {};
    if (!emailSchema.safeParse(email).success) e.email = "Enter a valid email address";
    if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    if (Object.keys(e).length) return;
    const account = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (account && password !== DEMO_PASSWORD) return setErrors({ password: "Wrong password for this account." });
    await signIn(account);
  };

  const maskedPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

  return (
    <div>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50">Sign in</span>
      <h1 className="mt-3 text-[clamp(2.5rem,6vw,3.5rem)] font-black leading-[0.9] tracking-tighter text-ink">
        <LineReveal lines={["Welcome back."]} />
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink/60">Your account opens the right app for your role: bookings, jobs or operations.</p>

      <div className="mt-8 space-y-5">
        <AnimatePresence>
          {errors.form && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13.5px] text-rose-700"
            >
              {errors.form}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="relative min-h-75">
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
          className="flex h-13 w-full items-center justify-center gap-2 rounded-full border border-ink/15 text-[14.5px] font-medium text-ink transition-colors hover:border-ink hover:bg-ink/3"
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
        <section aria-labelledby="demo-accounts" className="overflow-hidden rounded-3xl border border-ink/15 bg-paper">
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
              <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-cream">{initialsOf(a.name)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                    {a.name}
                    <span className="rounded-full border border-ink/15 px-2 py-px text-[10.5px] font-medium text-ink/60">{ROLE_LABEL[a.role]}</span>
                    {a.status !== "ACTIVE" && <span className="rounded-full bg-amber-50 px-2 py-px text-[10.5px] font-medium text-amber-800 ring-1 ring-amber-200">{STATUS_LABEL[a.status]}</span>}
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
                    onClick={() => signIn(a)}
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-ink px-3.5 text-[12.5px] font-semibold text-cream transition-transform active:scale-95 disabled:opacity-60"
                  >
                    Sign in <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <DemoNote>Demo build: these accounts are samples. Vikram has applied as an electrician and is waiting for an admin to approve him. Nothing is sent or stored on a server.</DemoNote>

        <p className="pt-2 text-center text-[14px] text-ink/60">
          New to HomeCrew?{" "}
          <Link href="/register" className="link-underline pb-0.5 font-semibold text-ink">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
