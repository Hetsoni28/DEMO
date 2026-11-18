import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/customer/", "/professional/", "/admin/", "/book/", "/checkout", "/login", "/register"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
