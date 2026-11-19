import { fmtDateTime } from "@/lib/format";
import { statusLabel } from "./status-badge";
import type { Booking } from "@/lib/store";

export function Timeline({ history }: { history: Booking["history"] }) {
  return (
    <ol className="stagger-fast relative space-y-5 border-l border-slate-200 pl-6 in-data-app:space-y-4 in-data-app:border-ink/12">
      {history.map((h, i) => (
        <li key={i} className="relative">
          <span
            className={`absolute -left-7.75 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${i === history.length - 1 ? "bg-teal-brand ring-4 ring-teal-brand/15 in-data-app:bg-emerald-600 in-data-app:ring-emerald-600/15" : "bg-slate-300 in-data-app:bg-ink/25"}`}
          />
          <div className="text-sm font-medium text-slate-900 in-data-app:text-[13.5px] in-data-app:font-semibold in-data-app:text-ink">{statusLabel(h.status)}</div>
          {h.note && <div className="text-sm text-slate-500 in-data-app:text-[13px] in-data-app:text-ink/60">{h.note}</div>}
          <div className="mt-0.5 text-xs text-slate-400 in-data-app:text-[11.5px] in-data-app:text-ink/40">{fmtDateTime(h.at)}</div>
        </li>
      ))}
    </ol>
  );
}
