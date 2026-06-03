"use client";

import styles from "./AgencyServices.module.css";
import { SERVICES } from "@/data/services";
import { SectionHeader, ServiceCard } from "@/components";

export default function AgencyServices() {
  return (
    <section className="section container" id="services">
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

      <div className={`grid ${styles.grid}`}>
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
