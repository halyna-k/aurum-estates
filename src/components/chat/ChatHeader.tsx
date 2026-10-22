import { agency } from "@/agency/config";

interface ChatHeaderProps {
  onNewChat: () => void;
  onClose: () => void;
}

const ICON_BUTTON =
  "grid size-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink";

export default function ChatHeader({ onNewChat, onClose }: ChatHeaderProps) {
  const { assistantName } = agency.chat;

  return (
    <header className="flex shrink-0 items-center gap-2 px-4 py-4">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-brand font-medium text-on-brand"
      >
        {assistantName[0]}
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-medium text-ink">{assistantName}</h2>
        <p className="truncate text-xs text-ink-muted">AI assistant for {agency.brand.name}</p>
      </div>

      <button
        type="button"
        onClick={onNewChat}
        aria-label="Start a new chat"
        className={ICON_BUTTON}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
      </button>

      <button type="button" onClick={onClose} aria-label="Close chat" className={ICON_BUTTON}>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </header>
  );
}
