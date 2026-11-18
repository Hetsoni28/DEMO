/**
 * Support desk configuration. Hours are a SAMPLE schedule for the demo —
 * replace with real operating hours before launch.
 */
export const SUPPORT_HOURS: { day: string; open: number | null; close: number | null }[] = [
  { day: "Sunday", open: 9, close: 18 },
  { day: "Monday", open: 8, close: 21 },
  { day: "Tuesday", open: 8, close: 21 },
  { day: "Wednesday", open: 8, close: 21 },
  { day: "Thursday", open: 8, close: 21 },
  { day: "Friday", open: 8, close: 21 },
  { day: "Saturday", open: 8, close: 21 },
];

export const SUPPORT_TIMEZONE = "Asia/Kolkata";

export function hourLabel(h: number) {
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:00 ${suffix}`;
}

/** Current weekday (0 = Sunday) and fractional hour in IST. */
export function istNow(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: SUPPORT_TIMEZONE, weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(d);
  const wd = parts.find((p) => p.type === "weekday")!.value;
  const h = Number(parts.find((p) => p.type === "hour")!.value) % 24;
  const m = Number(parts.find((p) => p.type === "minute")!.value);
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
  return { day, hour: h + m / 60 };
}

export function supportStatus(d = new Date()) {
  const { day, hour } = istNow(d);
  const today = SUPPORT_HOURS[day];
  if (today.open !== null && today.close !== null && hour >= today.open && hour < today.close) {
    return { open: true as const, day, label: "Online now", detail: "Typical reply in about 2 hours" };
  }
  // find next opening
  for (let i = 0; i < 7; i++) {
    const idx = (day + i) % 7;
    const slot = SUPPORT_HOURS[idx];
    if (slot.open === null) continue;
    if (i === 0 && hour < slot.open) return { open: false as const, day, label: "Offline", detail: `Back today at ${hourLabel(slot.open)}` };
    if (i > 0) return { open: false as const, day, label: "Offline", detail: `Back ${i === 1 ? "tomorrow" : SUPPORT_HOURS[idx].day} at ${hourLabel(slot.open)}` };
  }
  return { open: false as const, day, label: "Offline", detail: "We’ll reply as soon as we’re back" };
}
