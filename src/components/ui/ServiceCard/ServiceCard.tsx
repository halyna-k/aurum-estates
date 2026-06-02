"use client";

import styles from "./ServiceCard.module.css";

type Props = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

export default function ServiceCard({ title, desc, icon }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{desc}</p>
    </div>
  );
}
