import Link from "next/link";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      Aurum <span>Estates</span>
    </Link>
  );
}
