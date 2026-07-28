"use client";

import { useEffect, useRef } from "react";

type ChatInputProps = {
  ref: React.RefObject<HTMLInputElement>;
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  send: (message: string) => void;
};

export default function ChatInput({ ref, input, setInput, loading, send }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when loading state changes
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  return (
    <div className="flex shrink-0 gap-2 border-t border-(--border) bg-(--bg-4) px-3.25 py-2.75">
      <input
        ref={ref || inputRef}
        value={input}
        disabled={loading}
        maxLength={500}
        aria-label="Chat input"
        placeholder={loading ? "Aura is typing…" : "Type your message…"}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send(input);
          }
        }}
        className="
          flex-1
          rounded
          border border-(--border)
          bg-(--bg-3)
          px-3 py-2.25
          text-[12px] text-primary
          outline-none
          transition-colors
          placeholder:text-muted-foreground
          focus:border-(--gold)
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      />

      <button
        onClick={() => send(input)}
        disabled={loading || !input.trim()}
        aria-label="Send message"
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded
          bg-(--gold)
          text-white
          leading-none
          transition-all duration-200
          hover:scale-105
          hover:bg-(--gold-light)
          disabled:cursor-not-allowed
          disabled:opacity-40
          disabled:hover:scale-100
        "
      >
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="currentColor"
        >
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
}
