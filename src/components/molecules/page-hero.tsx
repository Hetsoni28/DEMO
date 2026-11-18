import type { ReactNode } from "react";
import { LineReveal, Reveal } from "@/components/motion/motion";

/** Editorial page header: corner meta, oversized title, mono caption. */
export function PageHero({
  eyebrow,
  index,
  lines,
  caption,
  children,
}: {
  eyebrow: [string, string];
  index: string;
  lines: ReactNode[];
  caption?: string;
  children?: ReactNode;
}) {
  return (
    <section className="grain border-b border-ink/15">
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8">
        <div className="flex justify-between text-[13px]">
          <div>
            <div className="font-medium">{eyebrow[0]}</div>
            <div className="text-ink/60">{eyebrow[1]}</div>
          </div>
          <div className="font-mono text-xs text-ink/50">{index}</div>
        </div>
        <h1 className="mt-14 text-[clamp(3rem,9vw,8rem)] font-black uppercase leading-[0.84] tracking-[-0.06em]">
          <LineReveal lines={lines} />
        </h1>
        {caption && (
          <Reveal delay={0.4} className="mt-6 max-w-2xl font-mono text-[13px] uppercase tracking-[0.06em] text-ink/65">
            {caption}
          </Reveal>
        )}
        {children && (
          <Reveal delay={0.5} className="mt-8">
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
