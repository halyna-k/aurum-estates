"use client";

import { useState, useRef, useCallback } from "react";
import type { UIMessage, ConversationState, ChatMessage } from "@/types/chat";
import { generateId } from "@/lib/helpers";

export function useConversation() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading]   = useState(false);
  const [state, setState]       = useState<ConversationState>({
    gdprConsented:     false,
    leadData:          {},
    leadSaved:         false,
    viewingRequested:  false,
  });

  // Full conversation history sent to /api/chat on every request
  const historyRef = useRef<ChatMessage[]>([]);

  //  Add a message to the UI
  const addMessage = useCallback(
    (role: UIMessage["role"], text: string, isError = false) => {
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role, text, timestamp: new Date(), isError },
      ]);
    },
    []
  );

  // Push to API history
  const pushToHistory = useCallback((msg: ChatMessage) => {
    historyRef.current.push(msg);
  }, []);

  const resetHistory = useCallback((initial: ChatMessage[]) => {
    historyRef.current = initial;
  }, []);

  // State setters
  const setGdprConsented = useCallback(() => {
    setState((s) => ({ ...s, gdprConsented: true }));
  }, []);

  const setQualificationScore = useCallback(
    (score: ConversationState["qualificationScore"]) => {
      setState((s) => ({ ...s, qualificationScore: score }));
    },
    []
  );

  const setLeadSaved = useCallback(
    (leadData: ConversationState["leadData"]) => {
      setState((s) => ({ ...s, leadSaved: true, leadData }));
    },
    []
  );

  const setViewingRequested = useCallback(() => {
    setState((s) => ({ ...s, viewingRequested: true }));
  }, []);

  const mergeLeadData = useCallback(
    (incoming: ConversationState["leadData"]) => {
      setState((s) => ({ ...s, leadData: { ...s.leadData, ...incoming } }));
    },
    []
  );

  return {
    // UI state
    messages, loading, state, historyRef,

    // Actions
    addMessage, pushToHistory, resetHistory, setLoading, setGdprConsented, setQualificationScore, setLeadSaved, setViewingRequested, mergeLeadData
  };
}
