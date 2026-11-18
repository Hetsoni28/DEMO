import type { LucideIcon } from "lucide-react";

/** Editorial stat tile used on inner dashboard pages. */
export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint?: string; icon: LucideIcon }) {
  return (
    <div className="flex min-w-0 flex-col rounded-3xl border border-ink/10 bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink/50">{label}</span>
        <Icon className="h-4 w-4 text-ink/40" />
      </div>
      <div className="mt-4 truncate text-[clamp(1.75rem,2.8vw,2.4rem)] font-black leading-none tracking-tighter text-ink">{value}</div>
      {hint && <div className="mt-2 text-[12.5px] text-ink/55">{hint}</div>}
    </div>
  );
}
