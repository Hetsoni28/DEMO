import { ImageResponse } from "next/og";
import { OG, OgFrame, OgPill, ogFonts } from "@/lib/og";
import { categories, SERVICE_AREA } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site-config";

export const alt = `${siteConfig.name} — Home problems. Professionally solved. Verified professionals for every home service in ${SERVICE_AREA.city}.`;
export const size = OG.size;
export const contentType = "image/png";

/** Site-wide share card — used by every page without a more specific image. */
export default async function Image() {
  return new ImageResponse(
    <OgFrame
      meta={`Home services · ${SERVICE_AREA.city}`}
      footerStart={
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 10, maxWidth: 640 }}
        >
          {categories.map((c) => (
            <div
              key={c.slug}
              style={{
                display: "flex",
                border: `1.5px solid ${OG.ink20}`,
                borderRadius: 999,
                padding: "8px 16px",
                fontFamily: "Geist Mono",
                fontSize: 15,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: OG.ink55,
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
      }
      footerEnd={<OgPill>Verified pros · Fixed prices</OgPill>}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 104,
          fontWeight: 900,
          lineHeight: 0.9,
          letterSpacing: -5,
          textTransform: "uppercase",
        }}
      >
        <div style={{ display: "flex" }}>Home problems.</div>
        <div style={{ display: "flex", color: OG.ink40 }}>Professionally</div>
        <div style={{ display: "flex", color: OG.ink40 }}>solved.</div>
      </div>
    </OgFrame>,
    { ...size, fonts: await ogFonts() },
  );
}
