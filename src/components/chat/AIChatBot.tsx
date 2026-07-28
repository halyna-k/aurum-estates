"use client";

import { useChat } from "@/hooks/useChat";
import ChatPanel from "./ChatPanel";
import ChatFAB from "./ChatFAB";

// AIChatBot is a pure composition component that renders the ChatPanel and ChatFAB.
// All state and handlers live in useChat → useConversation.

export default function AIChatBot() {
  const chat = useChat();

  return (
    <div className="fixed bottom-0 right-0 z-300">
      <ChatPanel {...chat} />
      <ChatFAB {...chat} onClick={() => chat.setOpen((v) => !v)} />
    </div>
  );
}
