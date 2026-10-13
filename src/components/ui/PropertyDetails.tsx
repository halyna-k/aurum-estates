"use client";

import { useId, useRef } from "react";
import Button from "@/components/ui/Button";

interface PropertyDetailsProps {
  address: string;
  rows: [label: string, value: string][];
}

export default function PropertyDetails({ address, rows }: PropertyDetailsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="min-h-8 items-right text-xs md:text-sm text-ink underline underline-offset-3 hover:text-brand pt-3"
      >
        View details
        <span className="sr-only"> for {address}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-md border border-line bg-surface p-4 sm:p-6 text-ink backdrop:bg-black/70"
      >
        <h2 id={titleId} className="font-serif text-xl">
          {address}
        </h2>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs sm:text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-ink-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => dialogRef.current?.close()} variant="secondary" className="text-xs sm:text-sm">
            Close
          </Button>
        </div>
      </dialog>
    </>
  );
}
