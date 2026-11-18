"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Clock, FileCheck2, LogOut, ShieldAlert, ShieldCheck, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/atoms/logo";
import { EASE } from "@/components/motion/motion";
import { fmtDate } from "@/lib/format";
import { getService, type Professional } from "@/lib/mock-data";
import { PORTAL_HOME, PORTAL_LABEL, ROLE_LABEL, STATUS_LABEL, type Account, type Role } from "@/lib/rbac";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

function Frame({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <main className="grain flex min-h-screen flex-col bg-cream px-5 pb-10 pt-[calc(1.5rem+env(safe-area-inset-top))] text-ink sm:px-8">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <Logo />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/45">{eyebrow}</span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-12"
      >
        {children}
      </motion.div>
    </main>
  );
}

function Title({ kicker, title, sub }: { kicker: string; title: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/50">{kicker}</span>
      <h1 className="mt-4 text-[clamp(2.25rem,6vw,3.75rem)] font-black leading-[0.92] tracking-tighter">{title}</h1>
      {sub && <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-ink/65">{sub}</p>}
    </>
  );
}

/**
 * Shown instead of a portal when the visitor may not use it:
 * signed out, wrong role, access paused, or a professional still awaiting approval.
 */
export function AccessGate({ role, account }: { role: Role; account: Account | undefined }) {
  const pro = useApp((s) => s.pros.find((p) => p.id === account?.proId));
  if (!account) return <SignInRequired role={role} />;
  if (account.status === "SUSPENDED") return <Paused account={account} />;
  if (account.role !== role) return <WrongRole role={role} account={account} />;
  if (role === "professional" && account.status !== "ACTIVE") return <ApplicationStatus account={account} pro={pro} />;
  return null;
}

function SignInRequired({ role }: { role: Role }) {
  const router = useRouter();
  const pathname = usePathname();
  const accounts = useApp((s) => s.accounts);
  const signIn = useApp((s) => s.signIn);
  const list = accounts.filter((a) => a.role === role && a.status !== "SUSPENDED" && a.status !== "REJECTED").slice(0, 4);

  return (
    <Frame eyebrow="Sign in required">
      <Title
        kicker={ROLE_LABEL[role] === "Admin" ? "Operations" : ROLE_LABEL[role]}
        title={
          <>
            Sign in to the
            <br />
            <span className="text-ink/35">{PORTAL_LABEL[role]}.</span>
          </>
        }
        sub="Only signed-in accounts with the right role can open this area."
      />
      <div className="mt-8 overflow-hidden rounded-3xl border border-ink/15 bg-paper">
        <div className="border-b border-ink/10 px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/50">Demo accounts for this area</div>
        <ul className="divide-y divide-ink/10">
          {list.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-cream">{initials(a.name)}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14.5px] font-semibold">{a.name}</div>
                <div className={cn("text-[12.5px]", a.status === "ACTIVE" ? "text-ink/55" : "text-amber-700")}>{a.status === "ACTIVE" ? a.email : STATUS_LABEL[a.status]}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const r = signIn(a.id);
                  if (!r.ok) return toast.error(r.error);
                  toast.success(`Signed in as ${a.name}`);
                }}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-cream transition-transform active:scale-95"
              >
                Sign in <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => router.push(`/login?next=${encodeURIComponent(pathname)}`)} className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 px-5 text-[14.5px] font-semibold transition-colors hover:border-ink">
          <UserRound className="h-4 w-4" /> Use email or phone
        </button>
        {role !== "admin" && (
          <Link href={role === "professional" ? "/register?role=professional" : "/register"} className="link-underline pb-0.5 text-[14px] font-medium text-ink/70 hover:text-ink">
            {role === "professional" ? "New professional? Apply to join" : "New here? Create an account"}
          </Link>
        )}
      </div>
    </Frame>
  );
}

