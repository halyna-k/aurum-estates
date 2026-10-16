"use client";

import { useState, type Ref } from "react";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat/limits";

interface ChatInputProps {
  ref?: Ref<HTMLInputElement>;
  busy: boolean;
  onSend: (text: string) => void;
}

export default function ChatInput({ ref, busy, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const canSend = value.trim().length > 0 && !busy;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        onSend(value);
        setValue("");
      }}
      className="flex shrink-0 gap-3 border-t border-line bg-surface-3 p-3"
    >
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={MAX_MESSAGE_LENGTH}
        autoComplete="off"
        aria-label="Your message"
        placeholder="Type your message"
        className="min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-ink-muted"
      />

      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className="grid size-11 shrink-0 place-items-center rounded-md bg-brand text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-40"
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
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </form>
  );
}
