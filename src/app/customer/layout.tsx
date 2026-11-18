"use client";

import { BookOpenCheck, CalendarCheck, LayoutDashboard, MapPin, Plus } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/organisms/dashboard-shell";
import { CustomerAside } from "@/components/dashboard/role-asides";
import { DEMO_CUSTOMER } from "@/lib/mock-data";

const nav: NavItem[] = [
  { href: "/customer/dashboard", label: "Overview", short: "Home", icon: LayoutDashboard },
  { href: "/customer/bookings", label: "My bookings", short: "Bookings", icon: CalendarCheck },
  { href: "/customer/home-passport", label: "Home passport", short: "Passport", icon: BookOpenCheck },
  { href: "/customer/addresses", label: "Addresses", short: "Places", icon: MapPin },
  { href: "/services", label: "Book a service", short: "Book", icon: Plus, cta: true },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell role="customer" user={DEMO_CUSTOMER.name} subtitle="Customer · Satellite" nav={nav} aside={<CustomerAside />}>
      {children}
    </DashboardShell>
  );
}
