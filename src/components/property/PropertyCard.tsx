import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import PropertyDetails from "./PropertyDetails";
import { formatGbp } from "@/lib/format";
import { availabilityLabel, bedroomsLabel } from "@/lib/property";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  index: number;
}

export default function PropertyCard({ property, index }: PropertyCardProps) {
  const { image, area, address, rentPcm, bedrooms, bathrooms, floorAreaSqFt } = property;

  const specs = [
    bedroomsLabel(bedrooms),
    `${bathrooms} ${bathrooms === 1 ? "bath" : "baths"}`,
    floorAreaSqFt && `${floorAreaSqFt.toLocaleString("en-GB")} sq ft`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <Reveal delayMs={index * 100} className="h-full">
        <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-brand">
          <div className="relative aspect-4/3 overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 767px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-b from-black/5 to-black/60"
            />
            <span className="absolute top-4 left-4 rounded-lg bg-brand px-3 py-2 text-xs font-semibold tracking-label text-on-brand uppercase">
              {availabilityLabel(property.availableFrom)}
            </span>
            <span className="absolute bottom-4 left-4 font-serif text-xs tracking-label text-white uppercase">
              {area}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-1 p-6">
            <p className="font-serif text-2xl text-brand">
              {formatGbp(rentPcm)}
              <span className="ml-1 font-sans text-xs text-ink-muted">pcm</span>
            </p>

            <h3 className="line-clamp-2 min-h-10 text-sm text-ink-secondary">{address}</h3>

            <p className="mb-4 text-sm text-ink">{specs}</p>

            <div className="mt-auto border-t border-line">
              <PropertyDetails property={property} />
            </div>
          </div>
        </article>
      </Reveal>
    </li>
  );
}
