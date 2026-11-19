"use client";

import { BookOpenCheck, CalendarCheck, LayoutDashboard, MapPin, Plus } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/organisms/dashboard-shell";
import { DEMO_CUSTOMER } from "@/lib/mock-data";
import { useApp, useMyCustomerId } from "@/lib/store";

const UPCOMING = ["CONFIRMED", "ASSIGNED", "IN_PROGRESS"];

export function CustomerShell({ children }: { children: React.ReactNode }) {
  const me = useMyCustomerId();
  const upcoming = useApp((s) => s.bookings.filter((b) => b.customerId === me && UPCOMING.includes(b.status)).length);
  const nav: NavItem[] = [
    { href: "/customer/dashboard", label: "Overview", short: "Home", icon: LayoutDashboard },
    { href: "/customer/bookings", label: "My bookings", short: "Bookings", icon: CalendarCheck, badge: upcoming },
    { href: "/customer/home-passport", label: "Home passport", short: "Passport", icon: BookOpenCheck },
    { href: "/customer/addresses", label: "Addresses", short: "Places", icon: MapPin },
    { href: "/customer/services", label: "Book a service", short: "Book", icon: Plus, cta: true },
  ];
  return (
    <DashboardShell role="customer" user={DEMO_CUSTOMER.name} subtitle="Customer · Satellite" nav={nav}>
      {children}
    </DashboardShell>
  );
}
