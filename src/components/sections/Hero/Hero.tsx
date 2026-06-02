import styles from "./Hero.module.css";
import { Button } from "@/components";

const stats = [
  ["500+", "Properties Listed"],
  ["98%", "Client Satisfaction"],
  ["24/7", "AI Support"],
] as const;

export default function Hero() {
  return (
    <section className={styles.hero} id="home" aria-label="Hero section">
      <div className={styles.grid} />

      <div className={styles.inner}>
        <p className={styles.eyebrow}>Premium Real Estate</p>

        <h1 className={styles.title}>
          Where <em>Exceptional</em>
          <br />
          Homes Are Found
        </h1>

        <p className={styles.subtitle}>
          AI-powered property matching, curated for discerning clients
        </p>

        <p className={styles.desc}>
          Aurum Estates combines decades of market expertise with cutting-edge
          artificial intelligence — so your next home finds you first.
        </p>

        <div className={styles.actions}>
          <Button href="#properties" text="View Properties" />
          <Button href="#services" text="Our Services" />
        </div>

        <dl className={styles.stats}>
          {stats.map(([value, label]) => (
            <div key={label} className={styles.stat}>
              <dt className={styles.num}>{value}</dt>
              <dd className={styles.label}>{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
