"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Camera, CircleAlert, Lock, MapPin, Navigation, Phone, ScanLine, X } from "lucide-react";
import { Badge, Button, Card, Input, Label, LinkButton, Textarea } from "@/components/atoms/ui";
import { StatusBadge } from "@/components/molecules/status-badge";
import { Timeline } from "@/components/molecules/timeline";
import { fmtDate, fmtTime, formatINR } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { payout } from "@/lib/pro-helpers";
import { useApp, useBooking, useMyProId } from "@/lib/store";

export function ProJobDetail({ id }: { id: string }) {
  const myProId = useMyProId();
  const b = useBooking(id);
  const requestExtra = useApp((s) => s.requestExtra);
  const complete = useApp((s) => s.complete);
  const [photos, setPhotos] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [materials, setMaterials] = useState("");
  const [extra, setExtra] = useState({ description: "", amount: "" });

  if (!b || b.professionalId !== myProId)
    return (
      <Card className="p-10 text-center">
        <Lock className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-slate-600">This job isn&apos;t assigned to you.</p>
        <p className="text-sm text-slate-400">Professionals can only see their own assignments (RLS in production).</p>
        <LinkButton href="/professional/jobs" variant="secondary" className="mt-4">
          Back to my jobs
        </LinkButton>
      </Card>
    );

  const svc = getService(b.serviceSlug)!;
  const inProgress = b.status === "IN_PROGRESS";

  return (
    <>
      <Link href="/professional/jobs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> My jobs
      </Link>
      <div className="mt-4 mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{svc.title}</h1>
            <StatusBadge status={b.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {b.code} · {fmtDate(b.start)}, {fmtTime(b.start)} – {fmtTime(b.end)}
          </p>
        </div>
        {["CONFIRMED", "ASSIGNED"].includes(b.status) && (
          <LinkButton href="/professional/scan" variant="teal">
            <ScanLine className="h-4 w-4" /> Scan QR to start
          </LinkButton>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {["CONFIRMED", "ASSIGNED"].includes(b.status) && (
            <Card className="flex items-start gap-3 border-blue-200 bg-blue-50/50 p-5">
              <CircleAlert className="mt-0.5 h-5 w-5 text-blue-600" />
              <p className="text-sm text-slate-700">
                On arrival, scan the customer&apos;s service QR. The job can only start after the QR is verified against this assignment.
              </p>
            </Card>
          )}

          {inProgress && (
            <>
              <Card className="p-5">
                <h3 className="font-semibold text-slate-900">Request approval for extra work</h3>
                {b.extraQuote ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                    <div>
                      <div className="font-medium">{b.extraQuote.description}</div>
                      <div className="text-slate-500">{formatINR(b.extraQuote.amountPaise)} + GST</div>
                    </div>
                    <Badge tone={b.extraQuote.status === "APPROVED" ? "green" : b.extraQuote.status === "DECLINED" ? "red" : "amber"}>
                      {b.extraQuote.status === "PENDING" ? "Waiting for customer" : b.extraQuote.status.toLowerCase()}
                    </Badge>
                  </div>
                ) : (
                  <form
                    className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_auto] sm:items-end"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const rupees = Number(extra.amount);
                      if (!extra.description.trim() || !(rupees > 0)) return toast.error("Describe the work and enter an amount");
                      requestExtra(b.id, extra.description.trim(), Math.round(rupees * 100));
                      toast.success("Quote sent — customer must approve before you proceed");
                    }}
                  >
                    <div>
                      <Label>Work description</Label>
                      <Input placeholder="e.g. Replace corroded angle valve" value={extra.description} onChange={(e) => setExtra({ ...extra, description: e.target.value })} />
                    </div>
                    <div>
                      <Label>Amount (₹)</Label>
                      <Input inputMode="numeric" placeholder="350" value={extra.amount} onChange={(e) => setExtra({ ...extra, amount: e.target.value })} />
                    </div>
                    <Button type="submit" variant="secondary">
                      Send quote
                    </Button>
                  </form>
                )}
                {b.extraQuote?.status === "PENDING" && (
                  <p className="mt-2 text-xs text-slate-400">Tip: switch to the customer portal to approve it, then come back.</p>
                )}
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold text-slate-900">Job report</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label>Before / after photos</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map((p, i) => (
                        <div key={i} className="relative flex aspect-square flex-col items-center justify-center rounded-xl bg-linear-to-br from-slate-100 to-slate-200 text-xs text-slate-500">
                          <Camera className="h-5 w-5" />
                          {p}
                          <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-white p-0.5 shadow" aria-label="Remove">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {photos.length < 8 && (
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-teal-brand">
                          <Camera className="h-5 w-5" />
                          Add
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.length) setPhotos([...photos, photos.length % 2 === 0 ? "Before" : "After"]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <button type="button" className="mt-2 text-xs text-teal-brand hover:underline" onClick={() => setPhotos([...photos, photos.length % 2 === 0 ? "Before" : "After"])}>
                      + Add sample photo (demo)
                    </button>
                  </div>
                  <div>
                    <Label>Work summary</Label>
                    <Textarea rows={3} placeholder="What did you find and fix?" value={summary} onChange={(e) => setSummary(e.target.value)} />
                  </div>
                  <div>
                    <Label>Materials used</Label>
                    <Input placeholder="e.g. 1 × CPVC elbow, teflon tape" value={materials} onChange={(e) => setMaterials(e.target.value)} />
                  </div>
                  <Button
                    variant="teal"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      if (photos.length < 2) return toast.error("Add at least one before and one after photo");
                      if (summary.trim().length < 10) return toast.error("Write a short work summary");
                      const r = complete(b.id, summary.trim(), materials.trim(), photos.length);
                      if (r.ok) toast.success("Job completed — invoice sent to customer");
                      else toast.error(r.error);
                    }}
                  >
                    Complete job
                  </Button>
                </div>
              </Card>
            </>
          )}

          {b.report && (
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900">Submitted report</h3>
              <p className="mt-2 text-sm text-slate-600">{b.report.summary}</p>
              <p className="mt-1 text-sm text-slate-500">Materials: {b.report.materials || "None"}</p>
              <p className="mt-1 text-sm text-slate-500">{b.report.photos} photos uploaded</p>
            </Card>
          )}

          <Card className="p-5">
            <h3 className="mb-5 font-semibold text-slate-900">Status history</h3>
            <Timeline history={b.history} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-medium text-slate-500">Customer</h3>
            <div className="mt-2 font-medium text-slate-900">{b.customerName}</div>
            <div className="mt-1 flex gap-1.5 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /> {b.address}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address + ", Ahmedabad")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-medium text-navy-800 hover:bg-slate-50"
              >
                <Navigation className="h-4 w-4" /> Navigate
              </a>
              <button
                onClick={() => toast.message("Calling customer via masked number (demo)")}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-medium text-navy-800 hover:bg-slate-50"
              >
                <Phone className="h-4 w-4" /> Call
              </button>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-medium text-slate-500">Your payout</h3>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{formatINR(payout(b))}</div>
            <p className="mt-1 text-xs text-slate-500">Customer pre-paid {formatINR(b.amounts.total)} via Razorpay</p>
          </Card>
        </div>
      </div>
    </>
  );
}
