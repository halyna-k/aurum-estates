import { formatDate } from "@/lib/format";
import type { IsoDate } from "@/types/lead";
import type { Furnishing } from "@/types/property";

/** Tenant Fees Act 2019 cap: 5 weeks' rent, or 6 weeks if annual rent is £50,000 or more. */
export function maxDeposit(rentPcm: number): number {
  const annualRent = rentPcm * 12;
  const weeks = annualRent >= 50_000 ? 6 : 5;
  return Math.floor((annualRent / 52) * weeks);
}

export const FURNISHING_LABELS: Record<Furnishing, string> = {
  furnished: "Furnished",
  part_furnished: "Part-furnished",
  unfurnished: "Unfurnished",
};

export function bedroomsLabel(bedrooms: number): string {
  if (bedrooms === 0) return "Studio";
  return `${bedrooms} ${bedrooms === 1 ? "bed" : "beds"}`;
}

export function availabilityLabel(availableFrom: IsoDate, today = new Date()): string {
  return new Date(availableFrom) <= today ? "Now" : formatDate(availableFrom);
}
