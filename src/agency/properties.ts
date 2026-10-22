import type { Property } from "@/types/property";
import type { IsoDate } from "@/types/lead";

function inDays(days: number): IsoDate {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const PROPERTIES: Property[] = [
  {
    id: "brook-street-14",
    type: "flat",
    image: {
      src: "/images/properties/brook-street-14.jpg",
      alt: "Living room of a three-bedroom flat",
    },
    area: "Mayfair",
    address: "14 Brook Street, Mayfair, W1K",
    rentPcm: 6500,
    deposit: 7500,
    availableFrom: inDays(0),
    furnishing: "part_furnished",
    councilTaxBand: "G",
    epcRating: "C",
    bedrooms: 3,
    bathrooms: 2,
    floorAreaSqFt: 1450,
  },
  {
    id: "cadogan-place-7",
    type: "flat",
    image: {
      src: "/images/properties/cadogan-place-7.jpg",
      alt: "Exterior of a modern residential building",
    },
    area: "Chelsea",
    address: "7 Cadogan Place, Chelsea, SW3",
    rentPcm: 3200,
    deposit: 3692,
    availableFrom: inDays(14),
    furnishing: "furnished",
    councilTaxBand: "E",
    epcRating: "D",
    bedrooms: 2,
    bathrooms: 1,
    floorAreaSqFt: 820,
  },
  {
    id: "bethnal-green-road-23",
    type: "flat",
    image: {
      src: "/images/properties/bethnal-green-road-23.jpg",
      alt: "Open-plan living area of a one-bedroom flat",
    },
    area: "Shoreditch",
    address: "23 Bethnal Green Road, E1",
    rentPcm: 2100,
    deposit: 2423,
    availableFrom: inDays(30),
    furnishing: "unfurnished",
    councilTaxBand: "C",
    epcRating: "C",
    bedrooms: 1,
    bathrooms: 1,
    floorAreaSqFt: 550,
  },
];
