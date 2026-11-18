"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";
import { toast } from "sonner";
import { ArrowRight, Check, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { categoryIcons } from "@/components/atoms/icons";
import { EASE } from "@/components/motion/motion";
import { formatDuration, formatINR, priceBreakdown } from "@/lib/format";
import { getCategory, getService } from "@/lib/mock-data";
import { visitsFor } from "@/lib/scheduling";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

/** UI-only state: whether the basket drawer is open. */
export const useCartUi = create<{ open: boolean; setOpen: (v: boolean) => void }>((set) => ({ open: false, setOpen: (open) => set({ open }) }));

/* ───────────── Add / remove ───────────── */

export function AddToCartButton({ slug, variant = "icon", className }: { slug: string; variant?: "icon" | "full"; className?: string }) {
  const ready = useApp((s) => s.ready);
  const inCart = useApp((s) => s.cart.includes(slug));
  const add = useApp((s) => s.addToCart);
  const remove = useApp((s) => s.removeFromCart);
  const count = useApp((s) => s.cart.length);
  const setOpen = useCartUi((s) => s.setOpen);
  const title = getService(slug)?.title ?? "Service";

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCart) {
      remove(slug);
      toast(`${title} removed from your booking`);
      return;
    }
    add(slug);
    toast.success(`${title} added`, {
      description: `${count + 1} service${count + 1 > 1 ? "s" : ""} in your booking · pay once at checkout`,
      action: { label: "View basket", onClick: () => setOpen(true) },
    });
  };

  if (variant === "full")
    return (
      <button
        type="button"
        disabled={!ready}
        onClick={toggle}
        aria-pressed={inCart}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border text-[14.5px] font-semibold transition-colors disabled:opacity-50",
          inCart ? "border-ink bg-ink text-cream" : "border-ink/20 text-ink hover:border-ink",
          className,
        )}
      >
        {inCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {inCart ? "Added to your booking" : "Add to booking"}
      </button>
    );

  return (
    <button
      type="button"
      disabled={!ready}
      onClick={toggle}
      aria-pressed={inCart}
      aria-label={inCart ? `Remove ${title} from your booking` : `Add ${title} to your booking`}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] disabled:opacity-50",
        inCart ? "border-ink bg-ink text-cream group-hover:border-cream group-hover:bg-cream group-hover:text-ink" : "border-ink/15 text-ink group-hover:border-cream group-hover:text-cream hover:!bg-cream hover:!text-ink",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={inCart ? "in" : "out"} initial={{ scale: 0.4, rotate: -90, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.25 }}>
          {inCart ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/* ───────────── Header button ───────────── */

export function CartButton() {
  const count = useApp((s) => s.cart.length);
  const ready = useApp((s) => s.ready);
  const setOpen = useCartUi((s) => s.setOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Your booking basket${ready && count ? `, ${count} service${count > 1 ? "s" : ""}` : ""}`}
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-ink"
    >
      <ShoppingBag className="h-[18px] w-[18px]" />
      <AnimatePresence>
        {ready && count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10.5px] font-bold text-cream"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/* ───────────── Drawer ───────────── */

export function CartDrawer() {
  const open = useCartUi((s) => s.open);
  const setOpen = useCartUi((s) => s.setOpen);
  const cart = useApp((s) => s.cart);
  const remove = useApp((s) => s.removeFromCart);
  const clear = useApp((s) => s.clearCart);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prev;
    };
  }, [open, setOpen]);

  const items = cart.map((s) => getService(s)).filter((s): s is NonNullable<typeof s> => !!s);
  const base = items.reduce((n, s) => n + s.pricePaise, 0);
  const tax = items.reduce((n, s) => n + priceBreakdown(s.pricePaise).tax, 0);
  const visits = visitsFor(
    items.map((s) => s.slug),
    (x) => getService(x)!.durationMin,
    (x) => getService(x)!.categorySlug,
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Your booking basket">
          <motion.div className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-[min(440px,100vw)] flex-col bg-cream shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-ink/10 px-6 pb-5 pt-6">
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink/50">Your booking</div>
                <h2 className="mt-1 text-[28px] font-black leading-none tracking-[-0.04em]">
                  {items.length ? `${items.length} service${items.length > 1 ? "s" : ""}` : "Basket"}
                </h2>
                {items.length > 1 && (
                  <p className="mt-2 text-[13px] text-ink/60">
                    One visit time · {visits.length} professional{visits.length > 1 ? "s" : ""} · one payment
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close basket" className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 hover:border-ink">
                <X className="h-4 w-4" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBag className="h-10 w-10 text-ink/25" />
                <div className="mt-4 text-[20px] font-bold tracking-[-0.02em]">Nothing added yet</div>
                <p className="mt-1 max-w-xs text-[14px] text-ink/55">Add every job you need done — AC service, a leaking tap, deep cleaning — and pay for all of them at once.</p>
                <Link href="/services" onClick={() => setOpen(false)} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-semibold text-cream">
                  Browse services <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
                  <AnimatePresence initial={false}>
                    {items.map((s) => {
                      const cat = getCategory(s.categorySlug)!;
                      const Icon = categoryIcons[cat.icon];
                      const shared = visits.find((v) => v.category === s.categorySlug)!.slugs.length > 1;
                      return (
                        <motion.li
                          key={s.slug}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="flex items-center gap-3 rounded-[20px] border border-ink/10 bg-paper p-3"
                        >
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="line-clamp-2 text-[14px] font-semibold leading-snug">{s.title}</div>
                            <div className="truncate font-mono text-[11px] text-ink/50">
                              {cat.name} · {formatDuration(s.durationMin)}
                              {shared && " · same pro"}
                            </div>
                          </div>
                          <span className="shrink-0 text-[14px] font-semibold tabular-nums">{formatINR(s.pricePaise)}</span>
                          <button type="button" onClick={() => remove(s.slug)} aria-label={`Remove ${s.title}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/45 hover:bg-ink/5 hover:text-ink">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                  <li>
                    <Link href="/services" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-[20px] border border-dashed border-ink/20 p-3 text-[13.5px] font-medium text-ink/60 hover:border-ink/40 hover:text-ink">
                      <Plus className="h-4 w-4" /> Add another service
                    </Link>
                  </li>
                </ul>

                <footer className="border-t border-ink/10 bg-paper px-6 pb-6 pt-4">
                  <dl className="space-y-1.5 text-[14px]">
                    <div className="flex justify-between text-ink/60">
                      <dt>Services</dt>
                      <dd className="tabular-nums">{formatINR(base)}</dd>
                    </div>
                    <div className="flex justify-between text-ink/60">
                      <dt>GST 18%</dt>
                      <dd className="tabular-nums">{formatINR(tax)}</dd>
                    </div>
                    <div className="flex items-end justify-between pt-1">
                      <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/50">Total · one payment</dt>
                      <dd className="text-[26px] font-black tabular-nums tracking-[-0.03em]">{formatINR(base + tax)}</dd>
                    </div>
                  </dl>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="group mt-4 flex h-[52px] items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-cream"
                  >
                    Checkout · pay once <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                  <button type="button" onClick={clear} className="mt-3 w-full text-center text-[12.5px] text-ink/45 hover:text-ink">
                    Clear basket
                  </button>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
