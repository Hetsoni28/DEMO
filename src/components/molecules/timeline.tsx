import { fmtDateTime } from "@/lib/format";
import { statusLabel } from "./status-badge";
import type { Booking } from "@/lib/store";

export function Timeline({ history }: { history: Booking["history"] }) {
  return (
    <ol className="stagger-fast relative space-y-5 border-l border-slate-200 pl-6">
      {history.map((h, i) => (
        <li key={i} className="relative">
          <span
            className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${i === history.length - 1 ? "bg-teal-brand ring-4 ring-teal-brand/15" : "bg-slate-300"}`}
          />
          <div className="text-sm font-medium text-slate-900">{statusLabel(h.status)}</div>
          {h.note && <div className="text-sm text-slate-500">{h.note}</div>}
          <div className="mt-0.5 text-xs text-slate-400">{fmtDateTime(h.at)}</div>
        </li>
      ))}
    </ol>
  );
}
