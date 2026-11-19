"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Camera, CircleAlert, Lock, MapPin, Navigation, Phone, ScanLine, X } from "lucide-react";
import { Badge, Button, Input, Label, Textarea } from "@/components/atoms/ui";
import { ActionBar, BackHeader, Empty, Section } from "@/components/molecules/app-kit";
import { ServiceImage } from "@/components/molecules/service-image";
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
      <Empty
        icon={<Lock className="h-5 w-5" />}
        title="This job isn't assigned to you"
        text="Professionals only see their own assignments."
        action={
          <Link href="/professional/jobs" className="inline-flex h-10 items-center rounded-xl bg-ink px-4 text-[13px] font-bold text-cream">
            Back to my jobs
          </Link>
        }
      />
    );

  const svc = getService(b.serviceSlug)!;
  const inProgress = b.status === "IN_PROGRESS";
  const toScan = ["CONFIRMED", "ASSIGNED"].includes(b.status);
  const addPhoto = () => setPhotos((p) => [...p, p.length % 2 === 0 ? "Before" : "After"]);

  const actions = (
    <ActionBar>
      <div className="px-2 lg:hidden">
        <div className="text-[11px] font-medium text-ink/50">You earn</div>
        <div className="text-[15px] font-bold tabular-nums text-ink">{formatINR(payout(b))}</div>
      </div>
      {toScan ? (
        <Link href="/professional/scan" className="ml-auto inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[14px] font-bold text-white">
          <ScanLine className="h-4 w-4" /> Scan QR to start
        </Link>
      ) : inProgress ? (
        <button
          onClick={() => document.getElementById("job-report")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="ml-auto inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-ink text-[14px] font-bold text-cream"
        >
          Finish &amp; report
        </button>
      ) : (
        <Link href="/professional/jobs" className="ml-auto inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-ink text-[14px] font-bold text-cream">
          All jobs
        </Link>
      )}
    </ActionBar>
  );

  return (
    <>
      <BackHeader href="/professional/jobs" label="My jobs" title={svc.title} badge={<StatusBadge status={b.status} />} meta={<span className="font-mono text-[12px]">{b.code}</span>} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px] lg:gap-5">
        <div className="space-y-3">
          <section className="rounded-2xl border border-ink/8 bg-white p-3">
            <div className="flex gap-3">
              <ServiceImage categorySlug={svc.categorySlug} slug={svc.slug} alt="" className="h-20 w-20 shrink-0 rounded-xl" sizes="80px" />
              <div className="min-w-0 flex-1 space-y-1.5 py-0.5 text-[13px] text-ink/70">
                <div className="text-[14.5px] font-bold text-ink">{b.customerName}</div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0 text-ink/40" />
                  <span>
                    <span className="font-semibold text-ink">{fmtDate(b.start)}</span> · {fmtTime(b.start)} – {fmtTime(b.end)}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
                  <span className="line-clamp-2">{b.address}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address + ", Ahmedabad")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-cream text-[13px] font-bold text-ink"
              >
                <Navigation className="h-4 w-4" /> Navigate
              </a>
              <button
                onClick={() => toast.message("Calling the customer on a masked number (demo)")}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-cream text-[13px] font-bold text-ink"
              >
                <Phone className="h-4 w-4" /> Call
              </button>
            </div>
          </section>

          {toScan && (
            <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
              <CircleAlert className="mt-0.5 h-4.5 w-4.5 shrink-0 text-sky-700" />
              <p className="text-[13px] text-sky-900/80">On arrival, scan the customer&apos;s service QR. The job starts only after the QR matches this assignment.</p>
            </div>
          )}

          {inProgress && (
            <>
              <Section title="Extra work needed?">
                {b.extraQuote ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-cream/60 p-3 text-[13px]">
                    <div>
                      <div className="font-semibold text-ink">{b.extraQuote.description}</div>
                      <div className="text-ink/55">{formatINR(b.extraQuote.amountPaise)} + GST</div>
                    </div>
                    <Badge tone={b.extraQuote.status === "APPROVED" ? "green" : b.extraQuote.status === "DECLINED" ? "red" : "amber"}>
                      {b.extraQuote.status === "PENDING" ? "Waiting for customer" : b.extraQuote.status.toLowerCase()}
                    </Badge>
                  </div>
                ) : (
                  <form
                    className="grid grid-cols-[1fr_110px] gap-2 sm:grid-cols-[1fr_140px_auto] sm:items-end"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const rupees = Number(extra.amount);
                      if (!extra.description.trim() || !(rupees > 0)) return toast.error("Describe the work and enter an amount");
                      requestExtra(b.id, extra.description.trim(), Math.round(rupees * 100));
                      toast.success("Quote sent · the customer approves before you continue");
                    }}
                  >
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="xw-desc">Work description</Label>
                      <Input id="xw-desc" placeholder="e.g. Replace corroded angle valve" value={extra.description} onChange={(e) => setExtra({ ...extra, description: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="xw-amt">Amount (₹)</Label>
                      <Input id="xw-amt" inputMode="numeric" placeholder="350" value={extra.amount} onChange={(e) => setExtra({ ...extra, amount: e.target.value })} />
                    </div>
                    <Button type="submit" variant="secondary" className="h-11 self-end">
                      Send quote
                    </Button>
                  </form>
                )}
                {b.extraQuote?.status === "PENDING" && <p className="mt-2 text-[12px] text-ink/45">Tip: switch to the customer app to approve it, then come back.</p>}
              </Section>

              <div id="job-report" className="scroll-mt-36">
                <Section title="Job report">
                  <div className="space-y-4">
                    <div>
                      <Label>Before / after photos</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {photos.map((p, i) => (
                          <div key={i} className="relative flex aspect-square flex-col items-center justify-center rounded-xl bg-cream text-[11px] font-semibold text-ink/50">
                            <Camera className="h-5 w-5" />
                            {p}
                            <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-white p-0.5 shadow" aria-label="Remove">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {photos.length < 8 && (
                          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/15 text-[11px] font-semibold text-ink/50 hover:border-emerald-600">
                            <Camera className="h-5 w-5" />
                            Add
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.length) addPhoto();
                                e.target.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <button type="button" className="mt-2 text-[12px] font-semibold text-emerald-700 hover:underline" onClick={addPhoto}>
                        + Add sample photo (demo)
                      </button>
                    </div>
                    <div>
                      <Label htmlFor="jr-sum">Work summary</Label>
                      <Textarea id="jr-sum" rows={3} placeholder="What did you find and fix?" value={summary} onChange={(e) => setSummary(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="jr-mat">Materials used</Label>
                      <Input id="jr-mat" placeholder="e.g. 1 × CPVC elbow, teflon tape" value={materials} onChange={(e) => setMaterials(e.target.value)} />
                    </div>
                    <Button
                      variant="teal"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        if (photos.length < 2) return toast.error("Add at least one before and one after photo");
                        if (summary.trim().length < 10) return toast.error("Write a short work summary");
                        const r = complete(b.id, summary.trim(), materials.trim(), photos.length);
                        if (r.ok) toast.success("Job completed · invoice sent to the customer");
                        else toast.error(r.error);
                      }}
                    >
                      Complete job
                    </Button>
                  </div>
                </Section>
              </div>
            </>
          )}

          {b.report && (
            <Section title="Submitted report">
              <p className="text-[13.5px] text-ink/70">{b.report.summary}</p>
              <p className="mt-1.5 text-[13px] text-ink/55">Materials: {b.report.materials || "None"}</p>
              <p className="mt-1 text-[13px] text-ink/55">{b.report.photos} photos uploaded</p>
            </Section>
          )}

          <Section title="Status">
            <Timeline history={b.history} />
          </Section>
        </div>

        <div className="space-y-3">
          {actions}
          <Section tone="ink">
            <div className="text-[12px] font-medium text-cream/55">You earn</div>
            <div className="mt-1 text-[26px] font-bold leading-none tracking-tight">{formatINR(payout(b))}</div>
            <p className="mt-2 text-[12px] text-cream/55">Customer pre-paid {formatINR(b.amounts.total)} online · paid out weekly</p>
          </Section>
        </div>
      </div>
    </>
  );
}
