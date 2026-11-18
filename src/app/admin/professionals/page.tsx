"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { toast } from "sonner";
import { BadgeCheck, FileText } from "lucide-react";
import { Avatar, Badge, Button, Card } from "@/components/atoms/ui";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { getService } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

function AdminProfessionals() {
  const pros = useApp((s) => s.pros);
  const setVerification = useApp((s) => s.setVerification);
  const toggleActive = useApp((s) => s.toggleActive);
  const pending = pros.filter((p) => p.verification === "PENDING");
  const rest = pros.filter((p) => p.verification !== "PENDING");

  return (
    <>
      <PageTitle title="Professionals" description="Only verified and active professionals appear in availability or can be assigned jobs." />

      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Verification queue</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pending.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">
                      {p.years} yrs experience · {p.area}
                    </div>
                  </div>
                  <Badge tone="amber">Pending</Badge>
                </div>
                <ul className="mt-4 space-y-2">
                  {p.documents.map((d) => (
                    <li key={d.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="flex items-center gap-2 text-slate-600">
                        <FileText className="h-4 w-4 text-slate-400" /> {d.name}
                      </span>
                      <button onClick={() => toast.message(`Opening ${d.name} via signed URL (demo)`)} className="text-xs font-medium text-teal-brand hover:underline">
                        View
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.skills.map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {getService(s)?.title}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="teal" onClick={() => (setVerification(p.id, "VERIFIED"), toast.success(`${p.name} verified and activated`))}>
                    Approve & activate
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => (setVerification(p.id, "REJECTED"), toast(`${p.name} rejected`))}>
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
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
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.active ? "left-[22px]" : "left-0.5"}`} />
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
