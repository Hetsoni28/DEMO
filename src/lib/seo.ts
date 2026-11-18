import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

/** The site-wide card from app/opengraph-image.tsx. Pages that set their own `openGraph` stop inheriting it, so it is listed explicitly; a route-level opengraph-image file (e.g. each service) still takes priority. */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  type: "image/png",
  alt: `${siteConfig.name} — Home problems. Professionally solved. Verified professionals for every home service.`,
};

/**
 * Per-page metadata with matching Open Graph + X/Twitter tags.
 *
 * Next.js merges `openGraph` shallowly, so a page that only sets `title` would
 * otherwise share the home page's OG title/description/url. Every public page
 * goes through this helper so link previews describe the page actually shared.
 * Image: the site-wide card, unless `ownImage` lets a route-level opengraph-image file apply.
 */
export function pageMetadata({
  title,
  description = siteConfig.description,
  path,
  absoluteTitle = false,
  noIndex = false,
  ownImage = false,
}: {
  title: string;
  description?: string;
  /** Path beginning with "/" — resolved against `metadataBase`. */
  path: string;
  /** Use the title as-is instead of "Title · HomeCrew". */
  absoluteTitle?: boolean;
  noIndex?: boolean;
  /** The route has its own opengraph-image file — don't list the site-wide card (explicit images would override the file). */
  ownImage?: boolean;
}): Metadata {
  const images = ownImage ? {} : { images: [DEFAULT_OG_IMAGE] };
  const fullTitle = absoluteTitle ? title : `${title} · ${siteConfig.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: "en_IN",
      url: path,
      title: fullTitle,
      description,
      ...images,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, ...images },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
