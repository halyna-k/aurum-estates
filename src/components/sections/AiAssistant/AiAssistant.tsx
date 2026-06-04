"use client";

import { useEffect, useState } from "react";

export default function AiAssistant() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
      <button
        id="bp-toggle-chat"
        className={`
          fixed bottom-8 right-8
          px-5 py-3
          rounded-md
          text-white
          shadow-xl
          bg-[var(--gold)]
          transition-all duration-600 ease-out
          hover:scale-105

          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        `}
      >
        AI Advisor
      </button>
  );
}
