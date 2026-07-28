type ChatFABProps = {
  open: boolean;
  unread: number;
  pulse: boolean;
  onClick: () => void;
};

export default function ChatFAB({ open, pulse, unread, onClick }:ChatFABProps) {

  const tooltipText = open ? "Close AI assistant" : "Open AI rental assistant";

  return (
    <button
      onClick={onClick}
      aria-label={tooltipText}
      className={`
        group fixed bottom-7 right-7 z-301
        flex h-14 w-14 items-center justify-center
        rounded-full
        transition-[background,transform,box-shadow] duration-300
        ${
          open
            ? "bg-(--bg-5) text-primary shadow-custom hover:bg-bg-4"
            : "bg-(--gold) text-white shadow-[0_4px_20px_color-mix(in_srgb,var(--gold)_40%,transparent)] hover:scale-[1.08] hover:bg-gold-light"
        }
        ${pulse && !open ? "animate-fab-pulse relative" : ""}
      `}
    >
      {/* Chat icon */}
      <span
        className={`
          absolute flex items-center justify-center
          transition-[opacity,transform] duration-200
          ${
            open
              ? "pointer-events-none scale-50 opacity-0"
              : "scale-100 opacity-100"
          }
        `}
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </span>

      {/* Close icon */}
      <span
        className={`
          absolute flex items-center justify-center
          transition-[opacity,transform] duration-200
          ${
            !open
              ? "pointer-events-none scale-50 opacity-0"
              : "scale-100 opacity-100"
          }
        `}
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </span>

      {/* Unread badge */}
      {!open && unread > 0 && (
        <span
            className="
            absolute -right-0.5 -top-0.5
            flex h-4.5 min-w-4.5
            items-center justify-center
            rounded-full
            border-2 border(--bg-2)
            bg-red-500
            px-1
            text-[10px]
            font-bold
            text-white
          "
        >
          {unread}
        </span>
      )}

      {/* Tooltip */}
      {!open && (
        <span
          className="
            pointer-events-none absolute right-16 top-1/2
            -translate-y-1/2
            whitespace-nowrap
            rounded
            border border-(--border)
            bg-(--bg-4)
            px-3 py-1.5
            text-[11px]
            font-medium
            text-(--text-primary)
            shadow-custom
            opacity-0
            transition-opacity duration-200
            group-hover:opacity-100
            max-sm:hidden
          "
        >
          Chat with Aura AI
        </span>
      )}
    </button>
  );
}
