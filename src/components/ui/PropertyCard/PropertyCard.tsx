"use client";

import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";

import { PROPERTIES } from "@/data/properties";
import styles from "./PropertyCard.module.css";

type Props = {
  property: typeof PROPERTIES[0];
  delay: number;
};

export default function PropertyCard({ property, delay }: Props) {
  const ref = useReveal<HTMLDivElement>("visible");

  return (
    <div
      ref={ref}
      className={`card ${styles.card}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={styles.imgWrap}>
        <Image
          src={property.img}
          alt={property.alt}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className={styles.img}
        />
        <div className={styles.overlay} />
        <span className={styles.tag}>{property.tag}</span>
        <span className={styles.area}>{property.area}</span>
      </div>
      <div className={styles.body}>

        <div className={styles.price}>
          {property.price}
          <span className={styles.period}>{property.period}</span>
        </div>

        <div className={styles.address}>{property.address}</div>

        <div className={styles.specs}>
          <span>
            <strong>{property.beds}</strong> beds
          </span>
          <span>
            <strong>{property.baths}</strong> bath{property.baths > 1 ? "s" : ""}
          </span>
          <span>
            <strong>{property.size}</strong> sq ft
          </span>
        </div>
      </div>
    </div>
  );
}
