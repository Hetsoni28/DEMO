import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CustomerShell } from "./shell";

// The customer portal is an installable app ("HomeCrew"), separate from the website.
export const metadata: Metadata = {
  manifest: "/apps/customer.webmanifest",
  icons: { icon: "/icon.svg", apple: "/apps/customer-apple-180.png" },
  appleWebApp: { capable: true, title: "HomeCrew", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#EEEBDA" };

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>;
}
