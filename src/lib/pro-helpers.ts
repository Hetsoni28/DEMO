import type { Booking } from "./store";

/** Professional payout share for the demo (platform keeps 20% of the base amount). */
export const PAYOUT_SHARE = 0.8;

export function payout(b: Booking) {
  const extra = b.extraQuote?.status === "APPROVED" ? b.extraQuote.amountPaise : 0;
  return Math.round((b.amounts.base + extra) * PAYOUT_SHARE);
}
