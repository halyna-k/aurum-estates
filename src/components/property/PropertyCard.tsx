import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import PropertyDetails from "./PropertyDetails";
import { formatGbp } from "@/lib/format";
import { FURNISHING_LABELS, availabilityLabel, bedroomsLabel } from "@/lib/property";
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

  const details: [string, string][] = [
    ["Rent", `${formatGbp(rentPcm)} pcm`],
    ["Available", availabilityLabel(property.availableFrom)],
    ["Deposit", formatGbp(property.deposit)],
    ["Furnishing", FURNISHING_LABELS[property.furnishing]],
    ["EPC rating", property.epcRating],
    ["Council tax", `Band ${property.councilTaxBand}`],
  ];

  return (
    <li>
      <Reveal delayMs={index * 100} className="h-full">
        <article className="flex h-full flex-col overflow-hidden border border-line bg-surface">
          <div className="relative aspect-4/3 overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-b from-black/5 to-black/60"
            />
            <span className="absolute top-3.5 left-3.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold tracking-wider text-on-brand uppercase">
              {availabilityLabel(property.availableFrom)}
            </span>
            <span className="absolute bottom-3 left-3.5 font-serif text-xs tracking-[0.22em] text-white uppercase">
              {area}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-1 p-5">
            <p className="font-serif text-[1.575rem] text-brand">
              {formatGbp(rentPcm)}
              <span className="ml-1 font-sans text-xs text-ink-muted">pcm</span>
            </p>

            <h3 className="line-clamp-2 min-h-8 text-xs text-ink-secondary">{address}</h3>

            <p className="mb-3 truncate text-xs text-ink">{specs}</p>

            <div className="mt-auto border-t border-line">
              <PropertyDetails address={address} rows={details} />
            </div>
          </div>
        </article>
      </Reveal>
    </li>
  );
}
