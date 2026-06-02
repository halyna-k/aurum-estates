"use client";

import Link from "next/link";

type ButtonProps = {
  href: string;
  text: string;
};

export default function Button({ href, text }: ButtonProps) {
  const variant = href === "#properties" ? "btn-gold" : "btn-outline";

  return (
    <Link href={href} className={`btn ${variant}`}>
      {text}
    </Link>
  );
}
