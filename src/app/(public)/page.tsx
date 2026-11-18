import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { IntroProvider } from "@/components/home/intro";
import { INTRO_SEEN_SCRIPT } from "@/lib/intro";
import { InlineScript } from "@/components/atoms/inline-script";
import { HowItWorks, Numbers, ProCta, ServiceIndex, Split, Trust, Voices } from "@/components/home/sections";
import { Faq, Passport, PriceApproval, SectionLabel } from "@/components/home/signature";
import { LineReveal, Reveal } from "@/components/motion/motion";
import { ServiceCard } from "@/components/molecules/service-card";
import { services } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site-config";

const title = `${siteConfig.name} — ${siteConfig.tagline}`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: siteConfig.name, title, description: siteConfig.description, locale: "en_IN" },
  twitter: { card: "summary", title, description: siteConfig.description },
};

export default function Home() {
  const popular = services.filter((s) => s.popular);
  return (
    <IntroProvider>
      {/* Hides the intro before first paint for visitors who already saw it this session. */}
      <InlineScript html={INTRO_SEEN_SCRIPT} />
      <Hero />
      <Split />
      <ServiceIndex />
      <HowItWorks />

      <section className="grain mx-auto max-w-7xl px-5 pt-28 sm:px-8">
        <SectionLabel index="05" title="Most booked" note="This week" />
        <div className="mt-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.045em]">
            <LineReveal onView lines={["Most booked", "this week"]} />
          </h2>
          <Link href="/services" className="group inline-flex items-center gap-2 text-sm font-medium">
            <span className="link-underline pb-0.5">All services</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
          </Link>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((s, i) => (
            <Reveal key={s.slug} delay={i * 0.08} className="h-full">
              <ServiceCard service={s} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      <PriceApproval />
      <Passport />
      <Numbers />
      <Trust />
      <Voices />
      <Faq />
      <ProCta />
    </IntroProvider>
  );
}
