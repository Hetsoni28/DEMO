"use client";

// Demo state lives in the browser (zustand + localStorage). It stands in for
// Supabase so every flow in the blueprint can be clicked through without a backend.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEMO_CUSTOMER,
  DEMO_PROFESSIONAL_ID,
  HOLD_MINUTES,
  TRAVEL_BUFFER_MIN,
  getService,
  services,
  professionals as seedPros,
  type Professional,
  type VerificationStatus,
} from "./mock-data";
import { priceBreakdown } from "./format";
import { seedAccounts, yearsFromBand, type Account, type AccountStatus, type Role } from "./rbac";
import { computeCartSlots, computeSlots, dayKey, istDate } from "./scheduling";

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type PaymentStatus = "CREATED" | "CAPTURED" | "FAILED" | "REFUND_PENDING" | "REFUNDED";

export type Address = { id: string; label: string; line: string; zone: string; lat: number; lng: number };

export type Booking = {
  id: string;
  code: string;
  serviceSlug: string;
  customerId: string;
  customerName: string;
  address: string;
  zone: string;
  professionalId: string | null;
  start: string;
  end: string;
  reservedEnd: string;
  status: BookingStatus;
  holdExpiresAt?: string;
  amounts: { base: number; tax: number; total: number };
  payment: { orderId: string; paymentId?: string; status: PaymentStatus };
  qr?: { token: string; consumedAt?: string };
  history: { status: string; at: string; note?: string }[];
  report?: { summary: string; materials: string; photos: number; completedAt: string };
  extraQuote?: { description: string; amountPaise: number; status: "PENDING" | "APPROVED" | "DECLINED" };
  review?: { rating: number; comment: string };
  createdAt: string;
  /** Bookings created together from one basket share a group and a single payment. */
  group?: string;
};

export type PaymentEvent = {
  id: string;
  type: "payment.captured" | "payment.failed" | "refund.processed" | "order.created";
  bookingCode: string;
  amount: number;
  at: string;
  signatureVerified: boolean;
};

export type { Account, AccountStatus, Role } from "./rbac";

type Result = { ok: true; id?: string } | { ok: false; error: string };

type State = {
  ready: boolean;
  role: Role | null;
  bookings: Booking[];
  pros: Professional[];
  addresses: Address[];
  events: PaymentEvent[];
  seq: number;
  /** Basket of service slugs waiting to be booked together. */
  cart: string[];
  /** Everyone who can sign in (RBAC). */
  accounts: Account[];
  /** The signed-in account, if any. */
  accountId: string | null;
  /** Set on a fresh sign-in to play the welcome animation (never persisted). */
  welcome: { accountId: string; at: number } | null;
};

export type ProApplication = { name: string; email: string; phone: string; categorySlugs: string[]; zone: string; experience: string };

type Actions = {
  init: () => void;
  reset: () => void;
  setRole: (r: Role | null) => void;
  /** Sign in as an existing account. Fails for unknown or paused accounts. */
  signIn: (accountId: string) => Result;
  signOut: () => void;
  dismissWelcome: () => void;
  /** New professional application: creates a pending profile + account and signs the applicant in. */
  applyAsPro: (input: ProApplication) => string;
  registerCustomer: (input: { name: string; email: string; phone: string }) => string;
  /** Admin decision on a professional application; keeps profile and account in sync. */
  reviewApplication: (proId: string, approve: boolean, note?: string) => void;
  setAccountRole: (accountId: string, role: Role) => Result;
  setAccountStatus: (accountId: string, status: Extract<AccountStatus, "ACTIVE" | "SUSPENDED">) => Result;
  markApprovalSeen: (accountId: string) => void;
  addAddress: (a: Omit<Address, "id">) => string;
  removeAddress: (id: string) => void;
  createHold: (serviceSlug: string, address: Address, startISO: string) => Result;
  addToCart: (slug: string) => void;
  removeFromCart: (slug: string) => void;
  clearCart: () => void;
  /** Hold one slot for several services (one booking each) under a single order. Returns the group id. */
  createOrder: (slugs: string[], address: Address, startISO: string) => Result;
  payOrder: (group: string, outcome: "success" | "failure") => Result;
  expireOrder: (group: string) => void;
  pay: (id: string, outcome: "success" | "failure") => Result;
  expireHold: (id: string) => void;
  cancel: (id: string, by: string) => Result;
  assign: (id: string, proId: string) => Result;
  scanQr: (token: string, proId: string) => Result;
  requestExtra: (id: string, description: string, amountPaise: number) => void;
  respondExtra: (id: string, approve: boolean) => void;
  complete: (id: string, summary: string, materials: string, photos: number) => Result;
  review: (id: string, rating: number, comment: string) => void;
  setVerification: (proId: string, status: VerificationStatus) => void;
  toggleActive: (proId: string) => void;
  updateHours: (proId: string, hours: Professional["hours"], offDays: number[]) => void;
};

