"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { ServiceCard } from "@/components/molecules/service-card";
import { EASE } from "@/components/motion/motion";
import { categories, services } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ServiceBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const list = useMemo(() => {
    const term = q.toLowerCase().trim();
    return services.filter(
      (s) => (!category || s.categorySlug === category) && (!term || `${s.title} ${s.short} ${s.description}`.toLowerCase().includes(term)),
    );
  }, [q, category]);

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
          {[{ slug: "", name: "All" }, ...categories].map((c) => {
            const on = category === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => update("category", c.slug)}
                className={cn("relative shrink-0 rounded-full border px-4 py-2 text-sm transition-colors", on ? "border-ink text-cream" : "border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink")}
              >
                {on && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: EASE }} />}
                <span className="relative">{c.name}</span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full lg:max-w-xs">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            defaultValue={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search services"
            aria-label="Search services"
            className="h-11 w-full rounded-full border border-ink/15 bg-paper pl-10 pr-4 text-sm outline-none transition focus:border-ink/40 focus:shadow-[0_0_0_4px_rgba(40,43,74,0.08)]"
          />
        </div>
      </div>

      <div className="mt-4 font-mono text-xs text-ink/50">
        {list.length} result{list.length === 1 ? "" : "s"}
      </div>

      <motion.div layout className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s, i) => (
            <motion.div
              key={s.slug}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.03 }}
            >
              <ServiceCard service={s} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && (
        <div className="mt-6 rounded-[28px] border border-dashed border-ink/25 p-14 text-center">
          <div className="text-3xl font-bold tracking-[-0.03em]">Nothing matches “{q}”.</div>
          <p className="mt-2 text-ink/60">Try “leak”, “drain” or “geyser”.</p>
        </div>
      )}
    </div>
  );
}
