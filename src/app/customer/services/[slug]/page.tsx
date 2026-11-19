import { Suspense } from "react";
import type { Metadata } from "next";
import { Skeleton } from "@/components/atoms/ui";
import { getService, services } from "@/lib/mock-data";
import { AppServiceDetail } from "./service-detail";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: getService(slug)?.title ?? "Service", robots: { index: false, follow: false } };
}

/** Reads the URL param inside Suspense so navigation stays instant. */
async function Detail({ params }: Props) {
  const { slug } = await params;
  return <AppServiceDetail slug={slug} />;
}

export default function CustomerServicePage({ params }: Props) {
  return (
    <Suspense fallback={<Skeleton className="aspect-16/10 w-full rounded-2xl" />}>
      <Detail params={params} />
    </Suspense>
  );
}
