"use client";

import { CalendarClock, ClipboardList, IndianRupee, LayoutDashboard, ScanLine } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/organisms/dashboard-shell";
import { DEMO_PROFESSIONAL_ID } from "@/lib/mock-data";
import { usePro } from "@/lib/store";
import { ProfessionalAside } from "@/components/dashboard/role-asides";

const nav: NavItem[] = [
  { href: "/professional/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/professional/jobs", label: "My jobs", icon: ClipboardList },
  { href: "/professional/scan", label: "Scan QR", icon: ScanLine },
  { href: "/professional/availability", label: "Availability", icon: CalendarClock },
  { href: "/professional/earnings", label: "Earnings", icon: IndianRupee },
];

export default function ProfessionalLayout({ children }: { children: React.ReactNode }) {
  const pro = usePro(DEMO_PROFESSIONAL_ID);
  return (
    <DashboardShell role="professional" user={pro?.name ?? "Ramesh Patel"} subtitle={`${pro?.trade ?? "Professional"} · Verified`} nav={nav} aside={<ProfessionalAside />}>
      {children}
    </DashboardShell>
  );
}
