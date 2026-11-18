"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { statusLabel } from "@/components/molecules/status-badge";
import { EASE } from "@/components/motion/motion";
import { getService } from "@/lib/mock-data";
import { useApp, type Role, useMyProId, useMyCustomerId } from "@/lib/store";
import { cn } from "@/lib/utils";
import { relative, useMountedNow } from "./kit";

/** Bell + dropdown built from real booking history relevant to the signed-in role. */
export function Notifications({ role }: { role: Role }) {
  const myProId = useMyProId();
  const myCustomerId = useMyCustomerId();
  const bookings = useApp((s) => s.bookings);
  const accounts = useApp((s) => s.accounts);
  const accountId = useApp((s) => s.accountId);
  const now = useMountedNow(60_000);
  const [open, setOpen] = useState(false);
  const [seenAt, setSeenAt] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const items = useMemo(() => {
    const mine = bookings.filter((b) =>
      role === "customer" ? b.customerId === myCustomerId : role === "professional" ? b.professionalId === myProId : true,
    );
    const hrefFor = (id: string) => (role === "customer" ? `/customer/bookings/${id}` : role === "professional" ? `/professional/jobs/${id}` : "/admin/bookings");
    type Item = { id: string; at: string; code: string; status: string; note?: string; title: string; href: string; heading?: string };
    const fromBookings: Item[] = mine.flatMap((b) =>
      b.history.map((h) => ({ id: `${b.id}-${h.at}-${h.status}`, at: h.at, code: b.code, status: h.status, note: h.note, title: getService(b.serviceSlug)?.title ?? "Service", href: hrefFor(b.id) })),
    );
    // Account events (RBAC): approvals for the pro, new applications for admins.
    const me = accounts.find((a) => a.id === accountId);
    const fromAccounts: Item[] =
      role === "professional" && me?.reviewedAt && me.status === "ACTIVE"
        ? [{ id: "approved", at: me.reviewedAt, code: "", status: "", heading: "Application approved", note: "Your account is active. You can take jobs now.", title: "", href: "/professional/dashboard" }]
        : role === "admin"
          ? accounts
              .filter((a) => a.status === "PENDING")
              .map((a) => ({ id: `app-${a.id}`, at: a.createdAt, code: "", status: "", heading: "New professional application", note: `${a.name} is waiting for review`, title: "", href: "/admin/professionals" }))
          : [];
    return [...fromAccounts, ...fromBookings].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);
  }, [bookings, role, myCustomerId, myProId, accounts, accountId]);

  // Badge and relative times only appear once the browser clock is available.
  const unread = now === null ? 0 : items.filter((i) => new Date(i.at).getTime() > Math.max(seenAt, now - 3 * 86_400_000)).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unread ? `, ${unread} new` : ""}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          setSeenAt(Date.now());
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper text-ink transition-colors hover:border-ink/30"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9.5px] font-semibold text-cream">{unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute right-0 top-12 z-40 w-85 origin-top-right overflow-hidden rounded-[22px] border border-ink/10 bg-paper shadow-[0_30px_80px_-30px_rgba(40,43,74,0.55)]"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
              <span className="text-[14px] font-bold">Activity</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">Latest {items.length}</span>
            </div>
            <ul className="stagger-fast max-h-[60vh] overflow-y-auto py-1">
              {items.map((n) => (
                <li key={n.id}>
                  <Link href={n.href} onClick={() => setOpen(false)} className="flex gap-3 px-5 py-3 transition-colors hover:bg-ink/4">
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", now !== null && new Date(n.at).getTime() > now - 86_400_000 ? "bg-ink" : "bg-ink/20")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold">
                        {n.heading ?? `${n.code} · ${statusLabel(n.status as Parameters<typeof statusLabel>[0])}`}
                      </span>
                      <span className="block truncate text-[12.5px] text-ink/55">{n.note ?? n.title}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[10.5px] text-ink/40">{now === null ? "" : relative(new Date(n.at).getTime() - now)}</span>
                  </Link>
                </li>
              ))}
              {items.length === 0 && <li className="px-5 py-8 text-center text-[13px] text-ink/50">No activity yet.</li>}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
