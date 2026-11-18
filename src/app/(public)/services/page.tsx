import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ServiceBrowser } from "@/components/organisms/service-browser";
import { Skeleton } from "@/components/atoms/ui";
import { PageHero } from "@/components/molecules/page-hero";
import { services } from "@/lib/mock-data";

export const metadata: Metadata = pageMetadata({
  title: "Home services",
  description: `Browse ${services.length} home services across plumbing, electrical, cleaning, AC & appliances, carpentry, painting and pest control — fixed prices and real time slots in Ahmedabad.`,
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow={["Service catalogue", `${services.length} services · Ahmedabad`]}
        index="(01)"
        lines={["Every fix,", "priced upfront."]}
        caption="Price : fixed or starting · Duration : estimated · Warranty : included"
      />
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-72 rounded-[28px]" />
              ))}
            </div>
          }
        >
          <ServiceBrowser />
        </Suspense>
      </div>
    </>
  );
}
