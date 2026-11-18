"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/motion/motion";
import { BookingConfirmed } from "@/components/organisms/booking-confirmed";
import {
  ArrowLeft,
  Building2,
  Check,
  CircleAlert,
  Clock,
  CreditCard,
  House,
  Landmark,
  LoaderCircle,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { Button, Card, Input, Label, Skeleton } from "@/components/atoms/ui";
import {
  fmtDate,
  fmtTime,
  formatDuration,
  formatINR,
  priceBreakdown,
} from "@/lib/format";
import {
  getCategory,
  getService,
  GST_RATE,
  HOLD_MINUTES,
  SERVICE_AREA,
  TRAVEL_BUFFER_MIN,
} from "@/lib/mock-data";
import { computeCartSlots, istHour, upcomingDays, visitsFor } from "@/lib/scheduling";
import { useApp, type Address } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEPS = ["Address", "Date & time", "Review", "Payment"];

const durationOf = (slug: string) => getService(slug)!.durationMin;
const categoryOf = (slug: string) => getService(slug)!.categorySlug;

/**
 * Booking flow for one or more services. A basket of several services gets ONE
 * address, ONE time slot and ONE payment; same-trade services are done back-to-back
 * by one professional, different trades get their own professional in parallel.
 */
export function BookingFlow({ slugs, backHref, backLabel }: { slugs: string[]; backHref: string; backLabel: string }) {
  const ready = useApp((s) => s.ready);
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState<Address | null>(null);
  const [slotISO, setSlotISO] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </Link>

      <ol className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i < step ? "bg-teal-brand text-white" : i === step ? "bg-navy-800 text-white" : "bg-slate-200 text-slate-500",
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn("hidden text-sm sm:block", i === step ? "font-medium text-slate-900" : "text-slate-500")}>{s}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-slate-200" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={ready ? `step-${step}` : "loading"}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {!ready ? (
                <Skeleton className="h-96" />
              ) : step === 0 ? (
                <AddressStep
                  selected={address}
                  onNext={(a) => {
                    setAddress(a);
                    setStep(1);
                  }}
                />
              ) : step === 1 ? (
                <SlotStep
                  slugs={slugs}
                  selected={slotISO}
                  onBack={() => setStep(0)}
                  onNext={(iso) => {
                    setSlotISO(iso);
                    setStep(2);
                  }}
                />
              ) : step === 2 ? (
                <ReviewStep
                  slugs={slugs}
                  address={address!}
                  slotISO={slotISO!}
                  onBack={() => setStep(1)}
                  onHeld={(g) => {
                    setGroup(g);
                    setStep(3);
                  }}
                  onSlotTaken={() => {
                    setSlotISO(null);
                    setStep(1);
                  }}
                />
              ) : (
                <PaymentStep
                  group={group!}
                  onRestart={() => {
                    setGroup(null);
                    setSlotISO(null);
                    setStep(1);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <Summary slugs={slugs} address={address} slotISO={slotISO} />
      </div>
    </div>
  );
}

function Summary({ slugs, address, slotISO }: { slugs: string[]; address: Address | null; slotISO: string | null }) {
  const items = slugs.map((s) => getService(s)!);
  const base = items.reduce((n, s) => n + s.pricePaise, 0);
  const tax = items.reduce((n, s) => n + priceBreakdown(s.pricePaise).tax, 0);
  const minutes = Math.max(...visitsFor(slugs, durationOf, categoryOf).map((v) => v.durationMin));
  return (
    <Card className="h-fit p-5 lg:sticky lg:top-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold text-slate-900">{items.length === 1 ? items[0].title : `${items.length} services`}</h3>
        <span className="text-xs text-slate-500">~{formatDuration(minutes)}</span>
      </div>
      {items.length > 1 && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {items.map((s) => (
            <li key={s.slug} className="flex justify-between gap-3 text-slate-600">
              <span className="truncate">{s.title}</span>
              <span className="shrink-0 tabular-nums">{formatINR(s.pricePaise)}</span>
            </li>
          ))}
        </ul>
      )}
      {items.length === 1 && <p className="mt-1 text-xs text-slate-500">{items[0].warrantyDays ? `${items[0].warrantyDays}-day warranty` : "Report included"}</p>}
      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
        <div className="flex gap-2 text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          {address ? address.line : <span className="text-slate-400">Address not selected</span>}
        </div>
        <div className="flex gap-2 text-slate-600">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          {slotISO ? `${fmtDate(slotISO)} · ${fmtTime(slotISO)}` : <span className="text-slate-400">Time not selected</span>}
        </div>
      </div>
      <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between text-slate-600">
          <dt>{items.length > 1 ? "Services" : "Service"}</dt>
          <dd className="tabular-nums">{formatINR(base)}</dd>
        </div>
        <div className="flex justify-between text-slate-600">
          <dt>GST {GST_RATE * 100}%</dt>
          <dd className="tabular-nums">{formatINR(tax)}</dd>
        </div>
        <div className="flex justify-between pt-1 text-base font-semibold text-slate-900">
          <dt>Total · one payment</dt>
          <dd className="tabular-nums">{formatINR(base + tax)}</dd>
        </div>
      </dl>
    </Card>
  );
}

