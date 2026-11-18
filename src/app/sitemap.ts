import type { MetadataRoute } from "next";
import { services } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site-config";
import { legalPages } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const pages = ["", "/services", "/about", "/contact", "/professionals"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...legalPages.map((l) => ({ url: `${base}/legal/${l.slug}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
