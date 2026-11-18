"use client";

import { CalendarCheck, CreditCard, LayoutDashboard, UserCheck, Wrench } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/organisms/dashboard-shell";
import { AdminAside } from "@/components/dashboard/role-asides";

const nav: NavItem[] = [
  { href: "/admin/dashboard", label: "Overview", short: "Overview", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/professionals", label: "Professionals", short: "Pros", icon: UserCheck },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/services", label: "Services", icon: Wrench },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="admin" user="Ops Admin" subtitle="Administrator · Ahmedabad" nav={nav} aside={<AdminAside />}>
      {children}
    </DashboardShell>
  );
}
