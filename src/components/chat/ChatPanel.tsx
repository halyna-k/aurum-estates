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

  return (
    <>
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60"
      />

      <div
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={`Chat with ${agency.chat.assistantName}`}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        className="animate-panel-in fixed top-3 right-2 bottom-2 left-2 z-50 flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-panel sm:top-auto sm:right-7 sm:bottom-24 sm:left-auto sm:h-[min(36rem,calc(100dvh-8rem))] sm:w-[min(23.75rem,calc(100vw-1.5rem))] sm:rounded-lg"
      >
        <ChatHeader onNewChat={onReset} onClose={onClose} />
        <ChatMessages messages={messages} loading={loading} />

        <div role="status">
          {leadSaved && (
            <NotificationBar tone="success">
              Your details have been sent to the team. An agent will reply during working hours (
              {agency.chat.humanContact.hours}).
            </NotificationBar>
          )}
        </div>

        {!privacyAcknowledgedAt && !privacyDeclined && (
          <PrivacyNotice onAccept={onAcknowledge} onDecline={onDecline} />
        )}

        {privacyDeclined && (
          <div className="shrink-0 p-4">
            <Button onClick={onReset} variant="secondary" className="w-full">
              Start again
            </Button>
          </div>
        )}

        {privacyAcknowledgedAt && <ChatInput ref={inputRef} busy={loading} onSend={onSend} />}

        <ChatFooter />
      </div>
    </>
  );
}
