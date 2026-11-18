import Link from "next/link";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { ArrowUpRight, BadgeCheck, MapPin, QrCode, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/atoms/logo";
import { BackToTop } from "@/components/molecules/back-to-top";
import { LineReveal, Magnetic, Reveal } from "@/components/motion/motion";
import { legalPages } from "@/lib/legal";
import { SERVICE_AREA } from "@/lib/mock-data";
import { footerColumns } from "@/lib/navigation";
import { siteConfig, type SocialPlatform } from "@/lib/site-config";

const socialIcons: Record<SocialPlatform, { icon: IconType; label: string }> = {
  instagram: { icon: FaInstagram, label: "Instagram" },
  facebook: { icon: FaFacebookF, label: "Facebook" },
  linkedin: { icon: FaLinkedinIn, label: "LinkedIn" },
  x: { icon: FaXTwitter, label: "X" },
  youtube: { icon: FaYoutube, label: "YouTube" },
};

const assurances = [
  { icon: BadgeCheck, title: "Verified professionals", text: "ID & trade documents reviewed" },
  { icon: Wallet, title: "Fixed, upfront pricing", text: "Extras only with your approval" },
  { icon: ShieldCheck, title: "Server-verified payments", text: "Booking confirms after verification" },
  { icon: QrCode, title: "QR-checked visits", text: "Only your assigned pro can start" },
];

export function SiteFooter() {
  const socials = (Object.entries(siteConfig.social) as [SocialPlatform, string | null][]).filter(([, url]) => !!url);
  const { email, phone, address } = siteConfig.contact;
  const hasContact = !!(email || phone || address);

  return (
    <footer className="relative overflow-hidden bg-ink text-cream" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      {/* Closing CTA */}
      <div className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
        <div className="flex flex-col justify-between gap-10 border-b border-cream/15 pb-16 lg:flex-row lg:items-end">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/45">Ready when you are</span>
            <p className="mt-4 max-w-3xl text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.045em]">
              <LineReveal onView lines={["Something broken?", <span key="2" className="text-cream/40">We’ve got a pro.</span>]} />
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/professionals" className="link-underline hidden pb-0.5 text-sm font-medium text-cream/70 hover:text-cream sm:inline">
              Are you a professional? Join us →
            </Link>
            <Magnetic>
              <Link
                href="/services"
                className="group flex h-36 w-36 flex-col items-center justify-center gap-1 rounded-full bg-cream text-center text-sm font-semibold text-ink transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-105"
              >
                <ArrowUpRight className="h-6 w-6 transition-transform duration-500 group-hover:rotate-45" />
                Book now
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* Assurances */}
        <ul className="grid grid-cols-2 gap-px overflow-hidden border-b border-cream/15 lg:grid-cols-4">
          {assurances.map((a, i) => (
            <Reveal as="li" key={a.title} delay={i * 0.06} y={14} className="flex items-start gap-3 py-7 pr-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cream/15">
                <a.icon className="h-[18px] w-[18px]" />
              </span>
              <span>
                <span className="block text-[14px] font-semibold">{a.title}</span>
                <span className="mt-0.5 block text-[12.5px] text-cream/55">{a.text}</span>
              </span>
            </Reveal>
          ))}
        </ul>

        {/* Link grid */}
        <div className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-sm">
            <Logo light />
            <p className="mt-5 text-[14px] leading-relaxed text-cream/60">
              One place for every home service — verified professionals, real availability, fixed prices and a record of every job.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cream/15 px-3.5 py-1.5 text-[12px] text-cream/75">
              <MapPin className="h-3.5 w-3.5" /> Serving {SERVICE_AREA.zones.length} areas in {SERVICE_AREA.city}
            </div>

            <div className="mt-6 space-y-1.5 text-[14px]">
              {hasContact ? (
                <>
                  {email && (
                    <a href={`mailto:${email}`} className="link-underline block w-fit pb-0.5 text-cream/80 hover:text-cream">
                      {email}
                    </a>
                  )}
                  {phone && (
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="link-underline block w-fit pb-0.5 text-cream/80 hover:text-cream">
                      {phone}
                    </a>
                  )}
                  {address && <p className="text-cream/55">{address}</p>}
                </>
              ) : (
                <Link href="/contact" className="link-underline pb-0.5 text-cream/80 hover:text-cream">
                  Contact support →
                </Link>
              )}
            </div>

            {socials.length > 0 && (
              <ul className="mt-6 flex gap-2" aria-label="PipePilot on social media">
                {socials.map(([key, url]) => {
                  const { icon: Icon, label } = socialIcons[key];
                  return (
                    <li key={key}>
                      <a
                        href={url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-cream hover:bg-cream hover:text-ink"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:contents">
            {footerColumns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-cream/40">{c.title}</h3>
                <ul className="mt-5 space-y-3 text-[14px]">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link-underline pb-0.5 text-cream/75 transition-colors hover:text-cream">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* Wordmark */}
      <div aria-hidden className="pointer-events-none select-none px-3 text-center text-[clamp(4rem,19.5vw,19rem)] font-black leading-[0.78] tracking-[-0.06em] text-cream/[0.07]">
        PIPEPILOT
      </div>

      {/* Legal bar */}
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] uppercase tracking-[0.14em] text-cream/45">
            © {siteConfig.copyrightYear} PipePilot · All rights reserved · Demo build — no real payments
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalPages.slice(0, 2).map((l) => (
              <Link key={l.slug} href={`/legal/${l.slug}`} className="text-[11px] uppercase tracking-[0.14em] text-cream/45 hover:text-cream">
                {l.title}
              </Link>
            ))}
            <BackToTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
