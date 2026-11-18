import { Badge, type Tone } from "@/components/atoms/ui";
import type { BookingStatus, PaymentStatus } from "@/lib/store";

const bookingTone: Record<BookingStatus, Tone> = {
  PENDING_PAYMENT: "amber",
  CONFIRMED: "blue",
  ASSIGNED: "violet",
  IN_PROGRESS: "teal",
  COMPLETED: "green",
  CANCELLED: "red",
  EXPIRED: "slate",
};

export const statusLabel = (s: string) =>
  s
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={bookingTone[status]}>{statusLabel(status)}</Badge>;
}

const payTone: Record<PaymentStatus, Tone> = {
  CREATED: "amber",
  CAPTURED: "green",
  FAILED: "red",
  REFUND_PENDING: "amber",
  REFUNDED: "slate",
};
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={payTone[status]}>{statusLabel(status)}</Badge>;
}
