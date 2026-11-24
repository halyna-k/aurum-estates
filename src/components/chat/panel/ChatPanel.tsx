"use client";

import { useEffect, useRef, type RefObject } from "react";
import { agency } from "@/agency/config";
import Button from "@/components/ui/Button";
import type { ConversationState, UIMessage } from "@/types/chat";
import ChatMessages from "../messages/ChatMessages";
import NotificationBar from "../messages/NotificationBar";
import PrivacyNotice from "../PrivacyNotice";
import ChatFooter from "./ChatFooter";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";

interface ChatPanelProps {
  id: string;
  messages: UIMessage[];
  state: ConversationState;
  loading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onSend: (text: string) => void;
  onAcknowledge: () => void;
  onDecline: () => void;
  onReset: () => void;
  onClose: () => void;
}

export default function ChatPanel({
  id,
  messages,
  state,
  loading,
  inputRef,
  onSend,
  onAcknowledge,
  onDecline,
  onReset,
  onClose,
}: ChatPanelProps) {
  const { privacyAcknowledgedAt, privacyDeclined, leadSaved, closed } = state;

  const hasConsent = Boolean(privacyAcknowledgedAt);
  const showPrivacyNotice = !hasConsent && !privacyDeclined;
  const showChatInput = hasConsent && !closed;
  const showStartAgain = privacyDeclined || closed;

  const typingExpected = !messages.at(-1)?.suggestions?.length;
  const wasLoading = useRef(loading);

  useEffect(() => {
    if (wasLoading.current && !loading && showChatInput && typingExpected) {
      inputRef.current?.focus();
    }
    wasLoading.current = loading;
  }, [loading, showChatInput, typingExpected, inputRef]);

  return (
    <>
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-50 cursor-default bg-black/60"
      />

      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={`Chat with ${agency.chat.assistantName}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="animate-panel-in fixed inset-x-2 top-3 bottom-2 z-50 flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-panel md:inset-x-auto md:top-auto md:right-7 md:bottom-24 md:h-144 md:max-h-[calc(100dvh-8rem)] md:w-96"
      >
        <ChatHeader onNewChat={onReset} onClose={onClose} />

        <ChatMessages
          messages={messages}
          loading={loading}
          onReply={onSend}
          notice={
            leadSaved ? (
              <NotificationBar tone="success">
                Your details have been sent to the team.
              </NotificationBar>
            ) : undefined
          }
        />

        {showPrivacyNotice && <PrivacyNotice onAccept={onAcknowledge} onDecline={onDecline} />}

        {showStartAgain && (
          <div className="mx-4 mb-2 shrink-0">
            <Button onClick={onReset} variant="secondary" className="w-full">
              Start again
            </Button>
          </div>
        )}

        {showChatInput && <ChatInput ref={inputRef} busy={loading} onSend={onSend} />}

        <ChatFooter showPrivacy={hasConsent || privacyDeclined} />
      </div>
    </>
  );
}
