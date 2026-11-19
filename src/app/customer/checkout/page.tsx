"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/atoms/ui";
import { CheckoutFlow } from "@/app/checkout/checkout-flow";
import { getService } from "@/lib/mock-data";

/** In-app checkout: same booking flow, inside the HomeCrew app shell. */
function AppCheckout() {
  const service = useSearchParams().get("service");
  const only = service && getService(service) ? service : undefined;
  return <CheckoutFlow servicesHref="/customer/services" only={only} />;
}

export default function CustomerCheckoutPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AppCheckout />
    </Suspense>
  );
}
