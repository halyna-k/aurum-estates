"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { agency } from "@/agency/config";
import { PROPERTIES } from "@/agency/properties";
import { MAX_HISTORY_MESSAGES, MAX_MESSAGE_LENGTH } from "@/lib/chat/limits";
import { sendMessage } from "@/lib/chat/client";
import type { ChatMessage, ConversationState, UIMessage } from "@/types/chat";

const initialState: ConversationState = {
  leadData: {},
  leadSaved: false,
  closed: false,
  suggestions: [],
  privacyDeclined: false,
};

const GENERIC_ERROR = "Sorry, something went wrong. Please try again.";

function createGreeting(propertyId?: string): UIMessage {
  const property = PROPERTIES.find((item) => item.id === propertyId);
  const lines = [
    agency.chat.greeting,
    property && `I see you are interested in ${property.address}.`,
    agency.chat.opening,
  ];

  return {
    id: "greeting",
    role: "assistant",
    text: lines.filter(Boolean).join("\n\n"),
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
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [state, setState] = useState<ConversationState>(initialState);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const setProperty = useCallback((propertyId: string) => {
    setState((prev) => ({ ...prev, propertyId }));
  }, []);

  const addMessage = useCallback((role: UIMessage["role"], text: string, isError = false) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, text, timestamp: new Date(), isError },
    ]);
  }, []);

  const acknowledgePrivacyNotice = useCallback(() => {
    setState((prev) => ({
      ...prev,
      privacyAcknowledgedAt: new Date().toISOString(),
      privacyDeclined: false,
    }));

    setMessages([createGreeting()]);
  }, []);

  const declinePrivacyNotice = useCallback(() => {
    const { phone, email, hours } = agency.chat.humanContact;

    setState((prev) => ({
      ...prev,
      privacyDeclined: true,
    }));

    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: `No problem, nothing has been collected. You can reach the team on ${phone} or at ${email} (${hours}).`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim().slice(0, MAX_MESSAGE_LENGTH);
      const { privacyAcknowledgedAt, sessionToken, propertyId, closed } = state;
      if (!content || loading || closed || !privacyAcknowledgedAt) return;

      const controller = new AbortController();
      controllerRef.current = controller;
      setLoading(true);
      addMessage("user", content);

      try {
        const reply = await sendMessage(
          {
            message: content,
            history: toHistory(messages).slice(-MAX_HISTORY_MESSAGES),
            sessionToken,
            sessionId,
            privacyAcknowledgedAt,
            propertyId,
          },
          controller.signal,
        );

        setState((prev) => ({
          ...prev,
          sessionToken: reply.sessionToken,
          leadData: reply.leadData,
          leadSaved: prev.leadSaved || reply.leadSaved,
          closed: reply.closed,
          suggestions: reply.suggestions,
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
    controllerRef.current = null;

    setLoading(false);

    // Preserve consent only if the user has accepted it.
    const acknowledgedAt = state.privacyDeclined ? undefined : state.privacyAcknowledgedAt;

    setMessages(acknowledgedAt ? [createGreeting()] : []);

    setState({
      ...initialState,
      ...(acknowledgedAt ? { privacyAcknowledgedAt: acknowledgedAt } : {}),
    });

    setSessionId(crypto.randomUUID());
  }, [state.privacyAcknowledgedAt, state.privacyDeclined]);

  return {
    messages,
    state,
    loading,
    setProperty,
    send,
    acknowledgePrivacyNotice,
    declinePrivacyNotice,
    reset,
  };
}
