"use client";

import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.dataset.inView = "";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // An element above the viewport (anchor jump, restored scroll) counts as seen.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          el.dataset.inView = "";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
