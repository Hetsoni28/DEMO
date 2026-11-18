import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/atoms/logo";
import { Skeleton } from "@/components/atoms/ui";
import { BookingFlow } from "@/components/organisms/booking-flow";
import { getService, services } from "@/lib/mock-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Book ${getService(slug)?.title ?? "service"}` };
}

/** Reads the URL param inside Suspense so navigation stays instant. */
async function BookingFlowForSlug({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return <BookingFlow slugs={[slug]} backHref={`/services/${slug}`} backLabel={service.title} />;
}

export default function BookPage({ params }: Props) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
          <span className="text-sm text-slate-500">Secure booking</span>
        </div>
      </header>
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl px-4 py-8">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-8 h-96" />
          </div>
        }
      >
        <BookingFlowForSlug params={params} />
      </Suspense>
    </div>
  );
}
