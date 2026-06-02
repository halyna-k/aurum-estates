"use client";

import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement>(className: string) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(className);
          observer.disconnect();
        }
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [className]);

  return ref;
}
