"use client";

import { useReveal } from "@/hooks/useReveal";
import styles from "./ServiceCard.module.css";

type Props = {
  title: string;
  desc: string;
  icon: React.ReactNode;
  delay?: number;
};

export default function ServiceCard({ title, desc, icon, delay = 0 }: Props) {
  const ref = useReveal<HTMLDivElement>("visible");

  return (
    <div
      ref={ref}
      className={`card ${styles.card}`}
      style={{ transitionDelay: `${delay * 180}ms` }}
    >
      <div className={styles.iconWrap}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{desc}</p>
    </div>
  );
}
