import { categories, SERVICE_AREA } from "./mock-data";
import { dayKey, upcomingDays } from "./scheduling";
import type { Booking } from "./store";

/**
 * Admin analytics for the demo. The demo store only holds a handful of bookings,
 * so charts layer a deterministic SAMPLE history underneath the real ones.
 * Every chart that uses it is labelled "includes sample history".
 */

// Small deterministic PRNG so the sample history is stable across renders/reloads.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const keyNum = (key: string) => Number(key.replaceAll("-", ""));

export type DayPoint = {
  key: string;
  date: Date;
  revenue: number;
  bookings: number;
  completed: number;
  closed: number;
  sample: boolean;
};

export function dailySeries(
  bookings: Booking[],
  days: number,
  now: number,
): DayPoint[] {
  const span = upcomingDays(days, new Date(now - (days - 1) * 86_400_000));
  const todayKey = dayKey(new Date(now));
  return span.map((d) => {
    const rnd = mulberry32(keyNum(d.key));
    const weekday = d.date.getUTCDay();
    const weekend = weekday === 0 || weekday === 6;
    // Sample: 7–17 bookings/day, busier at weekends; today's sample is partial.
    const isToday = d.key === todayKey;
    const sampleBookings = Math.round(
      (7 + rnd() * 8 + (weekend ? 3 : 0)) * (isToday ? 0.45 : 1),
    );
    const avg = 72000 + rnd() * 48000; // ₹720–1,200 average order (paise)
    const sampleClosed = Math.round(sampleBookings * (0.85 + rnd() * 0.1));
    const sampleCompleted = Math.round(sampleClosed * (0.9 + rnd() * 0.08));

    const real = bookings.filter(
      (b) => dayKey(new Date(b.createdAt)) === d.key,
    );
    const realPaid = real.filter((b) =>
      ["CAPTURED", "REFUND_PENDING", "REFUNDED"].includes(b.payment.status),
    );
    const realRevenue = real
      .filter((b) => b.payment.status === "CAPTURED")
      .reduce((n, b) => n + b.amounts.total, 0);
    const realClosed = real.filter((b) =>
      ["COMPLETED", "CANCELLED", "EXPIRED"].includes(b.status),
    );

    return {
      key: d.key,
      date: d.date,
      bookings: sampleBookings + realPaid.length,
      revenue: Math.round(sampleBookings * avg) + realRevenue,
      closed: sampleClosed + realClosed.length,
      completed:
        sampleCompleted +
        realClosed.filter((b) => b.status === "COMPLETED").length,
      sample: true,
    };
  });
}

export function summarize(points: DayPoint[]) {
  const revenue = points.reduce((n, p) => n + p.revenue, 0);
  const bookings = points.reduce((n, p) => n + p.bookings, 0);
  const closed = points.reduce((n, p) => n + p.closed, 0);
  const completed = points.reduce((n, p) => n + p.completed, 0);
  return {
    revenue,
    bookings,
    aov: bookings ? Math.round(revenue / bookings) : 0,
    completion: closed ? Math.round((completed / closed) * 100) : 0,
  };
}

export const delta = (cur: number, prev: number) =>
  prev ? Math.round(((cur - prev) / prev) * 100) : 0;

/** Zone demand: sample share per zone + real active bookings. */
export function zoneLoad(bookings: Booking[], totalSampleBookings: number) {
  const weights = [1.25, 1.4, 1.15, 1.05, 0.95, 0.9, 1.1, 0.8];
  const wSum = weights.reduce((a, b) => a + b, 0);
  return SERVICE_AREA.zones.map((zone, i) => {
    const sample = Math.round((weights[i] / wSum) * totalSampleBookings);
    const live = bookings.filter(
      (b) =>
        b.zone === zone &&
        ["CONFIRMED", "ASSIGNED", "IN_PROGRESS"].includes(b.status),
    ).length;
    return {
      zone,
      bookings: sample + bookings.filter((b) => b.zone === zone).length,
      live,
    };
  });
}

/** Category mix for the period: sample split + real paid bookings. */
export function categoryMix(
  bookings: Booking[],
  totalSampleBookings: number,
  serviceCategory: (slug: string) => string | undefined,
) {
  const shares: Record<string, number> = {
    plumbing: 0.22,
    electrical: 0.16,
    cleaning: 0.24,
    appliances: 0.2,
    carpentry: 0.07,
    painting: 0.05,
    "pest-control": 0.06,
  };
  return categories.map((c) => ({
    c,
    n:
      Math.round((shares[c.slug] ?? 0.05) * totalSampleBookings) +
      bookings.filter(
        (b) =>
          serviceCategory(b.serviceSlug) === c.slug &&
          ["CAPTURED", "REFUND_PENDING", "REFUNDED"].includes(b.payment.status),
      ).length,
  }));
}
