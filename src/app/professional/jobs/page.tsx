"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useState } from "react";
import { Card } from "@/components/atoms/ui";
import { BookingRow } from "@/components/molecules/booking-row";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { useApp, useMyProId } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "active", label: "Upcoming & active", match: ["CONFIRMED", "ASSIGNED", "IN_PROGRESS"] },
  { id: "done", label: "Completed", match: ["COMPLETED"] },
  { id: "cancelled", label: "Cancelled", match: ["CANCELLED"] },
];

function ProJobs() {
  const myProId = useMyProId();
  const [tab, setTab] = useState("active");
  const bookings = useApp((s) => s.bookings);
  const t = tabs.find((x) => x.id === tab)!;
  const list = bookings
    .filter((b) => b.professionalId === myProId && t.match.includes(b.status))
    .sort((a, b) => (tab === "active" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)));
  return (
    <>
      <PageTitle title="My jobs" description="Only bookings assigned to you are visible here." />
      <div className="mb-4 inline-flex max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1">
        {tabs.map((x) => (
          <button
            key={x.id}
            onClick={() => setTab(x.id)}
            className={cn("shrink-0 whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition", tab === x.id ? "bg-white text-navy-800 shadow-sm" : "text-slate-500")}
          >
            {x.label}
          </button>
        ))}
      </div>
      <Card className="stagger-fast p-3">
        {list.map((b) => (
          <BookingRow key={b.id} booking={b} href={`/professional/jobs/${b.id}`} sub={b.customerName} />
        ))}
        {list.length === 0 && <p className="px-3 py-12 text-center text-sm text-slate-500">No jobs in this list.</p>}
      </Card>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <ProJobs />
    </ReadyGate>
  );
}
