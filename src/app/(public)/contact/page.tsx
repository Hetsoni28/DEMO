import type { Metadata } from "next";
import { PageHero } from "@/components/molecules/page-hero";
import { siteConfig } from "@/lib/site-config";
import { ContactExperience } from "./contact-experience";
import { LiveStatus } from "./live-status";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get help with a booking, a payment or joining HomeCrew as a professional. Real people, fast replies.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { email, phone } = siteConfig.contact;
  return (
    <>
      <PageHero eyebrow={["Contact", "Real people · fast replies"]} index="(C)" lines={["Let’s talk", "home."]} caption="Bookings · Refunds · Professional partners · Business">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <LiveStatus />
          {email && (
            <a href={`mailto:${email}`} className="link-underline pb-0.5 text-[14px] font-medium">
              {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="link-underline pb-0.5 text-[14px] font-medium">
              {phone}
            </a>
          )}
        </div>
      </PageHero>
      <ContactExperience />
    </>
  );
}
