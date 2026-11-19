import Image from "next/image";
import { categoryIcons } from "@/components/atoms/icons";
import { getCategory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/**
 * Photos cut from the HomeCrew brand film (real scenes of the crew at work).
 * Trades without footage yet get a designed cover in the same palette — drop a
 * 4:3 photo at /media/services/<category>.webp and add it here to replace it.
 */
const PHOTOS: Record<string, { src: string; position?: string }> = {
  cleaning: { src: "/media/services/cleaning.webp", position: "50% 40%" },
  plumbing: { src: "/media/services/plumbing.webp", position: "50% 30%" },
  electrical: { src: "/media/services/electrical.webp", position: "50% 25%" },
  appliances: { src: "/media/services/appliances.webp", position: "50% 30%" },
};

/** Soft tints for trades shown as designed covers. */
const COVER_TINT: Record<string, string> = {
  carpentry: "from-[#E9DCC6] to-[#D9C4A3]",
  painting: "from-[#E3E6F3] to-[#CBD1EC]",
  "pest-control": "from-[#DDEBDF] to-[#C2DCC7]",
};

export function hasServicePhoto(categorySlug: string) {
  return !!PHOTOS[categorySlug];
}

export function ServiceImage({
  categorySlug,
  alt,
  className,
  priority = false,
  sizes = "(min-width: 1024px) 240px, 45vw",
}: {
  categorySlug: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const photo = PHOTOS[categorySlug];
  if (photo)
    return (
      <div className={cn("relative overflow-hidden bg-cream", className)}>
        <Image src={photo.src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: photo.position ?? "50% 50%" }} />
      </div>
    );

  const cat = getCategory(categorySlug);
  const Icon = cat ? categoryIcons[cat.icon] : null;
  return (
    <div role="img" aria-label={alt} className={cn("relative flex items-center justify-center overflow-hidden bg-linear-to-br", COVER_TINT[categorySlug] ?? "from-cream to-paper", className)}>
      {/* soft rings behind the trade mark */}
      <span aria-hidden className="absolute h-[140%] w-[140%] rounded-full border border-white/30" />
      <span aria-hidden className="absolute h-[90%] w-[90%] rounded-full border border-white/40" />
      {Icon && (
        <span className="relative flex h-[42%] max-h-24 min-h-12 items-center justify-center rounded-2xl bg-white/80 p-[6%] text-ink shadow-[0_12px_30px_-16px_rgba(40,43,74,0.5)] backdrop-blur" style={{ aspectRatio: "1 / 1" }}>
          <Icon className="h-full w-full" strokeWidth={1.6} />
        </span>
      )}
    </div>
  );
}
