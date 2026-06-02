"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import { Logo } from "@/components";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <nav className={`container ${styles.nav}`} aria-label="Main navigation">

        <Logo />

        <ul className={styles.links}>
          <li><Link href="#services">Services</Link></li>
          <li><Link href="#properties">Properties</Link></li>
          <li><Link href="#contact">Contact</Link></li>
        </ul>

        <Link href="#properties" className={styles.cta}>
          Find a Property
        </Link>
      </nav>
    </header>
  );
}
