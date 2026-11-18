import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/molecules/page-hero";
import { CountUp, Magnetic, Reveal } from "@/components/motion/motion";

export const metadata: Metadata = { title: "Join as a professional" };

const steps = [
  { title: "Register & upload documents", text: "ID, trade certificate and police verification — stored in a private bucket." },
  { title: "Get verified", text: "Our team reviews your documents and activates your profile." },
  { title: "Set skills, zones & hours", text: "Only jobs that match your skills, areas and schedule reach you." },
  { title: "Scan, fix, report", text: "Scan the customer's QR to start, upload photos and complete the job." },
  { title: "Get paid", text: "Every job is pre-paid by the customer. Track earnings in the app." },
];

export default function ProfessionalsPage() {
  return (
    <>
      <PageHero eyebrow={["For professionals", "Plumbers · Electricians · Cleaners · Technicians"]} index="(04)" lines={["Fix more.", "Chase less."]} caption="Jobs : pre-paid · Hours : yours · Zones : yours">
        <div className="flex flex-wrap items-center gap-4">
          <Magnetic strength={0.2}>
            <Link href="/register?role=professional" className="group inline-flex h-14 items-center gap-3 rounded-full bg-ink pl-7 pr-2 font-medium text-cream">
              Apply now
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-ink transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </Magnetic>
          <Link href="/professional/dashboard" className="link-underline pb-0.5 text-sm font-medium">
            Preview the professional app →
          </Link>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <ol className="border-t border-ink/20">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.05} className="grid grid-cols-1 gap-3 border-b border-ink/20 py-8 md:grid-cols-[100px_1fr_1fr] md:items-baseline">
              <span className="text-5xl font-black tracking-[-0.06em] text-ink/25">0{i + 1}</span>
              <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold leading-none tracking-[-0.04em]">{s.title}</h3>
              <p className="text-ink/70">{s.text}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-20 grid grid-cols-1 gap-4 rounded-[36px] bg-ink p-8 text-cream sm:grid-cols-3 sm:p-12">
          {[
            { to: 60, suffix: "+", label: "Jobs / month (avg)" },
            { to: 80, suffix: "%", label: "Payout of service fee" },
            { to: 0, prefix: "₹", label: "Joining fee" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-[clamp(3rem,6vw,5rem)] font-black leading-none tracking-[-0.06em]">
                <CountUp to={s.to} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div className="mt-2 text-sm text-cream/60">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
