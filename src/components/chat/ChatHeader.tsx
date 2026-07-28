import { QualificationScore } from "@/types/chat"
import ScoreBadge from "./ScoreBadge"

interface ChatHeaderProps {
  loading: boolean;
  state: { qualificationScore?: QualificationScore };
  setOpen: (open: boolean) => void;
}

export default function ChatHeader ({loading, state, setOpen}: ChatHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-(--border) bg-(--bg-2) px-4 py-3.25">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) bg-[color-mix(in_srgb,var(--gold)_15%,transparent)] text-gold">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line
              x1="9"
              y1="9"
              x2="9.01"
              y2="9"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="15"
              y1="9"
              x2="15.01"
              y2="9"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-primary">
            Aura — Rental Assistant
          </p>

          <p className="mt-px flex items-center gap-1.25 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500 animate-blink" />
            {loading ? "Typing…" : "Online"}
          </p>
        </div>
      </div>

    <div className="flex shrink-0 items-center gap-2">
      {state.qualificationScore && (
        <ScoreBadge score={state.qualificationScore} />
      )}

      <button
        onClick={() => setOpen(false)}
        aria-label="Close chat"
        className="p-1 leading-none text-muted-foreground transition-colors hover:text-primary"
      >
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
  )
}
