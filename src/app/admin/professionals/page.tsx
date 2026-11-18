"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { BadgeCheck, FileText } from "lucide-react";
import { Avatar, Badge, Button, Card } from "@/components/atoms/ui";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { getService, type Professional } from "@/lib/mock-data";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";

const QUICK_REASONS = ["Documents unclear, please re-upload", "Trade certificate doesn’t match the skills", "Outside our service area for now"];

/** One application: who, what trade, which services, documents, and the decision. */
function ApplicationCard({ pro }: { pro: Professional }) {
  const reviewApplication = useApp((s) => s.reviewApplication);
  const account = useApp((s) => s.accounts.find((a) => a.proId === pro.id));
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const docsReady = pro.documents.filter((d) => d.status === "VERIFIED").length;

  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }} className="rounded-[26px] border border-ink/10 bg-paper p-5">
      <div className="flex items-start gap-3">
        <Avatar name={pro.name} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-ink">{pro.name}</div>
          <div className="text-[12.5px] text-ink/55">
            {pro.trade} · {pro.years}+ yrs · {pro.area}
          </div>
          {account && <div className="truncate text-[12px] text-ink/45">{account.email} · applied {fmtDate(account.createdAt)}</div>}
        </div>
        <Badge tone="amber">New application</Badge>
      </div>

      <div className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/45">Wants to do</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {pro.skills.map((sl) => (
          <span key={sl} className="rounded-full border border-ink/12 px-2.5 py-0.5 text-[12px] text-ink/70">
            {getService(sl)?.title ?? sl}
          </span>
        ))}
      </div>

      <div className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/45">
        Documents · {docsReady}/{pro.documents.length} pre-checked
      </div>
      <ul className="mt-2 space-y-1.5">
        {pro.documents.map((d) => (
          <li key={d.name} className="flex items-center justify-between rounded-xl bg-cream px-3 py-2 text-[13px]">
            <span className="flex items-center gap-2 text-ink/75">
              <FileText className="h-4 w-4 text-ink/40" /> {d.name}
            </span>
            <button onClick={() => toast.message(`Opening ${d.name} via a signed URL (demo)`)} className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline">
              View
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence mode="wait" initial={false}>
        {rejecting ? (
          <motion.div key="reject" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <label htmlFor={`reason-${pro.id}`} className="mt-4 block text-[13px] font-semibold">
              Reason (the applicant sees this)
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((r) => (
                <button key={r} type="button" onClick={() => setReason(r)} className={cn("rounded-full border px-2.5 py-1 text-[12px]", reason === r ? "border-ink bg-ink text-cream" : "border-ink/15 text-ink/70")}>
                  {r}
                </button>
              ))}
            </div>
            <textarea id={`reason-${pro.id}`} value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="mt-2 w-full rounded-2xl border border-ink/15 bg-cream p-3 text-[13.5px] outline-none focus:border-ink/40" placeholder="Short and specific helps them re-apply" />
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="danger" disabled={!reason.trim()} onClick={() => (reviewApplication(pro.id, false, reason), toast(`${pro.name}’s application was not approved`, { description: "They’ll see your reason on their status page." }))}>
                Confirm rejection
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="decide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex gap-2">
            <Button size="sm" variant="teal" onClick={() => (reviewApplication(pro.id, true), toast.success(`${pro.name} approved and activated`, { description: "They’ll be welcomed the next time they open the app." }))}>
              <BadgeCheck className="h-4 w-4" /> Approve & activate
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setRejecting(true)}>
              Reject…
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function ApplicationQueue({ pending }: { pending: Professional[] }) {
  return (
    <section id="queue" className="mb-8 scroll-mt-24">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/45">Applications</div>
          <h2 className="mt-1 text-[20px] font-bold tracking-[-0.02em]">{pending.length ? `${pending.length} waiting for review` : "All caught up"}</h2>
        </div>
        <Link href="/admin/team" className="text-[13px] font-medium text-ink/60 hover:text-ink">
          Team & access →
        </Link>
      </div>
      {pending.length === 0 ? (
        <p className="rounded-[26px] border border-dashed border-ink/20 px-5 py-8 text-center text-[14px] text-ink/55">No professionals are waiting. New applications appear here the moment they’re submitted.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {pending.map((p) => (
              <ApplicationCard key={p.id} pro={p} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

function AdminProfessionals() {
  const pros = useApp((s) => s.pros);
  const toggleActive = useApp((s) => s.toggleActive);
  const pending = pros.filter((p) => p.verification === "PENDING");
  const rest = pros.filter((p) => p.verification !== "PENDING");

  return (
    <>
      <PageTitle title="Professionals" description="Only verified and active professionals appear in availability or can be assigned jobs." />

      <ApplicationQueue pending={pending} />

      <Card className="overflow-x-auto">
        <table className="w-full min-w-180 text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Professional</th>
              <th className="px-4 py-3 font-medium">Area</th>
              <th className="px-4 py-3 font-medium">Skills</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Active</th>
            </tr>
          </thead>
          <tbody className="stagger-fast">
            {rest.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} className="h-8 w-8 text-xs" />
                    <div>
                      <div className="flex items-center gap-1 font-medium">
                        {p.name} {p.verification === "VERIFIED" && <BadgeCheck className="h-4 w-4 text-teal-brand" />}
                      </div>
                      <div className="text-xs text-slate-400">{p.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.area}</td>
                <td className="px-4 py-3 text-slate-600">{p.skills.length} services</td>
                <td className="px-4 py-3">{p.rating ? `★ ${p.rating}` : "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={p.verification === "VERIFIED" ? "green" : "red"}>{p.verification.toLowerCase()}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={p.verification !== "VERIFIED"}
                    onClick={() => (toggleActive(p.id), toast(`${p.name} ${p.active ? "deactivated" : "activated"}`))}
                    className={`relative h-6 w-11 rounded-full transition disabled:opacity-40 ${p.active ? "bg-teal-brand" : "bg-slate-300"}`}
                    aria-label="Toggle active"
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.active ? "left-5.5" : "left-0.5"}`} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <AdminProfessionals />
    </ReadyGate>
  );
}
