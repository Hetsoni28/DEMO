"use client";

import { BookOpenCheck, CalendarCheck, LayoutDashboard, MapPin, Search } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/organisms/dashboard-shell";
import { CustomerAside } from "@/components/dashboard/role-asides";
import { DEMO_CUSTOMER } from "@/lib/mock-data";

const nav: NavItem[] = [
  { href: "/customer/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/customer/bookings", label: "My bookings", icon: CalendarCheck },
  { href: "/customer/home-passport", label: "Home passport", icon: BookOpenCheck },
  { href: "/customer/addresses", label: "Addresses", icon: MapPin },
  { href: "/services", label: "Book a service", icon: Search },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="customer" user={DEMO_CUSTOMER.name} subtitle="Customer · Satellite" nav={nav} aside={<CustomerAside />}>
      {children}
    </DashboardShell>
  );
}
