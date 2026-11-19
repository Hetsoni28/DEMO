"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { categoryIcons } from "@/components/atoms/icons";
import { EASE } from "@/components/motion/motion";
import { ServiceTile } from "@/components/molecules/service-tile";
import { categories, services } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** In-app catalogue (Blinkit style): trade chips, search, equal-size tiles with ADD. */
export function AppServicesBrowser() {
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
    return services.filter((s) => (!category || s.categorySlug === category) && (!term || `${s.title} ${s.short} ${s.description}`.toLowerCase().includes(term)));
  }, [q, category]);

  const active = categories.find((c) => c.slug === category);

  return (
    <>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-bold leading-tight tracking-tight text-ink">{active ? active.name : "All services"}</h1>
          <p className="mt-0.5 text-[14px] text-ink/60">{active ? active.blurb : "Verified pros · prices shown before you book"}</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
          <input
            key={q}
            defaultValue={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search services"
            aria-label="Search services"
            className="h-11 w-full rounded-xl border border-ink/10 bg-white pl-10 pr-9 text-[14px] outline-none transition-colors focus:border-ink/35"
          />
          {q && (
            <button type="button" onClick={() => update("q", "")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink/45 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* trade chips — sticky under the app header */}
      <div className="sticky top-[calc(7.25rem+env(safe-area-inset-top))] z-20 -mx-4 mt-4 border-b border-ink/6 bg-cream/95 px-4 py-2.5 backdrop-blur lg:top-28 lg:mx-0 lg:rounded-2xl lg:border lg:px-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="tablist" aria-label="Trades">
          {[{ slug: "", name: "All", icon: null as null | keyof typeof categoryIcons }, ...categories].map((c) => {
            const on = category === c.slug;
            const Icon = c.icon ? categoryIcons[c.icon] : null;
            return (
              <button
                key={c.slug || "all"}
                role="tab"
                aria-selected={on}
                onClick={() => update("category", c.slug)}
                className={cn("relative flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors", on ? "border-ink text-cream" : "border-ink/12 bg-white text-ink/75 hover:border-ink/30")}
              >
                {on && <motion.span layoutId="svc-chip" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.35, ease: EASE }} />}
                {Icon && <Icon className="relative h-3.5 w-3.5" />}
                <span className="relative">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-[12.5px] text-ink/50">
        {list.length} {list.length === 1 ? "service" : "services"}
        {q ? ` for “${q}”` : ""}
      </div>

      {list.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((s) => (
            <ServiceTile key={s.slug} service={s} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-white p-10 text-center">
          <div className="text-[16px] font-bold text-ink">Nothing matches “{q}”</div>
          <p className="mt-1 text-[13.5px] text-ink/55">Try “leak”, “fan” or “cleaning”.</p>
        </div>
      )}
    </>
  );
}
