import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";

/** Brand tokens for share images (Satori needs literal values, not CSS variables). */
export const OG = {
  size: { width: 1200, height: 630 },
  cream: "#EEEBDA",
  paper: "#F6F3E6",
  ink: "#282B4A",
  ink55: "rgba(40,43,74,0.55)",
  ink40: "rgba(40,43,74,0.38)",
  ink20: "rgba(40,43,74,0.18)",
} as const;

/** Geist (OFL) — committed TTFs, since Satori can't read woff2 or reach next/font. */
export async function ogFonts() {
  const dir = join(process.cwd(), "assets", "fonts");
  const [black, semibold, mono] = await Promise.all([
    readFile(join(dir, "Geist-Black.ttf")),
    readFile(join(dir, "Geist-SemiBold.ttf")),
    readFile(join(dir, "GeistMono-Medium.ttf")),
  ]);
  return [
    {
      name: "Geist",
      data: black,
      weight: 900 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: semibold,
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "Geist Mono",
      data: mono,
      weight: 500 as const,
      style: "normal" as const,
    },
  ];
}

/** The house mark from the site logo, drawn in cream on an indigo tile. */
export function OgMark({ size = 56 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: OG.ink,
      }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke={OG.cream}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 11 12 4l8.5 7" />
        <path d="M6 9.5V20h4v-5h4v5h4V9.5" />
      </svg>
    </div>
  );
}

/**
 * Shared poster frame: logo + right-hand meta on top, content, then a footer row.
 * The footer takes two slots rather than a Fragment — Satori lays a Fragment out
 * as one box, which silently breaks the row's gap and space-between.
 */
export function OgFrame({
  meta,
  children,
  footerStart,
  footerEnd,
}: {
  meta: string;
  children: ReactNode;
  footerStart: ReactNode;
  footerEnd: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: OG.cream,
        color: OG.ink,
        fontFamily: "Geist",
        padding: "56px 72px 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <OgMark />
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>
            HomeCrew
          </div>
        </div>
        <div
          style={{
            fontFamily: "Geist Mono",
            fontSize: 17,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: OG.ink55,
          }}
        >
          {meta}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        {children}
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
          borderTop: `1.5px solid ${OG.ink20}`,
          paddingTop: 26,
        }}
      >
        {footerStart}
        {footerEnd}
      </div>
    </div>
  );
}

export function OgPill({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexShrink: 0,
        marginLeft: "auto",
        alignItems: "center",
        background: OG.ink,
        color: OG.cream,
        borderRadius: 999,
        padding: "16px 28px",
        fontSize: 22,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Serve cached PNG bytes with long-lived CDN headers. Link-preview crawlers
 * (WhatsApp especially) give up after a few seconds, so share cards must never
 * be rendered on the request path.
 */
export function pngResponse(bytes: Uint8Array) {
  return new Response(bytes as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}
