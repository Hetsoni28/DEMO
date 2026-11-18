import { ImageResponse } from "next/og";
import { OG, OgFrame, OgPill, ogFonts } from "@/lib/og";
import { formatDuration, priceLabel, pricingTypeLabel } from "@/lib/format";
import {
  getCategory,
  getService,
  GST_RATE,
  SERVICE_AREA,
  services,
} from "@/lib/mock-data";

export const alt = "HomeCrew service — price, duration and warranty";
export const size = OG.size;
export const contentType = "image/png";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

/** Per-service share card. Every figure comes from the same data the page renders. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  const fonts = await ogFonts();

  if (!service) {
    return new ImageResponse(
      <OgFrame
        meta={`Home services · ${SERVICE_AREA.city}`}
        footerStart={<div style={{ display: "flex" }} />}
        footerEnd={<OgPill>Browse all services</OgPill>}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: -5,
            textTransform: "uppercase",
          }}
        >
          Service not found.
        </div>
      </OgFrame>,
      { ...size, fonts },
    );
  }

  const cat = getCategory(service.categorySlug);
  const titleSize =
    service.title.length > 24 ? 84 : service.title.length > 16 ? 100 : 116;
  const stats: [string, string, string?][] = [
    [
      pricingTypeLabel(service.pricingType),
      priceLabel(service.pricePaise, service.pricingType),
      `+ ${GST_RATE * 100}% GST`,
    ],
    ["Duration", formatDuration(service.durationMin)],
    ...(service.warrantyDays
      ? [["Warranty", `${service.warrantyDays} days`] as [string, string]]
      : []),
    [
      "Rating",
      `${service.rating.toFixed(1)} / 5`,
      `${service.reviews.toLocaleString("en-IN")} reviews`,
    ],
  ];

  return new ImageResponse(
    <OgFrame
      meta={`${cat?.name ?? "Home services"} · ${SERVICE_AREA.city}`}
      footerStart={
        <div style={{ display: "flex", gap: 40 }}>
          {stats.map(([label, value, sub]) => (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  fontFamily: "Geist Mono",
                  fontSize: 14,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: OG.ink55,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 36,
                  fontWeight: 600,
                  letterSpacing: -1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  marginTop: 2,
                  fontSize: 16,
                  color: OG.ink55,
                  minHeight: 20,
                }}
              >
                {sub ?? ""}
              </div>
            </div>
          ))}
        </div>
      }
      footerEnd={<OgPill>Book on HomeCrew</OgPill>}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: -titleSize * 0.05,
            textTransform: "uppercase",
            maxWidth: 1056,
          }}
        >
          {service.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 28,
            fontWeight: 600,
            lineHeight: 1.3,
            color: OG.ink55,
            maxWidth: 900,
          }}
        >
          {service.short}
        </div>
      </div>
    </OgFrame>,
    { ...size, fonts },
  );
}
