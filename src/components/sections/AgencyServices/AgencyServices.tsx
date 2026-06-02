"use client";

import styles from "./AgencyServices.module.css";

import { SectionHeader, ServiceCard } from "@/components";
import { SERVICES } from "@/data/services";

export default function AgencyServices() {
  return (
    <section className={`section container ${styles.section}`} id="services">
      <SectionHeader
        eyebrow="What We Offer"
        title={
          <>
            A Full Spectrum <br />
            of <em>Property Services</em>
          </>
        }
        desc="From first enquiry to signed tenancy, our team and AI tools guide you through every step."
      />

      <div className={styles.grid}>
        {SERVICES.map((s, index) => (
          <ServiceCard
            key={s.title}
            title={s.title}
            desc={s.desc}
            icon={s.icon}
            delay={index}
          />
        ))}
      </div>
    </section>
  );
}
