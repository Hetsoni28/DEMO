import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/molecules/page-hero";
import { legalPages } from "@/lib/legal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return legalPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  return { title: page?.title ?? "Legal", alternates: { canonical: `/legal/${slug}` }, robots: { index: false } };
}

/** Reads the URL param inside a Suspense boundary so navigation stays instant. */
async function LegalContent({ params }: Props) {
  const { slug } = await params;
  const page = legalPages.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <>
      <PageHero eyebrow={["Legal", "Draft — not yet published"]} index="(L)" lines={[page.title]} />
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="rounded-[28px] border border-dashed border-ink/25 p-8 text-ink/70">
          <p className="font-semibold text-ink">This policy is being finalised.</p>
          <p className="mt-2 leading-relaxed">
            The {page.title.toLowerCase()} for HomeCrew will be published here before launch. This page exists so links across the site resolve correctly during development.
          </p>
        </div>
      </div>
    </>
  );
}

function LegalFallback() {
  return (
    <section className="border-b border-ink/15">
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8">
        <div className="h-4 w-32 animate-pulse rounded bg-ink/10" />
        <div className="mt-14 h-[clamp(3rem,9vw,8rem)] w-3/4 animate-pulse rounded-2xl bg-ink/10" />
      </div>
    </section>
  );
}

export default function LegalPage({ params }: Props) {
  return (
    <Suspense fallback={<LegalFallback />}>
      <LegalContent params={params} />
    </Suspense>
  );
}