const rid = (prefix: string, len = 14) => {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
};

const iso = (d: Date) => d.toISOString();

function seed(): Pick<State, "bookings" | "addresses" | "events" | "seq" | "pros"> {
  const now = new Date();
  const day = (offset: number) => dayKey(new Date(now.getTime() + offset * 86_400_000));

  const mk = (
    n: number,
    serviceSlug: string,
    customer: { id: string; name: string },
    address: string,
    zone: string,
    proId: string | null,
    dayOffset: number,
    startMin: number,
    status: BookingStatus,
    extra: Partial<Booking> = {},
  ): Booking => {
    const svc = getService(serviceSlug)!;
    const start = istDate(day(dayOffset), startMin);
    const end = new Date(start.getTime() + svc.durationMin * 60_000);
    const reservedEnd = new Date(end.getTime() + TRAVEL_BUFFER_MIN * 60_000);
    // Created two days before the visit, but never in the future.
    const created = new Date(Math.min(start.getTime() - 2 * 86_400_000, now.getTime() - 3 * 3_600_000));
    const paid = status !== "PENDING_PAYMENT" && status !== "EXPIRED";
    const history: Booking["history"] = [
      { status: "PENDING_PAYMENT", at: iso(created), note: "Slot held, Razorpay order created" },
    ];
    if (paid) history.push({ status: "CONFIRMED", at: iso(new Date(created.getTime() + 90_000)), note: "Payment captured · webhook verified" });
    if (["ASSIGNED", "IN_PROGRESS", "COMPLETED"].includes(status))
      history.push({ status: "ASSIGNED", at: iso(new Date(created.getTime() + 3_600_000)), note: "Assigned by admin" });
    if (["IN_PROGRESS", "COMPLETED"].includes(status))
      history.push({ status: "IN_PROGRESS", at: iso(new Date(start.getTime() + 5 * 60_000)), note: "Service QR scanned" });
    if (status === "COMPLETED") history.push({ status: "COMPLETED", at: iso(end), note: "Job report submitted" });
    if (status === "CANCELLED") history.push({ status: "CANCELLED", at: iso(new Date(created.getTime() + 7_200_000)), note: "Cancelled by customer" });

    return {
      id: `b${n}`,
      code: `HC-${1040 + n}`,
      serviceSlug,
      customerId: customer.id,
      customerName: customer.name,
      address,
      zone,
      professionalId: proId,
      start: iso(start),
      end: iso(end),
      reservedEnd: iso(reservedEnd),
      status,
      amounts: priceBreakdown(svc.pricePaise),
      payment: {
        orderId: `order_${rid("", 14)}`,
        paymentId: paid ? `pay_${rid("", 14)}` : undefined,
        status: status === "CANCELLED" ? "REFUNDED" : paid ? "CAPTURED" : "CREATED",
      },
      qr: paid ? { token: `ppq_${rid("", 16)}`, consumedAt: ["IN_PROGRESS", "COMPLETED"].includes(status) ? iso(start) : undefined } : undefined,
      history,
      createdAt: iso(created),
      ...extra,
    };
  };

  const me = { id: DEMO_CUSTOMER.id, name: DEMO_CUSTOMER.name };
  const bookings: Booking[] = [
    mk(1, "pipe-leak-repair", me, "B-402, Shivalik Heights, Satellite", "Satellite", "p1", 1, 11 * 60, "CONFIRMED"),
    mk(2, "tap-repair-replacement", { id: "c2", name: "Priya Shah" }, "12, Sunrise Park, Vastrapur", "Vastrapur", "p1", 1, 15 * 60, "ASSIGNED"),
    mk(3, "flush-tank-repair", { id: "c3", name: "Rohit Jain" }, "7, Akash Tower, Navrangpura", "Navrangpura", "p1", 2, 10 * 60, "ASSIGNED"),
    mk(4, "geyser-installation", me, "B-402, Shivalik Heights, Satellite", "Satellite", "p3", -6, 10 * 60, "COMPLETED", {
      report: { summary: "Installed 15 L storage geyser, replaced inlet hose, tested PRV.", materials: "1 × braided inlet hose (approved)", photos: 4, completedAt: "" },
      review: { rating: 5, comment: "Very neat work and explained the safety valve." },
    }),
    mk(5, "bathroom-deep-cleaning", me, "B-402, Shivalik Heights, Satellite", "Satellite", "p6", -20, 11 * 60, "COMPLETED", {
      report: { summary: "Descaled fittings, scrubbed tiles and grout, disinfected floor and WC.", materials: "Descaler, eco disinfectant", photos: 4, completedAt: "" },
    }),
    mk(6, "water-tank-cleaning", { id: "c4", name: "Meera Iyer" }, "Plot 9, Maninagar East", "Maninagar", "p6", -3, 9 * 60, "CANCELLED"),
    mk(7, "pipe-leak-repair", { id: "c5", name: "Ankit Desai" }, "301, Iscon Arcade, Satellite", "Satellite", "p1", -1, 16 * 60, "COMPLETED", {
      report: { summary: "Replaced corroded elbow joint under kitchen sink.", materials: "1 × CPVC elbow", photos: 3, completedAt: "" },
      review: { rating: 5, comment: "Quick and professional." },
    }),
    mk(8, "ac-service", { id: "c6", name: "Sana Merchant" }, "A-11, Riviera Flats, Bodakdev", "Bodakdev", null, 3, 12 * 60, "CONFIRMED"),
  ];
  for (const b of bookings) if (b.report) b.report.completedAt = b.end;
  if (bookings[5].payment.status === "REFUNDED") bookings[5].history.push({ status: "REFUNDED", at: bookings[5].history.at(-1)!.at, note: "Refund processed to source" });

  const events: PaymentEvent[] = bookings
    .filter((b) => b.payment.paymentId)
    .flatMap((b) => {
      const list: PaymentEvent[] = [
        { id: `evt_${rid("", 12)}`, type: "payment.captured", bookingCode: b.code, amount: b.amounts.total, at: b.history[1]?.at ?? b.createdAt, signatureVerified: true },
      ];
      if (b.payment.status === "REFUNDED")
        list.push({ id: `evt_${rid("", 12)}`, type: "refund.processed", bookingCode: b.code, amount: b.amounts.total, at: b.history.at(-1)!.at, signatureVerified: true });
      return list;
    });

  return {
    bookings,
    events,
    seq: bookings.length + 1,
    pros: structuredClone(seedPros),
    addresses: [
      { id: "a1", label: "Home", line: "B-402, Shivalik Heights, Satellite", zone: "Satellite", lat: 23.0258, lng: 72.5073 },
      { id: "a2", label: "Office", line: "5th Floor, Venus Atlantis, Prahlad Nagar", zone: "Prahlad Nagar", lat: 23.0124, lng: 72.5107 },
    ],
  };
}

