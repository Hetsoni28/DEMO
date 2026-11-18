import { Suspense } from "react";
import { Skeleton } from "@/components/atoms/ui";
import { ReadyGate } from "@/components/molecules/ready-gate";
import { CustomerBookingDetail } from "./booking-detail";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return Array.from({ length: 8 }, (_, i) => ({ id: `b${i + 1}` }));
}

/** Reads the URL param inside Suspense so navigation stays instant. */
async function Detail({ params }: Props) {
  const { id } = await params;
  return (
    <ReadyGate>
      <CustomerBookingDetail id={id} />
    </ReadyGate>
  );
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Detail params={params} />
    </Suspense>
  );
}
