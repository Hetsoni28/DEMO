export const legalPages = [
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "terms", title: "Terms & Conditions" },
  { slug: "cancellation", title: "Cancellation Policy" },
  { slug: "refund", title: "Refund Policy" },
] as const;

export type LegalSlug = (typeof legalPages)[number]["slug"];
