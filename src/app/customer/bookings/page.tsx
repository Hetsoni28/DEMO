"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useState } from "react";
import { Card } from "@/components/atoms/ui";
import { BookingRow } from "@/components/molecules/booking-row";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { useApp, useMyCustomerId } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "upcoming", label: "Upcoming", match: ["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"] },
  { id: "completed", label: "Completed", match: ["COMPLETED"] },
  { id: "cancelled", label: "Cancelled / expired", match: ["CANCELLED", "EXPIRED"] },
];

function CustomerBookings() {
  const myCustomerId = useMyCustomerId();
  const [tab, setTab] = useState("upcoming");
  const pros = useApp((s) => s.pros);
  const all = useApp((s) => s.bookings);
  const t = tabs.find((x) => x.id === tab)!;
  const list = all
    .filter((b) => b.customerId === myCustomerId && t.match.includes(b.status))
    .sort((a, b) => (tab === "upcoming" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)));

  return (
    <>
      <PageTitle title="My bookings" description="Track every visit from payment to completion." />
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
          <BookingRow key={b.id} booking={b} href={`/customer/bookings/${b.id}`} sub={pros.find((p) => p.id === b.professionalId)?.name} />
        ))}
        {list.length === 0 && <p className="px-3 py-12 text-center text-sm text-slate-500">Nothing here yet.</p>}
      </Card>
    </>
  );
}

export default function Page() {
  return (
    <ReadyGate>
      <CustomerBookings />
    </ReadyGate>
  );
}
