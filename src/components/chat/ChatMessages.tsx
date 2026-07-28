"use client";

import { useEffect, useRef } from "react";
import { UIMessage } from "@/types/chat";
import { formatTime } from "@/lib/helpers";

type ChatMessagesProps = {
  state: any;
  messages: UIMessage[];
  loading: boolean;
};

export default function ChatMessages({ state, messages, loading }: ChatMessagesProps) {
   const bottomRef  = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, bottomRef]);

  // Render text with line breaks
  const renderText = (text: string) =>
    text.split("\n").map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ));

  return (
    <div
      className="
        flex min-h-45 flex-1 flex-col gap-2.5
        overflow-y-auto
        px-3.5 pt-3.5 pb-2
        scrollbar-thin scrollbar-thumb-border
      "
    >
      {/* Empty state */}
      {messages.length === 0 && state.gdprConsented && !loading && (
        <div className="flex flex-1 items-center justify-center p-6 text-[12px] text-muted-foreground">
          <p>Starting conversation…</p>
        </div>
      )}

      {messages.map((m) => (
        <div
          key={m.id}
          className={`
            max-w-[86%]
            animate-message-in
            px-3.25 py-2.5
            text-[13px] leading-[1.6]
            ${
              m.role === "bot"
                ? "self-start rounded-[3px_10px_10px_3px] border border-(--border) bg-(--bg-5) text-(--text-primary)"
                : "self-end rounded-[10px_3px_3px_10px] border border-(--border) bg-(--bg-5) text-(--text-primary)"
            }
            ${
              m.isError
                ? "border-red-500/40 bg-red-500/5"
                : ""
            }
          `}
        >
          <div className="wrap-break-word whitespace-pre-wrap">
            {renderText(m.text)}
          </div>

          <div className="mt-1 text-right text-[10px] text-muted-foreground">
            {formatTime(m.timestamp)}
          </div>
        </div>
      ))}

      {/* Typing */}
      {loading && (
        <div className="max-w-[86%] self-start rounded-[3px_10px_10px_3px] border border-(--border) bg-(--bg-5) px-3.25 py-2.5">
          <div className="flex items-center gap-1 px-0.5 py-1">
            <span className="block h-1.5 w-1.5 animate-typing-dot rounded-full bg-(--gold)" />
            <span className="block h-1.5 w-1.5 animate-typing-dot delay-200 rounded-full bg-(--gold)" />
            <span className="block h-1.5 w-1.5 animate-typing-dot delay-400 rounded-full bg-(--gold)" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
