"use client";

import { ReadyGate } from "@/components/molecules/ready-gate";
import { useState } from "react";
import { Briefcase } from "lucide-react";
import { JobCard } from "@/components/molecules/job-card";
import { Empty, Segmented } from "@/components/molecules/app-kit";
import { PageTitle } from "@/components/organisms/dashboard-shell";
import { useApp, useMyProId, type Booking } from "@/lib/store";

type TabId = "active" | "done" | "cancelled";
const tabs: { id: TabId; label: string; match: Booking["status"][] }[] = [
  { id: "active", label: "Upcoming", match: ["CONFIRMED", "ASSIGNED", "IN_PROGRESS"] },
  { id: "done", label: "Completed", match: ["COMPLETED"] },
  { id: "cancelled", label: "Cancelled", match: ["CANCELLED"] },
];

function ProJobs() {
  const myProId = useMyProId();
  const [tab, setTab] = useState<TabId>("active");
  const bookings = useApp((s) => s.bookings);
  const mine = bookings.filter((b) => b.professionalId === myProId);
  const t = tabs.find((x) => x.id === tab)!;
  const list = mine
    .filter((b) => t.match.includes(b.status))
    .sort((a, b) => (tab === "active" ? a.start.localeCompare(b.start) : b.start.localeCompare(a.start)));
  return (
    <>
      <PageTitle title="My jobs" description="Only jobs assigned to you appear here." />
      <Segmented value={tab} onChange={setTab} items={tabs.map((x) => ({ id: x.id, label: x.label, count: mine.filter((b) => x.match.includes(b.status)).length }))} />
      {list.length === 0 ? (
        <Empty icon={<Briefcase className="h-5 w-5" />} title="No jobs in this list" text={tab === "active" ? "New jobs appear here once ops assigns them to you." : undefined} />
      ) : (
        <div className="stagger-fast grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((b) => (
            <JobCard key={b.id} b={b} />
          ))}
        </div>
      )}
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
