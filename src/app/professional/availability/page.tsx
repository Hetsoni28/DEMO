"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/atoms/ui";
import { ActionBar, Row, Section } from "@/components/molecules/app-kit";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { SERVICE_AREA, TRAVEL_BUFFER_MIN } from "@/lib/mock-data";
import { useApp, usePro, useMyProId } from "@/lib/store";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const h12 = (h: number) => `${h % 12 || 12} ${h < 12 ? "am" : "pm"}`;

function HourStepper({ label, value, onChange, min = 6, max = 22 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="rounded-xl border border-ink/8 bg-cream/40 p-2.5">
      <div className="mb-1.5 text-[11.5px] font-semibold text-ink/50">{label}</div>
      <div className="flex items-center justify-between">
        <button type="button" aria-label={`Earlier ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/10 bg-white text-ink disabled:opacity-30">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="text-[15px] font-bold tabular-nums text-ink">{h12(value)}</span>
        <button type="button" aria-label={`Later ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/10 bg-white text-ink disabled:opacity-30">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function AvailabilityPage() {
  const myProId = useMyProId();
  const pro = usePro(myProId)!;
  const update = useApp((s) => s.updateHours);
  const [h, setH] = useState(pro.hours);
  const [off, setOff] = useState(pro.offDays);
  const [zones, setZones] = useState(pro.area.split(", "));

  const span = h.end - h.start;
  const valid = h.end > h.start && h.breakEnd > h.breakStart && h.breakStart >= h.start && h.breakEnd <= h.end;

  const save = () => {
    update(pro.id, h, off);
    toast.success("Availability saved · new slots are live");
  };

  return (
    <>
      <PageTitle title="Availability" description="Customers only see slots inside your hours, outside breaks and away from other jobs." />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_360px] lg:gap-5">
        <div className="space-y-3">
          <Section title="Working days" action={<span className="text-[12px] font-semibold text-ink/50">{7 - off.length} / week</span>}>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d, i) => {
                const on = !off.includes(i);
                return (
                  <button
                    key={d}
                    aria-pressed={on}
                    onClick={() => setOff(on ? [...off, i] : off.filter((x) => x !== i))}
                    className={cn(
                      "flex h-11 flex-col items-center justify-center rounded-xl border text-[12.5px] font-bold transition-colors",
                      on ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-ink/10 bg-white text-ink/35",
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Hours & break">
            <div className="grid grid-cols-2 gap-2">
              <HourStepper label="Start" value={h.start} onChange={(v) => setH({ ...h, start: v })} />
              <HourStepper label="End" value={h.end} onChange={(v) => setH({ ...h, end: v })} />
              <HourStepper label="Break from" value={h.breakStart} onChange={(v) => setH({ ...h, breakStart: v })} />
              <HourStepper label="Break until" value={h.breakEnd} onChange={(v) => setH({ ...h, breakEnd: v })} />
            </div>
            <div className="mt-4">
              <div className="relative h-7 overflow-hidden rounded-lg bg-ink/5">
                {valid && (
                  <>
                    <div className="absolute inset-y-0 rounded-lg bg-emerald-500/85" style={{ left: `${((h.start - 6) / 16) * 100}%`, width: `${(span / 16) * 100}%` }} />
                    <div
                      className="absolute inset-y-0 bg-[repeating-linear-gradient(45deg,#fff,#fff_4px,#e7e5d8_4px,#e7e5d8_8px)]"
                      style={{ left: `${((h.breakStart - 6) / 16) * 100}%`, width: `${((h.breakEnd - h.breakStart) / 16) * 100}%` }}
                    />
                  </>
                )}
              </div>
              <div className="mt-1 flex justify-between text-[10.5px] font-medium text-ink/40">
                <span>6 am</span>
                <span>2 pm</span>
                <span>10 pm</span>
              </div>
            </div>
            {!valid && <p className="mt-3 text-[13px] font-medium text-red-600">The break must sit inside your hours, and end must be after start.</p>}
          </Section>

          <Section title="Service zones" action={<span className="text-[12px] font-semibold text-ink/50">{zones.length} selected</span>}>
            <div className="flex flex-wrap gap-2">
              {SERVICE_AREA.zones.map((z) => {
                const on = zones.includes(z);
                return (
                  <button
                    key={z}
                    aria-pressed={on}
                    onClick={() => setZones(on ? zones.filter((x) => x !== z) : [...zones, z])}
                    className={cn(
                      "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[12.5px] font-semibold transition-colors",
                      on ? "border-ink bg-ink text-cream" : "border-ink/12 bg-white text-ink/65",
                    )}
                  >
                    {on && <Check className="h-3.5 w-3.5" />} {z}
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        <div className="space-y-3">
          <Section title="Summary">
            <Row label="Days" value={`${7 - off.length} / week`} />
            <Row label="Hours" value={`${h12(h.start)} – ${h12(h.end)}`} />
            <Row label="Break" value={`${h12(h.breakStart)} – ${h12(h.breakEnd)}`} />
            <Row label="Travel buffer" value={`${TRAVEL_BUFFER_MIN} min / job`} />
            <Row label="Zones" value={zones.length} />
            <p className="mt-2 text-[12px] text-ink/45">Confirmed jobs are never removed when you change your hours.</p>
          </Section>
          <div className="hidden lg:block">
            <Button className="w-full" size="lg" variant="teal" disabled={!valid} onClick={save}>
              Save availability
            </Button>
          </div>
        </div>
      </div>
      <div className="lg:hidden">
        <ActionBar>
          <Button className="h-11 w-full" variant="teal" disabled={!valid} onClick={save}>
            Save availability
          </Button>
        </ActionBar>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <AvailabilityPage />
    </ReadyGate>
  );
}
