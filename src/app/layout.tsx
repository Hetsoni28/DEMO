import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { StoreHydrator } from "@/components/organisms/store-hydrator";
import { WelcomeOverlay } from "@/components/auth/welcome-overlay";
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
        <WelcomeOverlay />
        {/* Calm app-style notifications: a small dark pill at the bottom, clear of the
            header and above the phone tab bar. */}
        <Toaster
          position="bottom-center"
          offset={24}
          mobileOffset={{ bottom: 104 }}
          duration={2600}
          visibleToasts={2}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-cream shadow-[0_18px_40px_-16px_rgba(40,43,74,0.55)] sm:w-auto sm:min-w-72",
              title: "text-[13.5px] font-semibold leading-snug",
              description: "mt-0.5 text-[12px] leading-snug text-cream/65",
              icon: "shrink-0 [&>svg]:h-4.5 [&>svg]:w-4.5",
              success: "[&_[data-icon]]:text-emerald-300",
              error: "[&_[data-icon]]:text-rose-300",
              info: "[&_[data-icon]]:text-sky-300",
              actionButton: "ml-auto shrink-0 rounded-lg bg-cream px-2.5 py-1 text-[12px] font-semibold text-ink",
            },
          }}
        />
      </body>
    </html>
  );
}
