"use client";

import Link from "next/link";
import styles from "./Footer.module.css";
import { Logo } from "@/components";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className={`container ${styles.footer}`}>
      <div className={styles.grid}>
        {/* Brand */}
        <div className={styles.brand}>
          <Logo />

          <p className={styles.tagline}>
            A premier AI-powered estate platform. Connecting people with homes through intelligent search.
          </p>
        </div>

        {/* Services */}
        <nav className={styles.col} aria-label="Footer services navigation">
          <h4>Services</h4>
          <ul>
            <li><Link href="#services">Residential Lettings</Link></li>
            <li><Link href="#services">Property Sales</Link></li>
            <li><Link href="#services">Landlord Services</Link></li>
            <li><Link href="#ai">AI Property Search</Link></li>
          </ul>
        </nav>

        {/* Contact */}
        <div className={styles.col} aria-label="Footer contact information">
          <h4>Contact</h4>
          <ul>
            <li>
              <a href="mailto:hello@aurumestates.co.uk">
                hello@aurumestates.co.uk
              </a>
            </li>
            <li>
              <a href="tel:+442070000000">+44 20 7000 0000</a>
            </li>
            <li>Mon–Fri 9am–6pm</li>
          </ul>
        </div>

      </div>

      {/* Bottom */}
      <div className={styles.bottom}>
        <span>&copy; {year} Aurum Estates. All rights reserved.</span>

        <div className={styles.bottomRight}>
          <span>AI system & website developed by GK.</span>
          <span>Concept project.</span>
        </div>
      </div>
    </footer>
  );
}
