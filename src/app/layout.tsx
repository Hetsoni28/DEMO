import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { StoreHydrator } from "@/components/organisms/store-hydrator";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  // "Add to Home Screen" opens full-screen like an installed app.
  appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: "default" },
  keywords: ["home services", "plumber", "electrician", "home cleaning", "AC service", "carpenter", "painter", "pest control", "Ahmedabad"],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
    url: "/",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: `${siteConfig.name} — ${siteConfig.tagline}`, description: siteConfig.description, images: [DEFAULT_OG_IMAGE] },
};

export const viewport: Viewport = {
  themeColor: "#282B4A",
  // Lets the app shell draw edge-to-edge on notched phones; bars pad with env(safe-area-inset-*).
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <StoreHydrator />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
