"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { agency } from "@/agency/config";
import Button from "@/components/ui/Button";
import { requestChat } from "@/lib/chat/events";
import { formatGbp } from "@/lib/format";
import { FURNISHING_LABELS, availabilityLabel, bedroomsLabel } from "@/lib/property";
import type { Property } from "@/types/property";

export default function PropertyDetails({ property }: { property: Property }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { image, area, address, rentPcm, bedrooms, bathrooms, floorAreaSqFt } = property;

  const facts = [
    bedroomsLabel(bedrooms),
    `${bathrooms} ${bathrooms === 1 ? "bath" : "baths"}`,
    floorAreaSqFt && `${floorAreaSqFt.toLocaleString("en-GB")} sq ft`,
  ].filter((fact): fact is string => Boolean(fact));

  const rows: [string, string][] = [
    ["Available", availabilityLabel(property.availableFrom)],
    ["Deposit", formatGbp(property.deposit)],
    ["Furnishing", FURNISHING_LABELS[property.furnishing]],
    ["EPC rating", property.epcRating],
    ["Council tax", `Band ${property.councilTaxBand}`],
  ];

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-ink transition-colors group-hover:text-brand after:absolute after:inset-0"
      >
        View details
        <span className="sr-only"> for {address}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="animate-sheet-in m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-2xl border border-line bg-surface text-ink backdrop:bg-black/70 md:m-auto md:max-w-lg md:rounded-2xl"
      >
        <div className="relative h-48 md:aspect-video md:h-auto">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 767px) 100vw, 512px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Close details"
            className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-brand/50 text-white backdrop-blur transition-colors hover:bg-brand/70"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6">
          <p className="font-serif text-xs tracking-label text-ink-muted uppercase">{area}</p>
          <h2 id={titleId} className="mt-1 font-serif text-xl md:text-2xl">
            {address}
          </h2>
          <p className="mt-2 font-serif text-2xl text-brand md:text-3xl">
            {formatGbp(rentPcm)}
            <span className="ml-1 font-sans text-sm text-ink-muted">pcm</span>
          </p>

          <ul className="mt-3 flex flex-wrap gap-2 md:mt-4">
            {facts.map((fact) => (
              <li key={fact} className="rounded-lg border border-line px-3 py-2 text-sm">
                {fact}
              </li>
            ))}
          </ul>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 md:mt-6 md:gap-y-4 md:pt-6">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-ink-muted">{label}</dt>
                <dd className="mt-1 text-sm">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 flex justify-end md:mt-6">
            <Button
              size="sm"
              onClick={() => {
                close();
                requestChat(property.id);
              }}
            >
              Ask {agency.chat.assistantName}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
