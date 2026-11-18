import type { Metadata } from "next";
import type { ReactNode } from "react";

// Browser-tab title for this private dashboard screen (the page itself is a client component).
export const metadata: Metadata = { title: "My dashboard", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
