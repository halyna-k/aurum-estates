"use client";

import { useEffect, useRef } from "react";
import { agency } from "@/agency/config";
import { formatTime } from "@/lib/format";
import type { UIMessage } from "@/types/chat";

interface ChatMessagesProps {
  messages: UIMessage[];
  loading: boolean;
}

function bubbleClass(message: UIMessage): string {
  if (message.role === "user") return "self-end rounded-br-sm bg-brand text-on-brand";
  const border = message.isError ? "border-danger" : "border-line";
  return `self-start rounded-bl-sm border bg-surface-2 text-ink ${border}`;
}

export default function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { assistantName } = agency.chat;

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, loading]);

  return (
    <div
      ref={listRef}
      role="log"
      aria-label="Conversation"
      tabIndex={0}
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 [scrollbar-width:thin] motion-safe:scroll-smooth"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`animate-message-in max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${bubbleClass(message)}`}
        >
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
            <span className="sr-only">{message.role === "user" ? "You" : assistantName} said: </span>
            {message.text}
          </p>
          <time dateTime={message.timestamp.toISOString()} className="mt-1 block text-right text-xs">
            {formatTime(message.timestamp)}
          </time>
        </div>
      ))}

      {loading && (
        <div className="self-start rounded-lg rounded-bl-sm border border-line bg-surface-2 px-3.5 py-3">
          <span className="sr-only">{assistantName} is typing</span>
          <div aria-hidden="true" className="flex gap-1">
            <span className="size-1.5 animate-typing-dot rounded-full bg-brand" />
            <span className="size-1.5 animate-typing-dot rounded-full bg-brand" />
            <span className="size-1.5 animate-typing-dot rounded-full bg-brand" />
          </div>
        </div>
      )}
    </div>
  );
}
