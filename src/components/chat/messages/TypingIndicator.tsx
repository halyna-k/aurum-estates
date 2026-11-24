interface TypingIndicatorProps {
  assistantName: string;
}

export default function TypingIndicator({ assistantName }: TypingIndicatorProps) {
  return (
    <div
      role="status"
      className="self-start rounded-xl rounded-bl-sm border border-line bg-surface-2 px-4 py-3"
    >
      <span className="sr-only">{assistantName} is typing</span>

      <div aria-hidden="true" className="flex gap-1">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="animate-typing-dot size-1.5 rounded-full bg-brand" />
        ))}
      </div>
    </div>
  );
}
