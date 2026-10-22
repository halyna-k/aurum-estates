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
  if (message.role === "user") return "self-end rounded-xl rounded-br-sm bg-brand text-on-brand";
  const border = message.isError ? "border-danger" : "border-line";
  return `self-start rounded-xl rounded-bl-sm border bg-surface-2 text-ink ${border}`;
}

export default function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { assistantName } = agency.chat;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = messages.length > 1 || loading ? list.scrollHeight : 0;
  }, [messages, loading]);

  return (
    <div
      ref={listRef}
      role="log"
      aria-label="Conversation"
      tabIndex={0}
      className="flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-4 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,#000_1rem)] px-4 pt-4 pb-2 motion-safe:scroll-smooth"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`animate-message-in max-w-[85%] px-4 py-3 text-sm leading-relaxed ${bubbleClass(message)}`}
        >
          <p className="[overflow-wrap:anywhere] whitespace-pre-wrap">
            <span className="sr-only">
              {message.role === "user" ? "You" : assistantName} said:{" "}
            </span>
            {message.text}
          </p>
          <time
            dateTime={message.timestamp.toISOString()}
            className="mt-1 block text-right text-xs"
          >
            {formatTime(message.timestamp)}
          </time>
        </div>
      ))}

      {loading && (
        <div className="self-start rounded-xl rounded-bl-sm border border-line bg-surface-2 px-4 py-3">
          <span className="sr-only">{assistantName} is typing</span>
          <div aria-hidden="true" className="flex gap-1">
            <span className="animate-typing-dot size-1.5 rounded-full bg-brand" />
            <span className="animate-typing-dot size-1.5 rounded-full bg-brand" />
            <span className="animate-typing-dot size-1.5 rounded-full bg-brand" />
          </div>
        </div>
      )}
    </div>
  );
}
