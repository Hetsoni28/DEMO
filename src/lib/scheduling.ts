// Demo scheduling engine. Mirrors the blueprint rules (status, skill, hours,
// breaks, existing bookings/holds, duration + travel buffer) entirely in the browser.
// In production this check is repeated on the server inside a DB transaction.
import { professionals as seedPros, TRAVEL_BUFFER_MIN, type Professional } from "./mock-data";
import type { Booking } from "./store";

const TZ = "Asia/Kolkata";

/** YYYY-MM-DD for a date in the service-area timezone. */
export function dayKey(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** A UTC Date for a wall-clock time in IST (India has no DST, so +05:30 is constant). */
export function istDate(key: string, minutesFromMidnight: number) {
  const h = String(Math.floor(minutesFromMidnight / 60)).padStart(2, "0");
  const m = String(minutesFromMidnight % 60).padStart(2, "0");
  return new Date(`${key}T${h}:${m}:00+05:30`);
}

/** Hour of day (0-23) in IST. */
export function istHour(d: Date) {
  return Math.floor(((d.getUTCHours() * 60 + d.getUTCMinutes() + 330) % 1440) / 60);
}

export function upcomingDays(count: number, from = new Date()) {
  const out: { key: string; date: Date }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(from.getTime() + i * 86_400_000);
    const key = dayKey(d);
    out.push({ key, date: istDate(key, 12 * 60) });
  }
  return out;
}

export const ACTIVE_STATUSES: Booking["status"][] = ["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"];

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export type Slot = { start: Date; end: Date; reservedEnd: Date; freePros: string[] };

export function eligiblePros(serviceSlug: string, pros: Professional[] = seedPros) {
  return pros.filter((p) => p.verification === "VERIFIED" && p.active && p.skills.includes(serviceSlug));
}

export function computeSlots(opts: {
  serviceSlug: string;
  durationMin: number;
  key: string;
  bookings: Booking[];
  pros?: Professional[];
  now?: Date;
}): Slot[] {
  const { serviceSlug, durationMin, key, bookings } = opts;
  const now = (opts.now ?? new Date()).getTime();
  const pros = eligiblePros(serviceSlug, opts.pros);
  const weekday = istDate(key, 12 * 60).getUTCDay();
  const reserved = durationMin + TRAVEL_BUFFER_MIN; // buffer applied after each job
  const slots: Slot[] = [];

  for (let t = 7 * 60; t <= 21 * 60; t += 30) {
    const start = istDate(key, t);
    const end = new Date(start.getTime() + durationMin * 60_000);
    const reservedEnd = new Date(start.getTime() + reserved * 60_000);
    if (start.getTime() < now + 60 * 60_000) continue; // 1 h minimum lead time

    const free = pros.filter((p) => {
      if (p.offDays.includes(weekday)) return false;
      if (t < p.hours.start * 60 || t + durationMin > p.hours.end * 60) return false;
      if (overlaps(t, t + durationMin, p.hours.breakStart * 60, p.hours.breakEnd * 60)) return false;
      return !bookings.some(
        (b) =>
          b.professionalId === p.id &&
          ACTIVE_STATUSES.includes(b.status) &&
          !(b.status === "PENDING_PAYMENT" && b.holdExpiresAt && new Date(b.holdExpiresAt).getTime() < now) &&
          overlaps(start.getTime(), reservedEnd.getTime(), new Date(b.start).getTime(), new Date(b.reservedEnd).getTime()),
      );
    });
    if (free.length) slots.push({ start, end, reservedEnd, freePros: free.map((p) => p.id) });
  }
  return slots;
}

/* ───────────── Multi-service (basket) scheduling ───────────── */

/** One visit = all basket services of the same trade, done back-to-back by one professional. */
export type Visit = { category: string; slugs: string[]; durationMin: number };

