"use client";

import styles from "./PropertiesList.module.css";
import { PROPERTIES } from "@/data/properties";
import { PropertyCard, SectionHeader } from "@/components";

export default function PropertiesList() {
  return (
    <section className="section container" id="properties">
      <SectionHeader
        eyebrow="Featured Rentals"
        title={
          <>
            Curated <em>Properties</em><br />Available Now
          </>
        }
        desc="A selection of our current rental portfolio. Ask our AI assistant for the full list based on your criteria."
      />

      <div className={`grid ${styles.grid}`}>
        {PROPERTIES.map((p, index) => (
          <PropertyCard
            key={`${p.address}-${p.price}`}
            property={p}
            delay={index * 100}
          />
        ))}
      </div>
    </section>
  );
}
