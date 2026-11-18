"use client";

/**
 * Inline script that runs before first paint on full page loads.
 * Rendered as executable JS on the server, but as inert `text/plain` on the
 * client so React doesn't warn about rendering <script> tags (see Next.js guide
 * "Preventing flash before hydration").
 */
export function InlineScript({ html }: { html: string }) {
  return <script type={typeof window === "undefined" ? "text/javascript" : "text/plain"} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />;
}
