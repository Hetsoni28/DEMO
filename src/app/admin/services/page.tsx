"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import Link from "next/link";
import { Badge, Card } from "@/components/atoms/ui";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { formatDuration, formatINR, pricingTypeLabel } from "@/lib/format";
import { getCategory, services } from "@/lib/mock-data";
import { eligiblePros } from "@/lib/scheduling";
import { useApp } from "@/lib/store";

function AdminServices() {
  const pros = useApp((s) => s.pros);
  return (
    <>
      <PageTitle title="Service catalogue" description="Prices here are the trusted source used to create Razorpay orders — the browser never sets the amount." />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Pricing</th>
              <th className="px-4 py-3 font-medium">Amount (paise)</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Warranty</th>
              <th className="px-4 py-3 font-medium">Eligible pros</th>
            </tr>
          </thead>
          <tbody className="stagger-fast">
            {services.map((s) => (
              <tr key={s.slug} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/services/${s.slug}`} className="font-medium text-slate-900 hover:text-teal-brand">
                    {s.title}
                  </Link>
                  <div className="text-xs text-slate-400">/{s.slug}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{getCategory(s.categorySlug)?.name}</td>
                <td className="px-4 py-3">
                  <Badge tone={s.pricingType === "FIXED" ? "blue" : s.pricingType === "STARTING" ? "violet" : "amber"}>{pricingTypeLabel(s.pricingType)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div>{formatINR(s.pricePaise)}</div>
                  <div className="font-mono text-[11px] text-slate-400">{s.pricePaise}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDuration(s.durationMin)}</td>
                <td className="px-4 py-3 text-slate-600">{s.warrantyDays ? `${s.warrantyDays} days` : "—"}</td>
                <td className="px-4 py-3">{eligiblePros(s.slug, pros).length}</td>
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
      <AdminServices />
    </ReadyGate>
  );
}
