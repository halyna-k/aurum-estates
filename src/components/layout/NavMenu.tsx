"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

interface NavMenuProps {
  links: { href: string; label: string }[];
}

export default function NavMenu({ links }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  return (
    <nav aria-label="Main">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
        className="-mr-3 grid size-11 place-items-center rounded-md text-brand transition-colors hover:text-brand-hover md:hidden"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d={open ? "M18 6 6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      <ul
        id={menuId}
        className={`absolute inset-x-0 top-full flex-col border-b border-line bg-page px-6 py-2 text-sm text-ink-secondary md:static md:flex md:flex-row md:gap-6 md:border-0 md:bg-transparent md:p-0 ${
          open ? "flex" : "hidden"
        }`}
      >
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center hover:text-ink"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