function WrongRole({ role, account }: { role: Role; account: Account }) {
  const router = useRouter();
  const signOut = useApp((s) => s.signOut);
  return (
    <Frame eyebrow="No access">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-cream">
        <ShieldAlert className="h-6 w-6" />
      </span>
      <div className="mt-6">
        <Title
          kicker={`Signed in as ${ROLE_LABEL[account.role].toLowerCase()}`}
          title={
            <>
              This area is for
              <br />
              <span className="text-ink/35">{ROLE_LABEL[role].toLowerCase()}s only.</span>
            </>
          }
          sub={
            <>
              You’re signed in as <strong className="font-semibold text-ink">{account.name}</strong>. Your role doesn’t include the {PORTAL_LABEL[role]}. An admin can change roles from Team &amp; access.
            </>
          }
        />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={() => router.push(PORTAL_HOME[account.role])} className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[14.5px] font-semibold text-cream transition-transform active:scale-95">
          Go to my {PORTAL_LABEL[account.role]} <ArrowRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => signOut()} className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 px-5 text-[14.5px] font-semibold transition-colors hover:border-ink">
          <LogOut className="h-4 w-4" /> Switch account
        </button>
      </div>
    </Frame>
  );
}

function Paused({ account }: { account: Account }) {
  const signOut = useApp((s) => s.signOut);
  return (
    <Frame eyebrow="Access paused">
      <Title
        kicker={account.name}
        title={
          <>
            Your access
            <br />
            <span className="text-ink/35">is paused.</span>
          </>
        }
        sub="An admin has paused this account. Bookings and payments already made are safe. Contact support if you think this is a mistake."
      />
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[14.5px] font-semibold text-cream">
          Contact support <ArrowUpRight className="h-4 w-4" />
        </Link>
        <button type="button" onClick={() => signOut()} className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 px-5 text-[14.5px] font-semibold hover:border-ink">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </Frame>
  );
}

