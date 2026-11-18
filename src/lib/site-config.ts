/**
 * Site-wide configuration. Contact details and social profiles are intentionally
 * empty until real ones exist — components render nothing for unset values
 * rather than showing invented details.
 */
export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "x" | "youtube";

export const siteConfig = {
  name: "HomeCrew",
  tagline: "Home Problems. Professionally Solved.",
  description:
    "Book verified professionals for plumbing, electrical, cleaning, AC & appliance repair, carpentry, painting and pest control — real time slots, transparent pricing, all in one place.",
  /** Set NEXT_PUBLIC_SITE_URL in each environment; used for canonical URLs, OG and the sitemap. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Static so pages stay fully prerenderable (Cache Components forbids `new Date()` in the shell). */
  copyrightYear: 2026,
  contact: {
    email: null as string | null,
    phone: null as string | null,
    address: null as string | null,
  },
  social: {
    instagram: null,
    facebook: null,
    linkedin: null,
    x: null,
    youtube: null,
  } as Record<SocialPlatform, string | null>,
  routes: {
    book: "/services",
    signIn: "/login",
    joinPro: "/register?role=professional",
  },
};