const initial: State = { ready: false, role: null, bookings: [], pros: [], addresses: [], events: [], seq: 1, cart: [], accounts: [], accountId: null, welcome: null };

const push = (b: Booking, status: string, note?: string): Booking => ({
  ...b,
  history: [...b.history, { status, at: iso(new Date()), note }],
});

export const useApp = create<State & Actions>()(
  persist(
    (set, get) => {
      const patch = (id: string, fn: (b: Booking) => Booking) =>
        set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? fn(b) : b)) }));
      const find = (id: string) => get().bookings.find((b) => b.id === id);
      /** Bookings are made by the signed-in customer (falls back to the demo customer). */
      const customer = () => {
        const a = get().accounts.find((x) => x.id === get().accountId);
        return a && a.role === "customer" ? { id: a.id, name: a.name } : { id: DEMO_CUSTOMER.id, name: DEMO_CUSTOMER.name };
      };
      const activeAdmins = (accounts: Account[]) => accounts.filter((a) => a.role === "admin" && a.status === "ACTIVE");

      return {
        ...initial,

        init: () => {
          if (get().bookings.length === 0) set({ ...seed() });
          if (get().accounts.length === 0) set({ accounts: seedAccounts(get().pros, new Date().toISOString()) });
          // Older demo sessions stored only a role: map it to that role's demo account.
          const { role, accountId, accounts } = get();
          if (role && !accountId) {
            const fallback = { customer: DEMO_CUSTOMER.id, professional: "a_p1", admin: "a_admin" }[role];
            if (accounts.some((a) => a.id === fallback)) set({ accountId: fallback });
          }
          // Lazily expire stale holds (a real system would reconcile with Razorpay first).
          const now = Date.now();
          set((s) => ({
            ready: true,
            bookings: s.bookings.map((b) =>
              b.status === "PENDING_PAYMENT" && b.holdExpiresAt && new Date(b.holdExpiresAt).getTime() < now
                ? push({ ...b, status: "EXPIRED" }, "EXPIRED", "Unpaid hold expired after reconciliation")
                : b,
            ),
          }));
        },

        reset: () => {
          const fresh = seed();
          const accounts = seedAccounts(fresh.pros, new Date().toISOString());
          const keep = accounts.find((a) => a.id === get().accountId);
          set({ ...fresh, cart: [], ready: true, accounts, accountId: keep?.id ?? null, role: keep?.role ?? null });
        },
        setRole: (role) => set({ role }),

        signIn: (accountId) => {
          const a = get().accounts.find((x) => x.id === accountId);
          if (!a) return { ok: false, error: "No account found with those details." };
          if (a.status === "SUSPENDED") return { ok: false, error: "This account's access is paused. Contact support." };
          set({ accountId: a.id, role: a.role, welcome: { accountId: a.id, at: Date.now() } });
          return { ok: true, id: a.id };
        },
        signOut: () => set({ accountId: null, role: null, welcome: null }),
        dismissWelcome: () => set({ welcome: null }),

        applyAsPro: (input) => {
          const n = get().pros.length + 1;
          const proId = `p${Date.now().toString(36)}${n}`;
          const cats = input.categorySlugs;
          const tradeName: Record<string, string> = {
            plumbing: "Plumber",
            electrical: "Electrician",
            cleaning: "Cleaner",
            appliances: "AC & appliance technician",
            carpentry: "Carpenter",
            painting: "Painter",
            "pest-control": "Pest control specialist",
          };
          const pro: Professional = {
            id: proId,
            name: input.name,
            trade: tradeName[cats[0]] ?? "Professional",
            phone: `+91 ${input.phone.slice(0, 2)}XXX ${input.phone.slice(5)}`,
            years: yearsFromBand(input.experience),
            rating: 0,
            jobsDone: 0,
            skills: services.filter((sv) => cats.includes(sv.categorySlug)).map((sv) => sv.slug),
            area: input.zone,
            verification: "PENDING",
            active: false,
            documents: [
              { name: "Aadhaar (ID)", status: "PENDING" },
              { name: "Trade certificate", status: "PENDING" },
              { name: "Police verification", status: "PENDING" },
            ],
            hours: { start: 9, end: 19, breakStart: 13, breakEnd: 14 },
            offDays: [0],
          };
          const account: Account = {
            id: `a_${proId}`,
            name: input.name,
            email: input.email,
            phone: input.phone,
            role: "professional",
            status: "PENDING",
            proId,
            createdAt: new Date().toISOString(),
          };
          set((s) => ({ pros: [...s.pros, pro], accounts: [...s.accounts.filter((a) => !input.email || a.email !== input.email), account], accountId: account.id, role: "professional" }));
          return account.id;
        },

        registerCustomer: (input) => {
          const account: Account = { id: `c${Date.now().toString(36)}`, ...input, role: "customer", status: "ACTIVE", createdAt: new Date().toISOString() };
          set((s) => ({ accounts: [...s.accounts.filter((a) => !input.email || a.email !== input.email), account], accountId: account.id, role: "customer" }));
          return account.id;
        },

        reviewApplication: (proId, approve, note) => {
          const status: VerificationStatus = approve ? "VERIFIED" : "REJECTED";
          const at = new Date().toISOString();
          set((s) => ({
            pros: s.pros.map((p) => (p.id === proId ? { ...p, verification: status, active: approve, documents: p.documents.map((d) => ({ ...d, status })) } : p)),
            accounts: s.accounts.map((a) =>
              a.proId === proId
                ? { ...a, status: approve ? "ACTIVE" : "REJECTED", reviewedAt: at, reviewNote: note?.trim() || undefined, approvalSeen: approve ? false : a.approvalSeen }
                : a,
            ),
          }));
        },

        setAccountRole: (accountId, role) => {
          const { accounts } = get();
          const a = accounts.find((x) => x.id === accountId);
          if (!a) return { ok: false, error: "Account not found." };
          if (a.role === role) return { ok: true };
          if (a.role === "admin" && activeAdmins(accounts).length <= 1) return { ok: false, error: "Keep at least one active admin." };
          if (role === "professional" && !a.proId) return { ok: false, error: "They need to apply as a professional first, so their trade and documents can be checked." };
          set((s) => ({
            accounts: s.accounts.map((x) => (x.id === accountId ? { ...x, role } : x)),
            role: s.accountId === accountId ? role : s.role,
          }));
          return { ok: true };
        },

        setAccountStatus: (accountId, status) => {
          const { accounts, accountId: me } = get();
          const a = accounts.find((x) => x.id === accountId);
          if (!a) return { ok: false, error: "Account not found." };
          if (status === "SUSPENDED" && accountId === me) return { ok: false, error: "You can't pause your own access." };
          if (status === "SUSPENDED" && a.role === "admin" && activeAdmins(accounts).length <= 1) return { ok: false, error: "Keep at least one active admin." };
          if (status === "ACTIVE" && a.role === "professional") {
            const pro = get().pros.find((p) => p.id === a.proId);
            if (pro && pro.verification !== "VERIFIED") return { ok: false, error: "Approve their application first." };
          }
          set((s) => ({ accounts: s.accounts.map((x) => (x.id === accountId ? { ...x, status } : x)) }));
          return { ok: true };
        },

        markApprovalSeen: (accountId) => set((s) => ({ accounts: s.accounts.map((a) => (a.id === accountId ? { ...a, approvalSeen: true } : a)) })),

        addAddress: (a) => {
          const id = rid("addr_", 6);
          set((s) => ({ addresses: [...s.addresses, { ...a, id }] }));
          return id;
        },
        removeAddress: (id) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),

        createHold: (serviceSlug, address, startISO) => {
          const svc = getService(serviceSlug);
          if (!svc) return { ok: false, error: "Unknown service" };
          // Server-side re-check of availability (never trust the client's slot list).
          const start = new Date(startISO);
          const slot = computeSlots({ serviceSlug, durationMin: svc.durationMin, key: dayKey(start), bookings: get().bookings, pros: get().pros }).find(
            (s) => s.start.getTime() === start.getTime(),
          );
          if (!slot) return { ok: false, error: "That slot was just taken. Please pick another time." };
          const n = get().seq;
          const amounts = priceBreakdown(svc.pricePaise); // trusted price, not from the browser
          const booking: Booking = {
            id: `b${n}`,
            code: `HC-${1040 + n}`,
            serviceSlug,
            customerId: customer().id,
            customerName: customer().name,
            address: address.line,
            zone: address.zone,
            professionalId: slot.freePros[0],
            start: iso(slot.start),
            end: iso(slot.end),
            reservedEnd: iso(slot.reservedEnd),
            status: "PENDING_PAYMENT",
            holdExpiresAt: iso(new Date(Date.now() + HOLD_MINUTES * 60_000)),
            amounts,
            payment: { orderId: `order_${rid("", 14)}`, status: "CREATED" },
            history: [{ status: "PENDING_PAYMENT", at: iso(new Date()), note: `Slot held for ${HOLD_MINUTES} min · Razorpay order created` }],
            createdAt: iso(new Date()),
          };
          set((s) => ({
            seq: s.seq + 1,
            bookings: [...s.bookings, booking],
            events: [{ id: `evt_${rid("", 12)}`, type: "order.created", bookingCode: booking.code, amount: amounts.total, at: booking.createdAt, signatureVerified: true }, ...s.events],
          }));
          return { ok: true, id: booking.id };
        },

        addToCart: (slug) => set((s) => (s.cart.includes(slug) || !getService(slug) ? s : { cart: [...s.cart, slug] })),
        removeFromCart: (slug) => set((s) => ({ cart: s.cart.filter((x) => x !== slug) })),
        clearCart: () => set({ cart: [] }),

        createOrder: (slugs, address, startISO) => {
          const list = [...new Set(slugs)].filter((x) => getService(x));
          if (!list.length) return { ok: false, error: "Your basket is empty." };
          // Server-side re-check: every visit in the basket must still be staffable at this start time.
          const start = new Date(startISO);
          const slot = computeCartSlots({
            slugs: list,
            durationOf: (x) => getService(x)!.durationMin,
            categoryOf: (x) => getService(x)!.categorySlug,
            key: dayKey(start),
            bookings: get().bookings,
            pros: get().pros,
          }).find((x) => x.start.getTime() === start.getTime());
          if (!slot) return { ok: false, error: "That time was just taken for one of your services. Please pick another time." };

          const group = `ord_${rid("", 10)}`;
          const orderId = `order_${rid("", 14)}`;
          const at = iso(new Date());
          const holdUntil = iso(new Date(Date.now() + HOLD_MINUTES * 60_000));
          let n = get().seq;
          const created: Booking[] = [];
          for (const a of slot.assignments) {
            for (const item of a.items) {
              const svc = getService(item.slug)!;
              created.push({
                id: `b${n}`,
                code: `HC-${1040 + n}`,
                serviceSlug: item.slug,
                customerId: customer().id,
                customerName: customer().name,
                address: address.line,
                zone: address.zone,
                professionalId: a.proId,
                start: iso(item.start),
                end: iso(item.end),
                reservedEnd: iso(item.reservedEnd),
                status: "PENDING_PAYMENT",
                holdExpiresAt: holdUntil,
                amounts: priceBreakdown(svc.pricePaise), // trusted price, never from the browser
                payment: { orderId, status: "CREATED" },
                history: [{ status: "PENDING_PAYMENT", at, note: `Slot held for ${HOLD_MINUTES} min · part of a ${list.length}-service order` }],
                createdAt: at,
                group,
              });
              n++;
            }
          }
          const total = created.reduce((sum, b) => sum + b.amounts.total, 0);
          const label = created.length > 1 ? `${created[0].code} +${created.length - 1}` : created[0].code;
          set((s) => ({
            seq: n,
            bookings: [...s.bookings, ...created],
            events: [{ id: `evt_${rid("", 12)}`, type: "order.created", bookingCode: label, amount: total, at, signatureVerified: true }, ...s.events],
          }));
          return { ok: true, id: group };
        },

        payOrder: (group, outcome) => {
          const items = get().bookings.filter((b) => b.group === group);
          if (!items.length) return { ok: false, error: "Order not found" };
          // Idempotency: a duplicate "captured" event must not double-confirm.
          if (items.every((b) => b.payment.status === "CAPTURED")) return { ok: true, id: group };
          if (items.some((b) => b.status !== "PENDING_PAYMENT")) return { ok: false, error: "This hold is no longer active." };
          const total = items.reduce((sum, b) => sum + b.amounts.total, 0);
          const label = items.length > 1 ? `${items[0].code} +${items.length - 1}` : items[0].code;
          set((s) => ({
            events: [
              { id: `evt_${rid("", 12)}`, type: outcome === "success" ? "payment.captured" : "payment.failed", bookingCode: label, amount: total, at: iso(new Date()), signatureVerified: true },
              ...s.events,
            ],
          }));
          if (outcome === "failure") {
            set((s) => ({
              bookings: s.bookings.map((b) => (b.group === group ? push({ ...b, payment: { ...b.payment, status: "FAILED" } }, "PAYMENT_FAILED", "payment.failed webhook received; hold kept until expiry") : b)),
            }));
            return { ok: false, error: "Payment failed. Your slot is still held — you can retry." };
          }
          const paymentId = `pay_${rid("", 14)}`;
          set((s) => ({
            cart: [],
            bookings: s.bookings.map((b) =>
              b.group === group
                ? push(
                    { ...b, status: "CONFIRMED", holdExpiresAt: undefined, payment: { ...b.payment, paymentId, status: "CAPTURED" }, qr: { token: `ppq_${rid("", 16)}` } },
                    "CONFIRMED",
                    `One payment for ${items.length} service${items.length > 1 ? "s" : ""} verified · service QR issued`,
                  )
                : b,
            ),
          }));
          return { ok: true, id: group };
        },

        expireOrder: (group) =>
          set((s) => ({
            bookings: s.bookings.map((b) => (b.group === group && b.status === "PENDING_PAYMENT" ? push({ ...b, status: "EXPIRED" }, "EXPIRED", "Unpaid hold released") : b)),
          })),

        pay: (id, outcome) => {
          const b = find(id);
          if (!b) return { ok: false, error: "Booking not found" };
          // Idempotency: a duplicate "captured" event must not double-confirm.
          if (b.payment.status === "CAPTURED") return { ok: true, id };
          if (b.status !== "PENDING_PAYMENT") return { ok: false, error: "This hold is no longer active." };
          const evt: PaymentEvent = {
            id: `evt_${rid("", 12)}`,
            type: outcome === "success" ? "payment.captured" : "payment.failed",
            bookingCode: b.code,
            amount: b.amounts.total,
            at: iso(new Date()),
            signatureVerified: true,
          };
          set((s) => ({ events: [evt, ...s.events] }));
          if (outcome === "failure") {
            patch(id, (x) => push({ ...x, payment: { ...x.payment, status: "FAILED" } }, "PAYMENT_FAILED", "payment.failed webhook received; hold kept until expiry"));
            return { ok: false, error: "Payment failed. Your slot is still held — you can retry." };
          }
          patch(id, (x) =>
            push(
              {
                ...x,
                status: "CONFIRMED",
                holdExpiresAt: undefined,
                payment: { ...x.payment, paymentId: `pay_${rid("", 14)}`, status: "CAPTURED" },
                qr: { token: `ppq_${rid("", 16)}` },
              },
              "CONFIRMED",
              "Signature, amount & currency verified · service QR issued",
            ),
          );
          return { ok: true, id };
        },

        expireHold: (id) =>
          patch(id, (b) => (b.status === "PENDING_PAYMENT" ? push({ ...b, status: "EXPIRED" }, "EXPIRED", "Unpaid hold released") : b)),

        cancel: (id, by) => {
          const b = find(id);
          if (!b) return { ok: false, error: "Booking not found" };
          if (!["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED"].includes(b.status)) return { ok: false, error: "This booking can no longer be cancelled." };
          const paid = b.payment.status === "CAPTURED";
          patch(id, (x) =>
            push(
              { ...x, status: "CANCELLED", payment: { ...x.payment, status: paid ? "REFUND_PENDING" : x.payment.status }, qr: x.qr ? { ...x.qr, consumedAt: undefined } : undefined },
              "CANCELLED",
              `Cancelled by ${by}${paid ? " · refund initiated" : ""}`,
            ),
          );
          if (paid) {
            // Simulate Razorpay refund webhook a moment later.
            setTimeout(() => {
              patch(id, (x) => push({ ...x, payment: { ...x.payment, status: "REFUNDED" } }, "REFUNDED", "refund.processed webhook verified"));
              set((s) => ({
                events: [{ id: `evt_${rid("", 12)}`, type: "refund.processed", bookingCode: b.code, amount: b.amounts.total, at: iso(new Date()), signatureVerified: true }, ...s.events],
              }));
            }, 2500);
          }
          return { ok: true };
        },

        assign: (id, proId) => {
          const b = find(id);
          const pro = get().pros.find((p) => p.id === proId);
          if (!b || !pro) return { ok: false, error: "Not found" };
          if (pro.verification !== "VERIFIED" || !pro.active) return { ok: false, error: `${pro.name} is not verified/active.` };
          if (!pro.skills.includes(b.serviceSlug)) return { ok: false, error: `${pro.name} doesn't offer this service.` };
          const clash = get().bookings.some(
            (o) =>
              o.id !== id &&
              o.professionalId === proId &&
              ["PENDING_PAYMENT", "CONFIRMED", "ASSIGNED", "IN_PROGRESS"].includes(o.status) &&
              new Date(o.start) < new Date(b.reservedEnd) &&
              new Date(b.start) < new Date(o.reservedEnd),
          );
          if (clash) return { ok: false, error: `${pro.name} already has an overlapping job (exclusion constraint).` };
          patch(id, (x) => push({ ...x, professionalId: proId, status: "ASSIGNED" }, "ASSIGNED", `Assigned to ${pro.name} by admin`));
          return { ok: true };
        },

        scanQr: (token, proId) => {
          const t = token.trim();
          const b = get().bookings.find((x) => x.qr?.token === t);
          if (!b) return { ok: false, error: "Invalid QR token." };
          if (b.professionalId !== proId) return { ok: false, error: "This booking is not assigned to you." };
          if (b.qr?.consumedAt) return { ok: false, error: "This QR has already been used." };
          if (!["CONFIRMED", "ASSIGNED"].includes(b.status)) return { ok: false, error: `Booking is ${b.status.replace("_", " ").toLowerCase()} — cannot start.` };
          patch(b.id, (x) => push({ ...x, status: "IN_PROGRESS", qr: { ...x.qr!, consumedAt: iso(new Date()) } }, "IN_PROGRESS", "Service QR verified · job started"));
          return { ok: true, id: b.id };
        },

        requestExtra: (id, description, amountPaise) =>
          patch(id, (b) => push({ ...b, extraQuote: { description, amountPaise, status: "PENDING" } }, "QUOTE_SENT", "Extra work quotation sent to customer")),

        respondExtra: (id, approve) =>
          patch(id, (b) =>
            b.extraQuote
              ? push({ ...b, extraQuote: { ...b.extraQuote, status: approve ? "APPROVED" : "DECLINED" } }, approve ? "QUOTE_APPROVED" : "QUOTE_DECLINED", approve ? "Customer approved additional work" : "Customer declined additional work")
              : b,
          ),

        complete: (id, summary, materials, photos) => {
          const b = find(id);
          if (!b || b.status !== "IN_PROGRESS") return { ok: false, error: "Job is not in progress." };
          if (b.extraQuote?.status === "PENDING") return { ok: false, error: "Waiting for the customer to respond to the extra-work quote." };
          patch(id, (x) => push({ ...x, status: "COMPLETED", report: { summary, materials, photos, completedAt: iso(new Date()) } }, "COMPLETED", "Job report submitted · invoice generated"));
          return { ok: true };
        },

        review: (id, rating, comment) => patch(id, (b) => ({ ...b, review: { rating, comment } })),

        setVerification: (proId, status) => {
          if (status === "PENDING") return;
          get().reviewApplication(proId, status === "VERIFIED");
        },
        toggleActive: (proId) => set((s) => ({ pros: s.pros.map((p) => (p.id === proId ? { ...p, active: !p.active } : p)) })),
        updateHours: (proId, hours, offDays) => set((s) => ({ pros: s.pros.map((p) => (p.id === proId ? { ...p, hours, offDays } : p)) })),
      };
    },
    {
      name: "homecrew-demo-v1",
      skipHydration: true,
      partialize: ({ role, bookings, pros, addresses, events, seq, cart, accounts, accountId }) => ({ role, bookings, pros, addresses, events, seq, cart, accounts, accountId }),
    },
  ),
);