/** Applicant's view: where their application stands, live. */
export function ApplicationStatus({ account, pro }: { account: Account; pro: Professional | undefined }) {
  const router = useRouter();
  const signIn = useApp((s) => s.signIn);
  const signOut = useApp((s) => s.signOut);
  const rejected = account.status === "REJECTED";
  const first = account.name.split(" ")[0];
  const docs = pro?.documents ?? [];
  const docsDone = docs.filter((d) => d.status === "VERIFIED").length;

  const steps = [
    { label: "Application submitted", detail: fmtDate(account.createdAt), state: "done" as const },
    { label: "Documents checked", detail: `${docsDone} of ${docs.length || 3} verified`, state: docsDone === docs.length && docs.length > 0 ? ("done" as const) : rejected ? ("fail" as const) : ("now" as const) },
    { label: "Approval by the HomeCrew team", detail: rejected ? "Not approved" : "In review", state: rejected ? ("fail" as const) : ("now" as const) },
    { label: "Account activated", detail: "You can take jobs", state: "todo" as const },
  ];

  return (
    <Frame eyebrow="Application status">
      <Title
        kicker={`Hi ${first}`}
        title={
          rejected ? (
            <>
              Application
              <br />
              <span className="text-ink/35">not approved.</span>
            </>
          ) : (
            <>
              You’re almost
              <br />
              <span className="text-ink/35">on the crew.</span>
            </>
          )
        }
        sub={
          rejected
            ? "The team couldn’t approve your application this time. You can apply again with updated documents."
            : "Your professional account opens as soon as the team approves your application. This page updates by itself."
        }
      />

      {rejected && account.reviewNote && (
        <div className="mt-6 rounded-2xl border border-ink/15 bg-paper p-4 text-[14px]">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/45">Reason from the team</div>
          <p className="mt-1.5 text-ink/80">{account.reviewNote}</p>
        </div>
      )}

      <ol className="mt-8 space-y-0 rounded-3xl border border-ink/15 bg-paper p-5 sm:p-6">
        {steps.map((s, i) => (
          <li key={s.label} className="relative flex gap-4 pb-5 last:pb-0">
            {i < steps.length - 1 && <span aria-hidden className="absolute left-3.75 top-8 h-[calc(100%-1.5rem)] w-px bg-ink/15" />}
            <span
              className={cn(
                "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                s.state === "done" && "bg-ink text-cream",
                s.state === "now" && "border-2 border-ink bg-cream",
                s.state === "fail" && "bg-rose-600 text-white",
                s.state === "todo" && "border border-ink/20 bg-cream text-ink/30",
              )}
            >
              {s.state === "done" && <Check className="h-4 w-4" />}
              {s.state === "fail" && <X className="h-4 w-4" />}
              {s.state === "now" && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink" />}
              {s.state === "todo" && <Clock className="h-3.5 w-3.5" />}
            </span>
            <div className="min-w-0 pt-1">
              <div className={cn("text-[15px] font-semibold", s.state === "todo" && "text-ink/45")}>{s.label}</div>
              <div className="text-[13px] text-ink/55">{s.detail}</div>
            </div>
          </li>
        ))}
      </ol>

      {pro && (
        <div className="mt-4 rounded-3xl border border-ink/15 bg-paper p-5 sm:p-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/45">You applied as</div>
          <div className="mt-1.5 text-[18px] font-bold tracking-[-0.02em]">
            {pro.trade} · {pro.years}+ years · {pro.area}
          </div>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {pro.skills.slice(0, 8).map((sl) => (
              <li key={sl} className="rounded-full border border-ink/15 px-3 py-1 text-[12.5px] text-ink/70">
                {getService(sl)?.title ?? sl}
              </li>
            ))}
            {pro.skills.length > 8 && <li className="px-2 py-1 text-[12.5px] text-ink/50">+{pro.skills.length - 8} more</li>}
          </ul>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {docs.map((d) => (
              <li key={d.name} className="flex items-center gap-2 text-[13px]">
                <FileCheck2 className={cn("h-4 w-4", d.status === "VERIFIED" ? "text-emerald-700" : d.status === "REJECTED" ? "text-rose-600" : "text-ink/40")} />
                <span className="text-ink/75">{d.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {rejected ? (
          <Link href="/register?role=professional" className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[14.5px] font-semibold text-cream">
            Apply again <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link href="/contact" className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 px-5 text-[14.5px] font-semibold hover:border-ink">
            Questions? Contact support
          </Link>
        )}
        <button type="button" onClick={() => signOut()} className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-ink/65 hover:text-ink">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {!rejected && (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/25 p-4">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/50">Demo shortcut</div>
          <p className="mt-1.5 text-[13.5px] text-ink/65">Play the admin: review this application in the operations console, then sign back in as {first}.</p>
          <button
            type="button"
            onClick={() => {
              signIn("a_admin");
              router.push("/admin/professionals");
            }}
            className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-cream"
          >
            <ShieldCheck className="h-4 w-4" /> Review as Ops Admin
          </button>
        </div>
      )}
    </Frame>
  );
}

/** One-time "you're approved" moment for a newly activated professional. */
export function ApprovalWelcome({ account, pro, onTour }: { account: Account; pro: Professional | undefined; onTour: () => void }) {
  const markApprovalSeen = useApp((s) => s.markApprovalSeen);
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(account.approvalSeen === false);
  useEffect(() => {
    if (open) {
      try {
        navigator.vibrate?.([12, 40, 12]);
      } catch {}
    }
  }, [open]);
  const close = (tour: boolean) => {
    setOpen(false);
    markApprovalSeen(account.id);
    if (tour) setTimeout(onTour, 450);
  };
  const first = account.name.split(" ")[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Application approved">
          <motion.div
            initial={reduce ? false : { y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md rounded-t-[30px] bg-cream p-7 pb-[calc(1.75rem+env(safe-area-inset-bottom))] text-ink shadow-2xl sm:rounded-[30px]"
          >
            <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden>
              <motion.circle cx="32" cy="32" r="29" fill="#282B4A" initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} style={{ transformOrigin: "32px 32px" }} />
              <motion.path d="M20 33 L28 41 L45 24" fill="none" stroke="#EEEBDA" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.25, ease: EASE }} />
            </svg>
            <div className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/50">Application approved{account.reviewedAt ? ` · ${fmtDate(account.reviewedAt)}` : ""}</div>
            <h2 className="mt-2 text-[34px] font-black leading-[0.95] tracking-tighter">You’re on the crew, {first}.</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/65">
              Your {pro?.trade.toLowerCase() ?? "professional"} profile is live. Customers in {pro?.area ?? "your area"} can now book you for {pro?.skills.length ?? 0} services.
            </p>
            <div className="mt-6 grid gap-2.5">
              <button type="button" onClick={() => close(true)} className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-cream transition-transform active:scale-[0.98]">
                Show me around <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => close(false)} className="flex h-12 items-center justify-center rounded-full border border-ink/15 text-[15px] font-medium">
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
