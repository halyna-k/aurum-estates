"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { agency } from "@/agency/config";
import type { UIMessage } from "@/types/chat";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface ChatMessagesProps {
  messages: UIMessage[];
  loading: boolean;
  notice?: ReactNode;
  onReply: (text: string) => void;
}

export default function ChatMessages({ messages, loading, notice, onReply }: ChatMessagesProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { assistantName } = agency.chat;
  const latestId = messages.at(-1)?.id;

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, loading, notice]);

  return (
    <div
      ref={listRef}
      role="log"
      aria-label="Conversation"
      aria-relevant="additions"
      tabIndex={0}
      className="flex min-h-0 flex-1 [scrollbar-width:thin] flex-col gap-3 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,#000_1rem)] px-4 pt-4 pb-2"
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          assistantName={assistantName}
          isLatest={message.id === latestId}
          loading={loading}
          onReply={onReply}
        />
      ))}

      {notice && <div className="max-w-[85%] self-start">{notice}</div>}

      {loading && <TypingIndicator assistantName={assistantName} />}
    </div>
  );
}
