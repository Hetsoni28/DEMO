"use client";

/**
 * Small building blocks for the customer + pro apps (Blinkit/Zepto style):
 * segmented tabs, a section card, key/value rows, a back header and a phone action bar.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { id: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cn("no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0", className)}>
      {items.map((x) => {
        const on = x.id === value;
        return (
          <button
            key={x.id}
            onClick={() => onChange(x.id)}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[13px] font-semibold transition-colors",
              on ? "border-ink bg-ink text-cream" : "border-ink/10 bg-white text-ink/70 hover:border-ink/30",
            )}
          >
            {x.label}
            {x.count !== undefined && (
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", on ? "bg-cream/20 text-cream" : "bg-ink/6 text-ink/55")}>{x.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
  className,
  tone = "white",
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: "white" | "amber" | "ink";
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-4",
        tone === "white" && "border-ink/8 bg-white",
        tone === "amber" && "border-amber-200 bg-amber-50",
        tone === "ink" && "border-ink bg-ink text-cream",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h3 className={cn("text-[15px] font-bold tracking-tight", tone === "ink" ? "text-cream" : "text-ink")}>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Row({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 py-1 text-[13.5px]", strong ? "font-bold text-ink" : "text-ink/65")}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function BackHeader({ href, label, title, meta, badge }: { href: string; label: string; title: string; meta?: ReactNode; badge?: ReactNode }) {
  return (
    <div className="mb-4">
      <Link href={href} className="mb-3 inline-flex h-8 items-center gap-1 rounded-full border border-ink/10 bg-white pl-1.5 pr-3 text-[12.5px] font-semibold text-ink/70 hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> {label}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-ink">{title}</h1>
        {badge}
      </div>
      {meta && <p className="mt-1 text-[13px] text-ink/55">{meta}</p>}
    </div>
  );
}

const noop = () => () => {};

/**
 * Inline card on desktop; on phones it is pinned just above the bottom tab bar.
 * The phone copy is portalled to <body> because page transitions put a transform on
 * the page wrapper, which would otherwise trap `position: fixed` inside it.
 */
export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const bar = "flex items-center gap-2 rounded-2xl border border-ink/8 bg-white p-2";
  return (
    <>
      <div className={cn(bar, className, "hidden lg:flex")}>{children}</div>
      <div className="h-20 lg:hidden" aria-hidden />
      {mounted &&
        createPortal(
          <div data-app className="fixed inset-x-0 bottom-[calc(6.4rem+env(safe-area-inset-bottom))] z-40 px-3 lg:hidden">
            <div className={cn("mx-auto max-w-xl shadow-[0_12px_32px_-12px_rgba(40,43,74,0.4)]", bar, className)}>{children}</div>
          </div>,
          document.body,
        )}
    </>
  );
}

export function Empty({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 px-6 py-12 text-center">
      {icon && <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-ink/60">{icon}</div>}
      <div className="text-[15px] font-bold text-ink">{title}</div>
      {text && <p className="mx-auto mt-1 max-w-xs text-[13px] text-ink/55">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
