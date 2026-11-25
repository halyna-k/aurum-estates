import type { UIMessage } from "@/types/chat";

interface GuidanceProps {
  message: UIMessage;
  loading: boolean;
  onReply: (text: string) => void;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** Displays contextual guidance, suggested replies, and an optional Skip action. */
export default function Guidance({ message, loading, onReply }: GuidanceProps) {
  const { hint, suggestions = [], canSkip } = message;

  if (!hint && suggestions.length === 0 && !canSkip) return null;

  return (
    <div className="clear-both mt-2 space-y-2 border-t border-line py-2">
      {(hint || canSkip) && (
        <div className="flex items-end justify-between gap-3">
          {hint && (
            <p className="min-w-0 text-xs leading-snug text-ink-muted">
              {hint}
            </p>
          )}

          {canSkip && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onReply("Skip")}
              className={`-my-2 -mr-2 ml-auto shrink-0 p-2 text-xs text-ink-muted underline underline-offset-2 transition-colors hover:text-ink active:opacity-70 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
            >
              Skip
            </button>
          )}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              disabled={loading}
              onClick={() => onReply(item)}
              className={`min-h-6 rounded-lg border border-line-strong bg-surface px-2 py-0.5 text-sm text-ink transition-colors hover:border-brand hover:text-brand active:opacity-70 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS}`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
