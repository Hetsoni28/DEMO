"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { Button, Card, Input, Label } from "@/components/atoms/ui";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { SERVICE_AREA } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

function AddressesPage() {
  const addresses = useApp((s) => s.addresses);
  const add = useApp((s) => s.addAddress);
  const remove = useApp((s) => s.removeAddress);
  const [form, setForm] = useState({ label: "", line: "", zone: SERVICE_AREA.zones[0] });

  return (
    <>
      <PageTitle title="Saved addresses" description={`We currently serve ${SERVICE_AREA.zones.length} areas across ${SERVICE_AREA.city}.`} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id} className="flex items-start gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-soft text-teal-brand">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="font-medium text-slate-900">{a.label}</div>
                <div className="text-sm text-slate-500">{a.line}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {a.lat.toFixed(4)}, {a.lng.toFixed(4)}
                </div>
              </div>
              <button onClick={() => (remove(a.id), toast("Address removed"))} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          ))}
        </div>
        <Card className="h-fit p-5">
          <h3 className="font-semibold text-slate-900">Add address</h3>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (form.line.trim().length < 4) return toast.error("Enter the full address");
              add({ label: form.label || "Other", line: `${form.line.trim()}, ${form.zone}`, zone: form.zone, lat: 23.02 + Math.random() / 50, lng: 72.52 + Math.random() / 50 });
              setForm({ label: "", line: "", zone: SERVICE_AREA.zones[0] });
              toast.success("Address saved");
            }}
          >
            <div>
              <Label>Label</Label>
              <Input placeholder="Home, Parents…" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <Label>Address</Label>
              <Input placeholder="Flat, building, street" value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} />
            </div>
            <div>
              <Label>Area</Label>
              <select value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
                {SERVICE_AREA.zones.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4" /> Save address
            </Button>
          </form>
        </Card>
      </div>
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
