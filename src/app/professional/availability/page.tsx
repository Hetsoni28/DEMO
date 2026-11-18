"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Card, Label } from "@/components/atoms/ui";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { DEMO_PROFESSIONAL_ID, SERVICE_AREA, TRAVEL_BUFFER_MIN } from "@/lib/mock-data";
import { useApp, usePro } from "@/lib/store";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 16 }, (_, i) => i + 6);
const h12 = (h: number) => `${h % 12 || 12} ${h < 12 ? "am" : "pm"}`;

function HourSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
      {hours.map((h) => (
        <option key={h} value={h}>
          {h12(h)}
        </option>
      ))}
    </select>
  );
}

function AvailabilityPage() {
  const pro = usePro(DEMO_PROFESSIONAL_ID)!;
  const update = useApp((s) => s.updateHours);
  const [h, setH] = useState(pro.hours);
  const [off, setOff] = useState(pro.offDays);
  const [zones, setZones] = useState(pro.area.split(", "));

  const span = h.end - h.start;
  const valid = h.end > h.start && h.breakEnd > h.breakStart && h.breakStart >= h.start && h.breakEnd <= h.end;

  return (
    <>
      <PageTitle title="Availability" description="Customers only see slots inside your hours, outside your breaks and away from existing jobs." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900">Working days</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {DAYS.map((d, i) => {
                const on = !off.includes(i);
                return (
                  <button
                    key={d}
                    onClick={() => setOff(on ? [...off, i] : off.filter((x) => x !== i))}
                    className={cn("h-11 w-14 rounded-xl border text-sm font-medium transition", on ? "border-teal-brand bg-teal-soft text-teal-brand" : "border-slate-200 text-slate-400")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900">Hours & break</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Start</Label>
                <HourSelect value={h.start} onChange={(v) => setH({ ...h, start: v })} />
              </div>
              <div>
                <Label>End</Label>
                <HourSelect value={h.end} onChange={(v) => setH({ ...h, end: v })} />
              </div>
              <div>
                <Label>Break from</Label>
                <HourSelect value={h.breakStart} onChange={(v) => setH({ ...h, breakStart: v })} />
              </div>
              <div>
                <Label>Break until</Label>
                <HourSelect value={h.breakEnd} onChange={(v) => setH({ ...h, breakEnd: v })} />
              </div>
            </div>
            {/* Visual day bar */}
            <div className="mt-6">
              <div className="relative h-8 rounded-lg bg-slate-100">
                {valid && (
                  <>
                    <div className="absolute inset-y-0 rounded-lg bg-teal-brand/80" style={{ left: `${((h.start - 6) / 16) * 100}%`, width: `${(span / 16) * 100}%` }} />
                    <div
                      className="absolute inset-y-0 bg-[repeating-linear-gradient(45deg,#fff,#fff_4px,#e2e8f0_4px,#e2e8f0_8px)]"
                      style={{ left: `${((h.breakStart - 6) / 16) * 100}%`, width: `${((h.breakEnd - h.breakStart) / 16) * 100}%` }}
                    />
                  </>
                )}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>6 am</span>
                <span>2 pm</span>
                <span>10 pm</span>
              </div>
            </div>
            {!valid && <p className="mt-3 text-sm text-red-600">Break must sit inside working hours, and end must be after start.</p>}
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900">Service zones</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {SERVICE_AREA.zones.map((z) => {
                const on = zones.includes(z);
                return (
                  <button
                    key={z}
                    onClick={() => setZones(on ? zones.filter((x) => x !== z) : [...zones, z])}
                    className={cn("rounded-full border px-3 py-1.5 text-sm transition", on ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 text-slate-600")}
                  >
                    {z}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
        <Card className="h-fit p-5">
          <h3 className="font-semibold text-slate-900">Summary</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Days</dt>
              <dd>{7 - off.length} / week</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Hours</dt>
              <dd>
                {h12(h.start)} – {h12(h.end)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Travel buffer</dt>
              <dd>{TRAVEL_BUFFER_MIN} min after each job</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Zones</dt>
              <dd>{zones.length}</dd>
            </div>
          </dl>
          <Button
            className="mt-5 w-full"
            variant="teal"
            disabled={!valid}
            onClick={() => {
              update(pro.id, h, off);
              toast.success("Availability saved — new slots are live for customers");
            }}
          >
            Save availability
          </Button>
          <p className="mt-3 text-xs text-slate-400">Existing confirmed jobs are never removed by changing your hours.</p>
        </Card>
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
