"use client";

import { CalendarCheck, CreditCard, LayoutDashboard, ShieldCheck, UserCheck, Wrench } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/organisms/dashboard-shell";
import { AdminAside } from "@/components/dashboard/role-asides";
import { useApp } from "@/lib/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const unassigned = useApp((s) => s.bookings.filter((b) => b.status === "CONFIRMED" && !b.professionalId).length);
  const toReview = useApp((s) => s.pros.filter((p) => p.verification === "PENDING").length);
  const nav: NavItem[] = [
    { href: "/admin/dashboard", label: "Overview", short: "Overview", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, badge: unassigned },
    { href: "/admin/professionals", label: "Professionals", short: "Pros", icon: UserCheck, badge: toReview },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/services", label: "Services", icon: Wrench },
    { href: "/admin/team", label: "Team & access", icon: ShieldCheck, tab: false },
  ];
  return (
    <DashboardShell role="admin" user="Ops Admin" subtitle="Administrator · Ahmedabad" nav={nav} aside={<AdminAside />}>
      {children}
    </DashboardShell>
  );
}
