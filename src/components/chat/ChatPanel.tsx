import type { RefObject } from "react";
import { agency } from "@/agency/config";
import type { ConversationState, UIMessage } from "@/types/chat";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ChatFooter from "./ChatFooter";
import PrivacyNotice from "./PrivacyNotice";
import NotificationBar from "./NotificationBar";
import Button from "@/components/ui/Button";

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
  const { privacyAcknowledgedAt, privacyDeclined, leadSaved } = state;
  const { assistantName, humanContact } = agency.chat;

  const hasConsent = Boolean(privacyAcknowledgedAt);
  const showPrivacyNotice = !hasConsent && !privacyDeclined;
  const showChatInput = hasConsent && !privacyDeclined;
  const showStartAgain = privacyDeclined;
  const showPrivacyFooter = hasConsent || privacyDeclined;

  return (
    <>
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        aria-label="Close chat"
        onClick={onClose}
        className="fixed inset-0 z-50 cursor-default bg-black/60"
      />

      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={`Chat with ${assistantName}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="animate-panel-in fixed inset-x-2 top-3 bottom-2 z-50 flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-panel md:inset-x-auto md:top-auto md:right-7 md:bottom-24 md:h-144 md:max-h-[calc(100dvh-8rem)] md:w-96"
      >
        <ChatHeader onNewChat={onReset} onClose={onClose} />

        <ChatMessages messages={messages} loading={loading} />

        {leadSaved && (
          <div role="status">
            <NotificationBar tone="success">
              Your details have been sent to the team. An agent will reply during working hours (
              {humanContact.hours}).
            </NotificationBar>
          </div>
        )}

        {showPrivacyNotice && <PrivacyNotice onAccept={onAcknowledge} onDecline={onDecline} />}

        {showStartAgain && (
          <div className="mx-4 mb-2 shrink-0">
            <Button onClick={onReset} variant="secondary" className="w-full">
              Start again
            </Button>
          </div>
        )}

        {showChatInput && <ChatInput ref={inputRef} busy={loading} onSend={onSend} />}

        <ChatFooter showPrivacy={showPrivacyFooter} />
      </div>
    </>
  );
}