let hydrating: Promise<void> | null = null;

/**
 * Load the demo data from browser storage and mark the app ready. Safe to call
 * any number of times. Self-healing: if the saved data can't be read (corrupt,
 * blocked storage) it is cleared and fresh demo data is seeded, so pages never
 * wait forever. Also re-runs cleanly after a dev-server hot reload, which
 * recreates this store empty.
 */
export function hydrateStore(): Promise<void> {
  if (useApp.getState().ready) return Promise.resolve();
  if (!hydrating) {
    hydrating = (async () => {
      try {
        await useApp.persist.rehydrate();
        useApp.getState().init();
      } catch (err) {
        console.warn("[HomeCrew] Saved demo data could not be loaded, starting fresh.", err);
        try {
          localStorage.removeItem(useApp.persist.getOptions().name ?? "homecrew-demo-v1");
        } catch {}
        useApp.setState({ ...initial });
        useApp.getState().init();
      }
    })().finally(() => {
      hydrating = null;
    });
  }
  return hydrating;
}

export const useBooking = (id: string) => useApp((s) => s.bookings.find((b) => b.id === id));
export const usePro = (id: string | null | undefined) => useApp((s) => s.pros.find((p) => p.id === id));

/** The signed-in account (undefined when signed out or not loaded yet). */
export const useAccount = () => useApp((s) => s.accounts.find((a) => a.id === s.accountId));
/** Professional profile of the signed-in pro (demo pro as a fallback for previews). */
export const useMyProId = () => useApp((s) => s.accounts.find((a) => a.id === s.accountId)?.proId ?? DEMO_PROFESSIONAL_ID);
/** Customer id of the signed-in customer (demo customer as a fallback). */
export const useMyCustomerId = () =>
  useApp((s) => {
    const a = s.accounts.find((x) => x.id === s.accountId);
    return a?.role === "customer" ? a.id : DEMO_CUSTOMER.id;
  });