export function visitsFor(slugs: string[], durationOf: (slug: string) => number, categoryOf: (slug: string) => string): Visit[] {
  const map = new Map<string, Visit>();
  for (const slug of slugs) {
    const cat = categoryOf(slug);
    const v = map.get(cat) ?? { category: cat, slugs: [], durationMin: 0 };
    v.slugs.push(slug);
    v.durationMin += durationOf(slug);
    map.set(cat, v);
  }
  return [...map.values()];
}

export type CartAssignment = { visit: Visit; proId: string; items: { slug: string; start: Date; end: Date; reservedEnd: Date }[] };
export type CartSlot = { start: Date; end: Date; assignments: CartAssignment[] };

/**
 * Start times at which EVERY visit can be staffed: each visit gets a distinct verified,
 * active professional who has all of that visit's skills and is free (hours, breaks,
 * existing jobs/holds + travel buffer) for the whole visit. Visits run in parallel.
 */
export function computeCartSlots(opts: {
  slugs: string[];
  durationOf: (slug: string) => number;
  categoryOf: (slug: string) => string;
  key: string;
  bookings: Booking[];
  pros?: Professional[];
  now?: Date;
}): CartSlot[] {
  const { slugs, key, bookings } = opts;
  if (!slugs.length) return [];
  const now = (opts.now ?? new Date()).getTime();
  const allPros = opts.pros ?? seedPros;
  const weekday = istDate(key, 12 * 60).getUTCDay();
  // Hardest-to-staff visits first so scarce professionals aren't used up by easy ones.
  const visits = visitsFor(slugs, opts.durationOf, opts.categoryOf)
    .map((v) => ({ v, pool: allPros.filter((p) => p.verification === "VERIFIED" && p.active && v.slugs.every((s) => p.skills.includes(s))) }))
    .sort((a, b) => a.pool.length - b.pool.length);
  if (visits.some((x) => x.pool.length === 0)) return [];

  const busy = (proId: string, from: number, to: number) =>
    bookings.some(
      (b) =>
        b.professionalId === proId &&
        ACTIVE_STATUSES.includes(b.status) &&
        !(b.status === "PENDING_PAYMENT" && b.holdExpiresAt && new Date(b.holdExpiresAt).getTime() < now) &&
        overlaps(from, to, new Date(b.start).getTime(), new Date(b.reservedEnd).getTime()),
    );

  const slots: CartSlot[] = [];
  for (let t = 7 * 60; t <= 21 * 60; t += 30) {
    const start = istDate(key, t);
    if (start.getTime() < now + 60 * 60_000) continue; // 1 h minimum lead time
    const used = new Set<string>();
    const assignments: CartAssignment[] = [];
    let ok = true;

    for (const { v, pool } of visits) {
      const visitEnd = start.getTime() + v.durationMin * 60_000;
      const pro = pool.find(
        (p) =>
          !used.has(p.id) &&
          !p.offDays.includes(weekday) &&
          t >= p.hours.start * 60 &&
          t + v.durationMin <= p.hours.end * 60 &&
          !overlaps(t, t + v.durationMin, p.hours.breakStart * 60, p.hours.breakEnd * 60) &&
          !busy(p.id, start.getTime(), visitEnd + TRAVEL_BUFFER_MIN * 60_000),
      );
      if (!pro) {
        ok = false;
        break;
      }
      used.add(pro.id);
      let cursor = start.getTime();
      const items = v.slugs.map((slug, i) => {
        const s = new Date(cursor);
        cursor += opts.durationOf(slug) * 60_000;
        const e = new Date(cursor);
        const last = i === v.slugs.length - 1;
        return { slug, start: s, end: e, reservedEnd: last ? new Date(cursor + TRAVEL_BUFFER_MIN * 60_000) : e };
      });
      assignments.push({ visit: v, proId: pro.id, items });
    }
    if (!ok) continue;
    const end = new Date(Math.max(...assignments.map((a) => a.items.at(-1)!.end.getTime())));
    slots.push({ start, end, assignments });
  }
  return slots;
}
