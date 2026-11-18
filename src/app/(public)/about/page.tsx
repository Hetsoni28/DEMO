import type { Metadata } from "next";
import { PageHero } from "@/components/molecules/page-hero";
import { LineReveal, Reveal } from "@/components/motion/motion";

export const metadata: Metadata = { title: "About" };

const values = [
  { k: "Specialists only", v: "One standard across seven trades. Every professional is verified for identity, trade skills and background before taking a job." },
  { k: "Real availability", v: "Slots come from each professional's hours, breaks, existing jobs and travel time — so the time you book is the time they arrive." },
  { k: "Honest pricing", v: "Prices are set by us, never typed in by anyone at checkout. Extra work always needs your approval first." },
  { k: "Accountable visits", v: "A one-time service QR, before/after photos and a job report make every visit traceable." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow={["About PipePilot", "Ahmedabad, 2026"]} index="(02)" lines={["Home services,", "done properly."]} caption="Started in one city on purpose · Growing only when it works" />
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <h2 className="max-w-4xl text-[clamp(1.75rem,3.6vw,3rem)] font-semibold leading-[1.1] tracking-[-0.035em]">
          <LineReveal
            onView
            lines={["We believe calling for help at home shouldn’t feel", "like a gamble. So we rebuilt the whole visit —", <span key="3" className="text-ink/40">from booking to the final invoice.</span>]}
          />
        </h2>
        <div className="mt-20 grid grid-cols-1 border-l border-t border-ink/20 sm:grid-cols-2">
          {values.map((v, i) => (
            <Reveal key={v.k} delay={i * 0.06} className="border-b border-r border-ink/20 p-8 sm:p-10">
              <span className="font-mono text-xs text-ink/50">(0{i + 1})</span>
              <h3 className="mt-6 text-3xl font-bold tracking-[-0.035em]">{v.k}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-ink/70">{v.v}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
