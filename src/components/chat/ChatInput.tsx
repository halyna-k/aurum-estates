"use client";

import { useState, type ReactNode, type Ref } from "react";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat/limits";

interface ChatInputProps {
  ref?: Ref<HTMLInputElement>;
  busy: boolean;
  onSend: (text: string) => void;
  /** Extra buttons before Send, e.g. voice input later. */
  actions?: ReactNode;
}

export default function ChatInput({ ref, busy, onSend, actions }: ChatInputProps) {
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
      className="mx-4 mt-2 flex shrink-0 items-center gap-1 rounded-xl border border-line-strong bg-surface-2 py-1 pr-1 pl-4 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand"
    >
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={MAX_MESSAGE_LENGTH}
        autoComplete="off"
        aria-label="Your message"
        placeholder="Type here ..."
        className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink placeholder:text-ink-muted focus:outline-none"
      />
      {actions}
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-40"
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
