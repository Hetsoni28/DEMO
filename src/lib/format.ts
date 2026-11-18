import { GST_RATE, type PricingType } from "./mock-data";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatINR(paise: number) {
  return inr.format(Math.round(paise / 100));
}

export function priceLabel(paise: number, type: PricingType) {
  if (type === "STARTING") return `From ${formatINR(paise)}`;
  if (type === "INSPECTION") return `${formatINR(paise)} visit`;
  return formatINR(paise);
}

export function pricingTypeLabel(type: PricingType) {
  return type === "FIXED" ? "Fixed price" : type === "STARTING" ? "Starting price" : "Inspection + quote";
}

/** Trusted price breakdown (in the real app this runs on the server only). */
export function priceBreakdown(basePaise: number) {
  const tax = Math.round(basePaise * GST_RATE);
  return { base: basePaise, tax, total: basePaise + tax };
}

export function formatDuration(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const TZ = "Asia/Kolkata";

export function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: TZ }).format(new Date(iso));
}
export function fmtTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ }).format(new Date(iso));
}
export function fmtDateTime(iso: string) {
  return `${fmtDate(iso)}, ${fmtTime(iso)}`;
}
