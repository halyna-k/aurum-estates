"use client";

import { useId } from "react";
import { useChat } from "@/hooks/useChat";
import ChatFAB from "./ChatFAB";
import ChatPanel from "./ChatPanel";
import { agency } from "@/agency/config";
import AgentPreview from "@/components/agent/AgentPreview";

export default function ChatWidget() {
  const chat = useChat();
  const { fabRef } = chat;
  const panelId = useId();

  return (
    <>
      {chat.open && (
        <ChatPanel
          id={panelId}
          messages={chat.messages}
          state={chat.state}
          loading={chat.loading}
          inputRef={chat.inputRef}
          onSend={chat.send}
          onAcknowledge={chat.acknowledgePrivacyNotice}
          onDecline={chat.declinePrivacyNotice}
          onReset={chat.reset}
          onClose={chat.closeChat}
        />
      )}
      {agency.isDemo && chat.open && chat.state.agentPreview && (
        <AgentPreview preview={chat.state.agentPreview} lead={chat.state.leadData} />
      )}
      <ChatFAB
        ref={fabRef}
        open={chat.open}
        unread={chat.unread}
        pulse={chat.pulse}
        panelId={panelId}
        onClick={chat.open ? chat.closeChat : chat.openChat}
      />
    </>
  );
}
