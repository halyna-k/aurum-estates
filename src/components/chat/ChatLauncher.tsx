import type { Ref } from "react";
import { agency } from "@/agency/config";

interface ChatLauncherProps {
  ref?: Ref<HTMLButtonElement>;
  open: boolean;
  unread: number;
  pulse: boolean;
  panelId: string;
  onClick: () => void;
}

export default function ChatLauncher({
  ref,
  open,
  unread,
  pulse,
  panelId,
  onClick,
}: ChatLauncherProps) {
  const { assistantName } = agency.chat;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={`Chat with ${assistantName}, our AI assistant`}
      className={`group fixed right-3 bottom-5 z-50 grid size-14 place-items-center rounded-full bg-brand text-on-brand shadow-panel transition-colors hover:bg-brand-hover md:right-7 md:bottom-7 ${open ? "max-sm:hidden" : ""} ${
        pulse ? "animate-fab-pulse" : ""
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {open ? (
          <path d="M18 6 6 18M6 6l12 12" />
        ) : (
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        )}
      </svg>

      {!open && unread > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 size-4 rounded-full border-2 border-surface bg-danger"
        />
      )}

      {!open && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-lg border border-line bg-surface-3 px-4 py-2 text-xs font-medium whitespace-nowrap text-ink opacity-0 shadow-panel transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          Chat with {assistantName}
        </span>
      )}
    </button>
  );
}
