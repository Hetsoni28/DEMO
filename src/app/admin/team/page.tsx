"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Minus, PauseCircle, PlayCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { ReadyGate } from "@/components/molecules/ready-gate";
import { Panel } from "@/components/dashboard/kit";
import { EASE } from "@/components/motion/motion";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDate } from "@/lib/format";
import { PERMISSIONS, ROLE_LABEL, STATUS_LABEL, type Account, type AccountStatus, type Role } from "@/lib/rbac";
import { useAccount, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const ROLES: Role[] = ["customer", "professional", "admin"];
const FILTERS = [
  { key: "all", label: "Everyone" },
  { key: "review", label: "Needs review" },
  { key: "customer", label: "Customers" },
  { key: "professional", label: "Professionals" },
  { key: "admin", label: "Admins" },
  { key: "paused", label: "Paused" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

const statusTone: Record<AccountStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
  SUSPENDED: "bg-ink/6 text-ink/70 ring-ink/15",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

function StatusBadge({ status }: { status: AccountStatus }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium ring-1", statusTone[status])}>{STATUS_LABEL[status]}</span>;
}

function RoleSelect({ account, me }: { account: Account; me: boolean }) {
  const setAccountRole = useApp((s) => s.setAccountRole);
  return (
    <select
      aria-label={`Role for ${account.name}`}
      value={account.role}
      onChange={(e) => {
        const next = e.target.value as Role;
        const r = setAccountRole(account.id, next);
        if (!r.ok) return toast.error(r.error);
        toast.success(`${account.name} is now ${ROLE_LABEL[next].toLowerCase() === "admin" ? "an admin" : `a ${ROLE_LABEL[next].toLowerCase()}`}`, {
          description: me ? "Your own access changed. You may lose access to this console." : "They’ll see their new portal next time they sign in.",
        });
      }}
      className="h-9 w-36 rounded-full border border-ink/15 bg-paper pl-3 pr-8 text-[13px] font-medium outline-none transition focus:border-ink/40"
    >
      {ROLES.map((r) => (
        <option key={r} value={r} disabled={r === "professional" && !account.proId}>
          {ROLE_LABEL[r]}
          {r === "professional" && !account.proId ? " · apply first" : ""}
        </option>
      ))}
    </select>
  );
}

function AccessAction({ account }: { account: Account }) {
  const setAccountStatus = useApp((s) => s.setAccountStatus);
  if (account.status === "PENDING" || account.status === "REJECTED")
    return (
      <Link href="/admin/professionals" className="inline-flex h-9 items-center gap-1 rounded-full bg-ink px-3.5 text-[12.5px] font-semibold text-cream">
        Review <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    );
  const paused = account.status === "SUSPENDED";
  return (
    <button
      type="button"
      onClick={() => {
        const r = setAccountStatus(account.id, paused ? "ACTIVE" : "SUSPENDED");
        if (!r.ok) return toast.error(r.error);
        toast.success(paused ? `${account.name} can sign in again` : `${account.name}’s access is paused`);
      }}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors",
        paused ? "border-ink bg-ink text-cream" : "border-ink/15 text-ink/75 hover:border-ink/40 hover:text-ink",
      )}
    >
      {paused ? <PlayCircle className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}
      {paused ? "Restore" : "Pause"}
    </button>
  );
}

function TeamPage() {
  const accounts = useApp((s) => s.accounts);
  const pros = useApp((s) => s.pros);
  const me = useAccount();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(
    () => ({
      customer: accounts.filter((a) => a.role === "customer").length,
      professional: accounts.filter((a) => a.role === "professional" && a.status === "ACTIVE").length,
      review: accounts.filter((a) => a.status === "PENDING").length,
      admin: accounts.filter((a) => a.role === "admin").length,
      paused: accounts.filter((a) => a.status === "SUSPENDED").length,
    }),
    [accounts],
  );

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return accounts
      .filter((a) => {
        if (filter === "review") return a.status === "PENDING";
        if (filter === "paused") return a.status === "SUSPENDED";
        if (filter !== "all") return a.role === filter;
        return true;
      })
      .filter((a) => !term || `${a.name} ${a.email} ${a.phone}`.toLowerCase().includes(term))
      .sort((a, b) => (a.status === "PENDING" ? -1 : 0) - (b.status === "PENDING" ? -1 : 0) || a.name.localeCompare(b.name));
  }, [accounts, filter, q]);

  const tradeOf = (a: Account) => pros.find((p) => p.id === a.proId)?.trade;

  return (
    <>
      <PageTitle title="Team & access" description="Everyone who can sign in, the role that decides what they can open, and who is waiting for approval." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { k: "Customers", v: counts.customer },
          { k: "Active professionals", v: counts.professional },
          { k: "Waiting for review", v: counts.review, strong: counts.review > 0 },
          { k: "Admins", v: counts.admin },
        ].map((c) => (
          <div key={c.k} className={cn("rounded-3xl border p-5", c.strong ? "border-ink bg-ink text-cream" : "border-ink/10 bg-paper")}>
            <div className={cn("font-mono text-[10.5px] uppercase tracking-[0.16em]", c.strong ? "text-cream/55" : "text-ink/45")}>{c.k}</div>
            <div className="mt-2 text-[34px] font-black leading-none tracking-tighter">{c.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0" role="tablist" aria-label="Filter people">
          {FILTERS.map((f) => {
            const on = filter === f.key;
            const n = f.key === "review" ? counts.review : f.key === "paused" ? counts.paused : null;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(f.key)}
                className={cn("relative shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] transition-colors", on ? "border-ink text-cream" : "border-ink/15 text-ink/70 hover:border-ink/40")}
              >
                {on && <motion.span layoutId="team-filter" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.4, ease: EASE }} />}
                <span className="relative">
                  {f.label}
                  {n ? <span className={cn("ml-1.5 rounded-full px-1.5 text-[11px]", on ? "bg-cream/20" : "bg-ink/8")}>{n}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
        <label className="relative w-full lg:max-w-xs">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone" aria-label="Search people" className="h-11 w-full rounded-full border border-ink/15 bg-paper pl-10 pr-4 text-sm outline-none transition focus:border-ink/40" />
        </label>
      </div>

      <Panel className="mt-4" bodyClassName="p-2 sm:p-3">
        {list.length === 0 ? (
          <p className="px-4 py-10 text-center text-[14px] text-ink/55">Nobody matches this filter.</p>
        ) : (
          <ul className="divide-y divide-ink/8">
            <AnimatePresence initial={false}>
              {list.map((a) => {
                const isMe = a.id === me?.id;
                return (
                  <motion.li key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3 px-3 py-3.5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold", a.role === "admin" ? "bg-ink text-cream" : "bg-ink/8 text-ink")}>{initials(a.name)}</span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[14.5px] font-semibold">{a.name}</span>
                          {isMe && <span className="rounded-full border border-ink/20 px-2 py-px font-mono text-[10px] uppercase tracking-[0.12em] text-ink/60">You</span>}
                        </div>
                        <div className="truncate text-[12.5px] text-ink/55">
                          {a.email}
                          {tradeOf(a) ? ` · ${tradeOf(a)}` : ""} · joined {fmtDate(a.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pl-13 sm:pl-0">
                      <StatusBadge status={a.status} />
                      <RoleSelect account={a} me={isMe} />
                      {!isMe && <AccessAction account={a} />}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </Panel>

      <Panel className="mt-6" eyebrow="Role-based access" title="What each role can do" bodyClassName="px-2 pb-3 pt-2 sm:px-3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-left text-[13.5px]">
            <thead>
              <tr className="text-ink/50">
                <th className="px-3 py-2 font-medium">Permission</th>
                {ROLES.map((r) => (
                  <th key={r} className="w-28 px-3 py-2 text-center font-mono text-[10.5px] font-medium uppercase tracking-[0.14em]">
                    {ROLE_LABEL[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.key} className="border-t border-ink/8">
                  <td className="px-3 py-2.5">{p.label}</td>
                  {ROLES.map((r) => {
                    const yes = (p.roles as readonly Role[]).includes(r);
                    return (
                      <td key={r} className="px-3 py-2.5 text-center">
                        {yes ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-cream" aria-label="Allowed">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center text-ink/25" aria-label="Not allowed">
                            <Minus className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-3 pt-2 text-[12.5px] text-ink/50">Professionals only get their permissions after an admin approves their application. Paused accounts can’t sign in.</p>
      </Panel>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <TeamPage />
    </ReadyGate>
  );
}
