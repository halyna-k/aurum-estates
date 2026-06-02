import React from "react";

export type Service = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

export const SERVICES: Service[] = [
  {
    title: "Residential Lettings",
    desc: "Premium rental properties across prime locations. Studio to 6-bed, short-term to long-term — our AI matches you instantly.",
    icon: React.createElement(
      "svg",
      {
        width: 20,
        height: 20,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.5,
      },
      React.createElement("path", { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" }),
      React.createElement("polyline", { points: "9 22 9 12 15 12 15 22" })
    ),
  },
  {
    title: "Property Sales",
    desc: "Expert guidance for buyers and sellers in the most sought-after postcodes. Valuation, negotiation, completion — end-to-end.",
    icon: React.createElement(
      "svg",
      {
        width: 20,
        height: 20,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.5,
      },
      React.createElement("rect", { x: 2, y: 7, width: 20, height: 14, rx: 2 }),
      React.createElement("path", { d: "M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" })
    ),
  },
  {
    title: "Landlord Management",
    desc: "Full property management: tenant sourcing, compliance, maintenance, and rent collection — invest without the hassle.",
    icon: React.createElement(
      "svg",
      {
        width: 20,
        height: 20,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.5,
      },
      React.createElement("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" })
    ),
  },
  {
    title: "AI Property Search",
    desc: "Tell our AI assistant your needs in plain English. It searches, filters, and recommends — any time of day, instantly.",
    icon: React.createElement(
      "svg",
      {
        width: 20,
        height: 20,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.5,
      },
      React.createElement("circle", { cx: 11, cy: 11, r: 8 }),
      React.createElement("path", { d: "M21 21l-4.35-4.35" })
    ),
  },
];
