import type { ReactNode } from "react";

interface NotificationBarProps {
  tone?: "success" | "info";
  children: ReactNode;
}

export default function NotificationBar({ tone = "info", children }: NotificationBarProps) {
  return (
    <div
      className={`mx-4 mb-2 flex shrink-0 items-start gap-2 rounded-xl px-4 py-3 text-sm text-ink ${
        tone === "success" ? "bg-success/10" : "bg-surface-2"
      }`}
    >
      {tone === "success" && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="mt-0.5 size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 5 5L20 7" />
        </svg>
      )}
      <p>{children}</p>
    </div>
  );
}
