import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ProfessionalShell } from "./shell";

// The professional portal is its own installable app ("HomeCrew Pro").
export const metadata: Metadata = {
  manifest: "/apps/professional.webmanifest",
  icons: { icon: "/icon.svg", apple: "/apps/professional-apple-180.png" },
  appleWebApp: { capable: true, title: "HomeCrew Pro", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#EEEBDA" };

export default function ProfessionalLayout({ children }: { children: ReactNode }) {
  return <ProfessionalShell>{children}</ProfessionalShell>;
}
