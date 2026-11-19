"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { CircleAlert, LoaderCircle, QrCode, ScanLine } from "lucide-react";
import { Button, Input } from "@/components/atoms/ui";
import { Section } from "@/components/molecules/app-kit";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { fmtDateTime } from "@/lib/format";
import { getService } from "@/lib/mock-data";
import { useApp, useMyProId } from "@/lib/store";

function ScanPage() {
  const myProId = useMyProId();
  const router = useRouter();
  const scanQr = useApp((s) => s.scanQr);
  const bookings = useApp((s) => s.bookings);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mine = bookings.filter((b) => b.professionalId === myProId && ["CONFIRMED", "ASSIGNED"].includes(b.status) && b.qr && !b.qr.consumedAt);
  const others = bookings.filter((b) => b.professionalId !== myProId && ["CONFIRMED", "ASSIGNED"].includes(b.status) && b.qr).slice(0, 1);

  const submit = (t: string) => {
    setBusy(true);
    setError(null);
    setTimeout(() => {
      const r = scanQr(t, myProId);
      setBusy(false);
      if (r.ok && r.id) {
        toast.success("QR verified — job started");
        router.push(`/professional/jobs/${r.id}`);
      } else if (!r.ok) setError(r.error);
    }, 900);
  };

  return (
    <>
      <PageTitle title="Scan QR" description="Scan the customer's QR to start the job." />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_380px] lg:gap-5">
        <section className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
          <div className="relative flex aspect-square items-center justify-center bg-ink sm:aspect-[4/3]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
            <div className="relative h-52 w-52">
              {["left-0 top-0 border-l-4 border-t-4", "right-0 top-0 border-r-4 border-t-4", "bottom-0 left-0 border-b-4 border-l-4", "bottom-0 right-0 border-b-4 border-r-4"].map((c) => (
                <span key={c} className={`absolute h-10 w-10 rounded-sm border-cream ${c}`} />
              ))}
              <span className="absolute left-3 right-3 h-0.5 animate-scan bg-cream shadow-[0_0_16px_2px_rgba(238,235,218,0.6)]" />
              <QrCode className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-white/10" />
            </div>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 backdrop-blur">
              Camera preview (simulated)
            </span>
          </div>
          <form
            className="flex gap-2 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (token.trim()) submit(token);
            }}
          >
            <Input placeholder="Or type the code, e.g. ppq_…" value={token} onChange={(e) => setToken(e.target.value)} className="min-w-0 font-mono" />
            <Button type="submit" className="h-11 rounded-xl" disabled={busy || !token.trim()}>
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Verify"}
            </Button>
          </form>
          {error && (
            <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700">
              <CircleAlert className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </section>

        <div className="space-y-3">
          <Section title="Ready to scan">
            <p className="-mt-1.5 mb-3 text-[12.5px] text-ink/55">Demo: tap a job to pretend you scanned its QR at the door.</p>
            <div className="space-y-2">
              {mine.map((b) => (
                <button
                  key={b.id}
                  disabled={busy}
                  onClick={() => submit(b.qr!.token)}
                  className="flex w-full items-center gap-3 rounded-xl border border-ink/8 bg-cream/40 p-3 text-left transition-colors hover:border-emerald-600"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white"><ScanLine className="h-4.5 w-4.5" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-bold text-ink">
                      {b.code} · {getService(b.serviceSlug)?.title}
                    </div>
                    <div className="truncate text-[12px] text-ink/55">
                      {b.customerName} · {fmtDateTime(b.start)}
                    </div>
                  </div>
                </button>
              ))}
              {mine.length === 0 && <p className="text-[13px] text-ink/55">No jobs waiting for a scan right now.</p>}
            </div>
          </Section>
          <Section title="Try the security checks">
            <div className="space-y-2">
              {others.map((b) => (
                <button key={b.id} disabled={busy} onClick={() => submit(b.qr!.token)} className="w-full rounded-xl border border-dashed border-ink/15 p-3 text-left text-[13px] font-medium text-ink/65 hover:border-red-300">
                  Scan another professional&apos;s QR ({b.code})
                </button>
              ))}
              <button disabled={busy} onClick={() => submit("ppq_FAKE00000000TOKEN")} className="w-full rounded-xl border border-dashed border-ink/15 p-3 text-left text-[13px] font-medium text-ink/65 hover:border-red-300">
                Scan a forged token
              </button>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <ScanPage />
    </ReadyGate>
  );
}
