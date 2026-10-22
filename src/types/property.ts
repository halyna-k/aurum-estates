import type { IsoDate } from "./lead";

export const PROPERTY_TYPES = ["studio", "flat", "house", "room", "other"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const EPC_RATINGS = ["A", "B", "C", "D", "E", "F", "G"] as const;
export type EpcRating = (typeof EPC_RATINGS)[number];

export const COUNCIL_TAX_BANDS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
export type CouncilTaxBand = (typeof COUNCIL_TAX_BANDS)[number];

export const FURNISHING = ["furnished", "part_furnished", "unfurnished"] as const;
export type Furnishing = (typeof FURNISHING)[number];

export interface PropertyImage {
  src: string;
  alt: string;
}

export interface Property {
  id: string;
  type: PropertyType;
  image: PropertyImage;

  /** Neighbourhood, e.g. "Canonbury". */
  area: string;
  address: string;

  /** Advertised rent in GBP per calendar month. */
  rentPcm: number;
  /** Tenancy deposit in GBP. Must not exceed the Tenant Fees Act cap. */
  deposit: number;
  availableFrom: IsoDate;
  furnishing: Furnishing;
  councilTaxBand: CouncilTaxBand;
  epcRating: EpcRating;

  /** Studios have 0 bedrooms. */
  bedrooms: number;
  bathrooms: number;
  floorAreaSqFt?: number;
}
