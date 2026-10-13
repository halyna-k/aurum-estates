"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { agency } from "@/agency/config";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat/limits";
import { sendMessage } from "@/services/chatApi";
import type { ChatMessage, ConversationState, UIMessage } from "@/types/chat";

const initialState: ConversationState = {
  leadData: {},
  declinedFields: [],
  leadSaved: false,
  privacyDeclined: false,
};

const GENERIC_ERROR = "Sorry, something went wrong. Please try again.";

function createGreeting(): UIMessage {
  return {
    id: "greeting",
    role: "assistant",
    text: agency.chat.greeting,
    timestamp: new Date(),
  };
}

/** The model sees the conversation without error notices and system messages. */
function toHistory(messages: UIMessage[]): ChatMessage[] {
  return messages.flatMap((m) =>
    m.isError || m.role === "system" ? [] : [{ role: m.role, content: m.text }],
  );
}

export function useConversation() {
  const [messages, setMessages] = useState<UIMessage[]>(() => [createGreeting()]);
  const [state, setState] = useState<ConversationState>(initialState);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const addMessage = useCallback((role: UIMessage["role"], text: string, isError = false) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, text, timestamp: new Date(), isError },
    ]);
  }, []);

  const acknowledgePrivacyNotice = useCallback(() => {
    setState((prev) => ({ ...prev, privacyAcknowledgedAt: new Date().toISOString() }));
  }, []);

  const declinePrivacyNotice = useCallback(() => {
    const { phone, email, hours } = agency.chat.humanContact;
    setState((prev) => ({ ...prev, privacyDeclined: true }));
    addMessage(
      "assistant",
      `No problem, nothing has been collected. You can reach the team on ${phone} or at ${email} (${hours}).`,
    );
  }, [addMessage]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim().slice(0, MAX_MESSAGE_LENGTH);
      const { privacyAcknowledgedAt, leadData, declinedFields } = state;
      if (!content || loading || !privacyAcknowledgedAt) return;

      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      addMessage("user", content);

      try {
        const reply = await sendMessage(
          {
            messages: [...toHistory(messages), { role: "user", content }],
            leadData,
            declinedFields,
            leadSaved: state.leadSaved,
            sessionId,
            privacyAcknowledgedAt,
          },
          controller.signal,
        );

        setState((prev) => ({
          ...prev,
          leadData: reply.leadData,
          declinedFields: reply.declinedFields,
          leadSaved: reply.leadSaved,
          agentPreview: reply.agentPreview ?? prev.agentPreview,
        }));
        addMessage("assistant", reply.message);
      } catch (error) {
        if (controller.signal.aborted) return;
        addMessage("assistant", error instanceof Error ? error.message : GENERIC_ERROR, true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [state, loading, messages, sessionId, addMessage],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setLoading(false);
    setMessages([createGreeting()]);
    setState(initialState);
    setSessionId(crypto.randomUUID());
  }, []);

  return {
    messages,
    state,
    loading,
    send,
    acknowledgePrivacyNotice,
    declinePrivacyNotice,
    reset,
  };
}