function AddressStep({
  selected,
  onNext,
}: {
  selected: Address | null;
  onNext: (a: Address) => void;
}) {
  const addresses = useApp((s) => s.addresses);
  const addAddress = useApp((s) => s.addAddress);
  const [choice, setChoice] = useState<string | null>(
    selected?.id ?? addresses[0]?.id ?? null,
  );
  const [adding, setAdding] = useState(addresses.length === 0);
  const [form, setForm] = useState({
    label: "Home",
    line: "",
    zone: SERVICE_AREA.zones[0],
  });
  const [pin, setPin] = useState({ x: 55, y: 45 });

  const chosen = addresses.find((a) => a.id === choice);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Where do you need the professional?
      </h2>
      <div className="mt-5 grid gap-3">
        {addresses.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setChoice(a.id);
              setAdding(false);
            }}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition",
              choice === a.id && !adding
                ? "border-teal-brand bg-teal-soft/50 ring-1 ring-teal-brand"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            {a.label === "Office" ? (
              <Building2 className="mt-0.5 h-5 w-5 text-slate-500" />
            ) : (
              <House className="mt-0.5 h-5 w-5 text-slate-500" />
            )}
            <div>
              <div className="text-sm font-medium text-slate-900">
                {a.label}
              </div>
              <div className="text-sm text-slate-500">{a.line}</div>
            </div>
          </button>
        ))}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm font-medium text-teal-brand hover:border-teal-brand"
          >
            <Plus className="h-4 w-4" /> Add a new address
          </button>
        )}
      </div>

      {adding && (
        <div className="mt-5 space-y-4 rounded-xl border border-slate-200 p-4">
          <div
            className="relative h-48 cursor-crosshair overflow-hidden rounded-xl bg-[#e8efe6]"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setPin({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              aria-hidden
            >
              <path d="M0 30 L100 38" stroke="#fff" strokeWidth="3" />
              <path d="M0 72 L100 65" stroke="#fff" strokeWidth="2" />
              <path d="M30 0 L38 100" stroke="#fff" strokeWidth="2.5" />
              <path d="M72 0 L66 100" stroke="#fff" strokeWidth="2" />
              <path
                d="M0 90 Q50 80 100 95"
                stroke="#bcd5ea"
                strokeWidth="4"
                fill="none"
              />
              <rect x="42" y="45" width="16" height="12" fill="#d9e5d4" />
              <rect x="8" y="42" width="14" height="18" fill="#d9e5d4" />
            </svg>
            <MapPin
              className="absolute h-8 w-8 -translate-x-1/2 -translate-y-full fill-teal-brand text-white drop-shadow"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            />
            <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[11px] text-slate-500">
              Tap to drop pin · Google Maps in production
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
            <div>
              <Label>Label</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div>
              <Label>Flat / building / street</Label>
              <Input
                value={form.line}
                placeholder="e.g. C-12, Aangan Residency"
                onChange={(e) => setForm({ ...form, line: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Area</Label>
            <select
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-brand"
            >
              {SERVICE_AREA.zones.map((z) => (
                <option key={z}>{z}</option>
              ))}
              <option value="__other">
                Gandhinagar (outside service area)
              </option>
            </select>
          </div>
          {form.zone === "__other" && (
            <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <CircleAlert className="h-4 w-4" /> We don&apos;t serve this area
              yet — we&apos;re live in {SERVICE_AREA.city} only.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          size="lg"
          variant="teal"
          disabled={
            adding
              ? form.line.trim().length < 4 || form.zone === "__other"
              : !chosen
          }
          onClick={() => {
            if (adding) {
              const line = `${form.line.trim()}, ${form.zone}`;
              const data = {
                label: form.label || "Home",
                line,
                zone: form.zone,
                lat: 23 + pin.y / 1000,
                lng: 72.5 + pin.x / 1000,
              };
              const id = addAddress(data);
              onNext({ ...data, id });
            } else if (chosen) onNext(chosen);
          }}
        >
          Continue
        </Button>
      </div>
    </Card>
  );
}

function SlotStep({ slugs, selected, onBack, onNext }: { slugs: string[]; selected: string | null; onBack: () => void; onNext: (iso: string) => void }) {
  const bookings = useApp((s) => s.bookings);
  const pros = useApp((s) => s.pros);
  const days = useMemo(() => upcomingDays(7), []);
  const [day, setDay] = useState(selected ? days.findIndex((d) => fmtDate(d.date.toISOString()) === fmtDate(selected)) : 0);
  const [pick, setPick] = useState<string | null>(selected);
  const dayIdx = Math.max(0, day);
  const visits = useMemo(() => visitsFor(slugs, durationOf, categoryOf), [slugs]);

  const slots = useMemo(() => computeCartSlots({ slugs, durationOf, categoryOf, key: days[dayIdx].key, bookings, pros }), [slugs, days, dayIdx, bookings, pros]);
  const counts = useMemo(() => days.map((d) => computeCartSlots({ slugs, durationOf, categoryOf, key: d.key, bookings, pros }).length), [days, slugs, bookings, pros]);

  const groups = [
    { label: "Morning", list: slots.filter((s) => istHour(s.start) < 12) },
    { label: "Afternoon", list: slots.filter((s) => istHour(s.start) >= 12 && istHour(s.start) < 17) },
    { label: "Evening", list: slots.filter((s) => istHour(s.start) >= 17) },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900">Choose a time</h2>
      <p className="mt-1 text-sm text-slate-500">
        {visits.length > 1
          ? `${slugs.length} services · ${visits.length} professionals arrive together. Only times when every one of them is free are shown.`
          : `Live availability from verified professionals — includes their hours, breaks, existing jobs and a ${TRAVEL_BUFFER_MIN}-min travel buffer.`}
      </p>
      <div className="-mx-6 mt-5 flex gap-2 overflow-x-auto px-6 pb-2">
        {days.map((d, i) => (
          <button
            key={d.key}
            onClick={() => {
              setDay(i);
              setPick(null);
            }}
            className={cn(
              "flex w-18 shrink-0 flex-col items-center rounded-xl border px-2 py-2.5 transition",
              i === dayIdx ? "border-navy-800 bg-navy-800 text-white" : "border-slate-200 hover:border-slate-300",
              counts[i] === 0 && i !== dayIdx && "opacity-50",
            )}
          >
            <span className="text-[11px] uppercase opacity-70">{i === 0 ? "Today" : fmtDate(d.date.toISOString()).split(",")[0]}</span>
            <span className="text-lg font-semibold">{fmtDate(d.date.toISOString()).split(" ")[1]}</span>
            <span className="text-[10px] opacity-70">{counts[i]} slots</span>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-5">
        {slots.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            {visits.length > 1 ? "No time this day where all the professionals you need are free. Try another date." : "No professionals available this day. Try another date."}
          </div>
        )}
        {groups
          .filter((g) => g.list.length)
          .map((g) => (
            <div key={g.label}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">{g.label}</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {g.list.map((s) => {
                  const iso = s.start.toISOString();
                  return (
                    <button
                      key={iso}
                      onClick={() => setPick(iso)}
                      className={cn("rounded-xl border px-2 py-2 text-sm transition", pick === iso ? "border-teal-brand bg-teal-brand text-white" : "border-slate-200 hover:border-teal-brand/50")}
                    >
                      <div className="font-medium">{fmtTime(iso)}</div>
                      <div className={cn("flex items-center justify-center gap-1 text-[10px]", pick === iso ? "text-white/80" : "text-slate-400")}>
                        <Users className="h-3 w-3" /> until {fmtTime(s.end.toISOString())}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" variant="teal" disabled={!pick} onClick={() => pick && onNext(pick)}>
          Continue
        </Button>
      </div>
    </Card>
  );
}

function ReviewStep({
  slugs,
  address,
  slotISO,
  onBack,
  onHeld,
  onSlotTaken,
}: {
  slugs: string[];
  address: Address;
  slotISO: string;
  onBack: () => void;
  onHeld: (group: string) => void;
  onSlotTaken: () => void;
}) {
  const createOrder = useApp((s) => s.createOrder);
  const [busy, setBusy] = useState(false);
  const [agree, setAgree] = useState(true);
  const visits = visitsFor(slugs, durationOf, categoryOf);
  const start = new Date(slotISO).getTime();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900">Review your booking</h2>
      <dl className="mt-5 divide-y divide-slate-100 text-sm">
        <Row k="Address" v={address.line} />
        <Row k="Arrival" v={`${fmtDate(slotISO)}, ${fmtTime(slotISO)}`} />
        <Row k="Professionals" v={visits.length > 1 ? `${visits.length} verified professionals, one per trade · shown after payment` : "Auto-matched verified professional (shown after payment)"} />
      </dl>

      <div className="mt-4 space-y-3">
        {visits.map((v) => {
          let cursor = start;
          return (
            <div key={v.category} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-400">
                <span>{getCategory(v.category)?.name ?? v.category} · one professional</span>
                <span>{formatDuration(v.durationMin)}</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {v.slugs.map((slug) => {
                  const svc = getService(slug)!;
                  const from = new Date(cursor).toISOString();
                  cursor += svc.durationMin * 60_000;
                  const to = new Date(cursor).toISOString();
                  return (
                    <li key={slug} className="flex justify-between gap-3">
                      <span className="font-medium text-slate-900">{svc.title}</span>
                      <span className="shrink-0 text-slate-500 tabular-nums">
                        {fmtTime(from)} – {fmtTime(to)} · {formatINR(svc.pricePaise)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl bg-navy-50/70 p-4 text-sm text-slate-600">
        <p>
          When you continue we <strong>hold this time for {HOLD_MINUTES} minutes</strong> and create <strong>one Razorpay order</strong> for all {slugs.length > 1 ? `${slugs.length} services` : "of it"}. Nothing is
          confirmed until the payment is verified on our server.
        </p>
      </div>
      <label className="mt-4 flex items-start gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-teal-700" />I agree to the cancellation & refund policy (free cancellation up to 2 h before the visit).
      </label>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          variant="teal"
          disabled={!agree || busy}
          onClick={() => {
            setBusy(true);
            setTimeout(() => {
              const r = createOrder(slugs, address, slotISO);
              setBusy(false);
              if (r.ok && r.id) onHeld(r.id);
              else if (!r.ok) {
                toast.error(r.error);
                onSlotTaken();
              }
            }, 700);
          }}
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Hold time & pay once
        </Button>
      </div>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-medium text-slate-900 sm:max-w-[60%] sm:text-right">{v}</dd>
    </div>
  );
}

const VERIFY_STEPS = [
  "payment.captured webhook received",
  "Signature verified on raw body",
  "Amount, currency & order matched",
  "Booking confirmed · QR issued",
];

function PaymentStep({ group, onRestart }: { group: string; onRestart: () => void }) {
  const all = useApp((s) => s.bookings);
  const items = useMemo(() => all.filter((b) => b.group === group), [all, group]);
  const booking = items[0];
  const total = items.reduce((n, b) => n + b.amounts.total, 0);
  const payOrder = useApp((s) => s.payOrder);
  const expireOrder = useApp((s) => s.expireOrder);
  const [method, setMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [now, setNow] = useState(() => Date.now());
  const [verifying, setVerifying] = useState(-1);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = booking?.holdExpiresAt
    ? Math.max(0, new Date(booking.holdExpiresAt).getTime() - now)
    : 0;
  useEffect(() => {
    if (
      booking?.status === "PENDING_PAYMENT" &&
      remaining === 0 &&
      verifying < 0
    )
      expireOrder(group);
  }, [remaining, booking?.status, group, expireOrder, verifying]);

  // Tick through the verification checks; once all pass, the confirmation sequence takes over.
  useEffect(() => {
    if (verifying < 0 || verifying >= VERIFY_STEPS.length) return;
    const t = setTimeout(() => setVerifying((v) => v + 1), 700);
    return () => clearTimeout(t);
  }, [verifying]);

  if (!booking) return null;

  if (booking.status === "EXPIRED")
    return (
      <Card className="p-8 text-center">
        <Clock className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-lg font-semibold">Your slot hold expired</h2>
        <p className="mt-1 text-sm text-slate-500">
          No payment was taken. The slot has been released for others.
        </p>
        <Button className="mt-6" variant="teal" onClick={onRestart}>
          Pick a new time
        </Button>
      </Card>
    );

  if (verifying >= 0) {
    const doneAll = verifying >= VERIFY_STEPS.length;
    return (
      <>
        <Card className="p-8">
          <div className="flex items-center gap-3">
            {doneAll ? (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-cream">
                <Check className="h-4 w-4" />
              </span>
            ) : (
              <LoaderCircle className="h-6 w-6 animate-spin text-ink" />
            )}
            <h2 className="text-lg font-semibold">{doneAll ? "Payment verified" : "Verifying your payment…"}</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">The browser callback isn&apos;t proof of payment — we wait for the signed webhook.</p>
          <ol className="relative mt-6 space-y-4 pl-9">
            {/* progress rail */}
            <span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-0.5 rounded-full bg-ink/10" />
            <motion.span
              aria-hidden
              className="absolute left-[11px] top-3 w-0.5 origin-top rounded-full bg-ink"
              style={{ bottom: 12 }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: Math.min(1, Math.max(0, verifying) / (VERIFY_STEPS.length - 1)) }}
              transition={{ duration: 0.6, ease: EASE }}
            />
            {VERIFY_STEPS.map((s, i) => {
              const done = i < verifying;
              return (
                <li key={s} className={cn("relative flex items-center text-sm transition-colors", done ? "text-slate-900" : "text-slate-400")}>
                  <span
                    className={cn(
                      "absolute -left-9 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                      done ? "border-ink bg-ink text-cream" : i === verifying ? "border-ink bg-paper" : "border-ink/15 bg-paper",
                    )}
                  >
                    {done ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
                        <Check className="h-3.5 w-3.5" />
                      </motion.span>
                    ) : i === verifying ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-ink" />
                    ) : null}
                  </span>
                  {s}
                </li>
              );
            })}
          </ol>
        </Card>
        {doneAll && <BookingConfirmed bookings={items} />}
      </>
    );
  }

  const mm = Math.floor(remaining / 60000);
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between bg-[#0c2451] px-6 py-4 text-white">
        <div>
          <div className="text-xs text-white/60">
            Razorpay Checkout · Test mode
          </div>
          <div className="font-semibold">
            HomeCrew · {items.length} service{items.length > 1 ? "s" : ""}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold">
            {formatINR(total)}
          </div>
          <div className="text-[11px] text-white/60">
            {booking.payment.orderId}
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Slot held for you
          </span>
          <span className="font-mono font-semibold">
            {mm}:{ss}
          </span>
        </div>
        {booking.payment.status === "FAILED" && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
            <CircleAlert className="h-4 w-4" /> Last attempt failed. You can
            retry while the hold is active.
          </p>
        )}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { id: "upi", label: "UPI", icon: Smartphone },
            { id: "card", label: "Card", icon: CreditCard },
            { id: "netbanking", label: "Netbanking", icon: Landmark },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id as typeof method)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition",
                method === m.id
                  ? "border-[#0c2451] bg-slate-50 font-medium"
                  : "border-slate-200 text-slate-600",
              )}
            >
              <m.icon className="h-5 w-5" /> {m.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {method === "upi" && (
            <Input defaultValue="success@razorpay" aria-label="UPI ID" />
          )}
          {method === "card" && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                className="col-span-2"
                defaultValue="4111 1111 1111 1111"
                aria-label="Card number"
              />
              <Input defaultValue="12/30" aria-label="Expiry" />
              <Input defaultValue="123" aria-label="CVV" />
            </div>
          )}
          {method === "netbanking" && (
            <select className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
              <option>HDFC Bank</option>
              <option>State Bank of India</option>
              <option>ICICI Bank</option>
            </select>
          )}
        </div>
        <Button
          size="lg"
          className="mt-5 w-full bg-[#0c2451] hover:bg-[#13306b]"
          onClick={() => {
            const r = payOrder(group, "success");
            if (r.ok) setVerifying(0);
            else toast.error(r.error);
          }}
        >
          Pay {formatINR(total)}
        </Button>
        <button
          className="mt-3 w-full text-center text-xs text-slate-400 hover:text-red-600"
          onClick={() => {
            const r = payOrder(group, "failure");
            if (!r.ok) toast.error(r.error);
          }}
        >
          Simulate a failed payment
        </button>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" /> Demo checkout — no real money
          moves
        </p>
      </div>
    </Card>
  );
}
