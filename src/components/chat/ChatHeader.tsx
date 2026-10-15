import { agency } from "@/agency/config";

export default function ChatHeader({ onClose }: { onClose: () => void }) {
  const { assistantName } = agency.chat;

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-line p-3 sm:p-5">
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
        onClick={onClose}
        aria-label="Close chat"
        className="grid size-11 shrink-0 place-items-center rounded-md text-ink-muted transition-colors hover:text-ink"
      >
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
