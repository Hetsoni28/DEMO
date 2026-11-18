"use client";

import { CalendarClock, ClipboardList, IndianRupee, LayoutDashboard, ScanLine } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/organisms/dashboard-shell";
import { useMyProId, usePro } from "@/lib/store";
import { ProfessionalAside } from "@/components/dashboard/role-asides";

const nav: NavItem[] = [
  { href: "/professional/dashboard", label: "Today", short: "Today", icon: LayoutDashboard },
  { href: "/professional/jobs", label: "My jobs", short: "Jobs", icon: ClipboardList },
  { href: "/professional/scan", label: "Scan QR", short: "Scan", icon: ScanLine, cta: true },
  { href: "/professional/availability", label: "Availability", short: "Hours", icon: CalendarClock },
  { href: "/professional/earnings", label: "Earnings", short: "Earnings", icon: IndianRupee },
];

export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const pro = usePro(useMyProId());
  return (
    <DashboardShell role="professional" user={pro?.name ?? "Ramesh Patel"} subtitle={`${pro?.trade ?? "Professional"} · Verified`} nav={nav} aside={<ProfessionalAside />}>
      {children}
    </DashboardShell>
  );
}
