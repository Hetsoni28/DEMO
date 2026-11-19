import { Suspense } from "react";
import { Skeleton } from "@/components/atoms/ui";
import { AppServicesBrowser } from "./services-browser";


export default function CustomerServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="h-60 rounded-2xl" />
          ))}
        </div>
      }
    >
      <AppServicesBrowser />
    </Suspense>
  );
}
