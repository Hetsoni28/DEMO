"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useState } from "react";
import { toast } from "sonner";
import { Briefcase, Home, MapPin, Plus, Trash2, X } from "lucide-react";
import { Button, Input, Label } from "@/components/atoms/ui";
import { Empty } from "@/components/molecules/app-kit";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { SERVICE_AREA } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const QUICK = ["Home", "Work", "Parents", "Other"];
const iconFor = (label: string) => (/work|office/i.test(label) ? Briefcase : /home/i.test(label) ? Home : MapPin);

function AddressesPage() {
  const addresses = useApp((s) => s.addresses);
  const add = useApp((s) => s.addAddress);
  const remove = useApp((s) => s.removeAddress);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ label: "Home", line: "", zone: SERVICE_AREA.zones[0] });

  const formEl = (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (form.line.trim().length < 4) return toast.error("Enter the full address");
        add({ label: form.label || "Other", line: `${form.line.trim()}, ${form.zone}`, zone: form.zone, lat: 23.02 + Math.random() / 50, lng: 72.52 + Math.random() / 50 });
        setForm({ label: "Home", line: "", zone: SERVICE_AREA.zones[0] });
        setOpen(false);
        toast.success("Address saved");
      }}
    >
      <div>
        <Label>Save as</Label>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              type="button"
              key={q}
              onClick={() => setForm({ ...form, label: q })}
              className={cn(
                "h-8 rounded-full border px-3 text-[12.5px] font-semibold",
                form.label === q ? "border-ink bg-ink text-cream" : "border-ink/12 bg-white text-ink/70",
              )}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="addr-line">Flat, building, street</Label>
        <Input id="addr-line" placeholder="B-402, Shivalik Heights" value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} />
      </div>
      <div>
        <Label>Area</Label>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:flex-wrap">
          {SERVICE_AREA.zones.map((z) => (
            <button
              type="button"
              key={z}
              onClick={() => setForm({ ...form, zone: z })}
              className={cn(
                "h-8 shrink-0 rounded-full border px-3 text-[12.5px] font-semibold",
                form.zone === z ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-ink/12 bg-white text-ink/65",
              )}
            >
              {z}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full">
        Save address
      </Button>
    </form>
  );

  return (
    <>
      <PageTitle title="Saved addresses" description={`We serve ${SERVICE_AREA.zones.length} areas across ${SERVICE_AREA.city}.`} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
        <div>
          <button
            onClick={() => setOpen(true)}
            className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-emerald-600/40 bg-emerald-50/60 px-4 py-3 text-left text-[14px] font-bold text-emerald-800 lg:hidden"
          >
            <Plus className="h-5 w-5" /> Add a new address
          </button>
          {addresses.length === 0 ? (
            <Empty icon={<MapPin className="h-5 w-5" />} title="No saved addresses" text="Save your home once and checkout takes seconds." />
          ) : (
            <ul className="divide-y divide-ink/6 overflow-hidden rounded-2xl border border-ink/8 bg-white">
              {addresses.map((a) => {
                const Icon = iconFor(a.label);
                return (
                  <li key={a.id} className="flex items-start gap-3 px-4 py-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-ink">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-bold text-ink">{a.label}</div>
                      <div className="text-[13px] text-ink/60">{a.line}</div>
                      <div className="mt-1 inline-flex rounded-md bg-ink/5 px-1.5 py-0.5 text-[11px] font-semibold text-ink/55">{a.zone}</div>
                    </div>
                    <button
                      onClick={() => (remove(a.id), toast("Address removed"))}
                      className="rounded-lg p-2 text-ink/35 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${a.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <section className="hidden h-fit rounded-2xl border border-ink/8 bg-white p-4 lg:block">
          <h3 className="mb-3 text-[15px] font-bold text-ink">Add address</h3>
          {formEl}
        </section>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end bg-ink/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="w-full rounded-t-3xl bg-white p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))]" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-ink">Add address</h3>
              <button onClick={() => setOpen(false)} className="rounded-full bg-ink/5 p-1.5" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div data-app>{formEl}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <AddressesPage />
    </ReadyGate>
  );
}
