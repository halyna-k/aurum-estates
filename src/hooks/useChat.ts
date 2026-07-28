"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useConversation } from "./useConversation";
import { sendMessage as sendToApi } from "@/services/chatApi";
import type { ChatMessage } from "@/types/chat";
import { agencyConfig } from "@/config/agency";
import { generateId } from "@/lib/helpers";

export function useChat() {
  // Panel visibility
  const [open, setOpen]     = useState(false);
  const [pulse, setPulse]   = useState(false);
  const [unread, setUnread] = useState(1);

  // Input field value
  const [input, setInput]   = useState("");

  // Input DOM ref (passed down to ChatInput)
  const inputRef = useRef<HTMLInputElement>(null);

  // All conversation state lives here
  const conversation = useConversation();
  const {
    addMessage,
    pushToHistory,
    resetHistory,
    setLoading,
    setGdprConsented,
    setQualificationScore,
    setLeadSaved,
    setViewingRequested,
    mergeLeadData,
    state,
    loading,
  } = conversation;

  // Pulse FAB after 5s to attract attention
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // Focus input + clear unread when panel opens
  useEffect(() => {
    if (open) {
      setUnread(0);
      setPulse(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // GDPR: user accepted
  const handleGdprAccept = useCallback(async () => {
    setGdprConsented();
    setLoading(true);

    const initMessage: ChatMessage = {
      role: "user",
      content: "I consent to my data being processed under UK GDPR. Please proceed.",
    };
    resetHistory([initMessage]);

    try {
      const data = await sendToApi([initMessage]);

      pushToHistory({ role: "assistant", content: data.message });
      addMessage("bot", data.message);

      if (data.qualificationScore) {
        setQualificationScore(data.qualificationScore);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "I'm having trouble connecting. Please try again.";
      addMessage("bot", msg, true);
    } finally {
      setLoading(false);
    }
  }, [
    setGdprConsented,
    setLoading,
    resetHistory,
    pushToHistory,
    addMessage,
    setQualificationScore,
  ]);

  // GDPR: user declined
  const handleGdprDecline = useCallback(() => {
    setGdprConsented();
    addMessage(
      "bot",
      `Understood — no data has been collected. You can still browse our properties or contact us directly at ${agencyConfig.email}.`
    );
  }, [setGdprConsented, addMessage]);

  // Send a message
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setInput("");
      addMessage("user", trimmed);
      pushToHistory({ role: "user", content: trimmed });
      setLoading(true);

      try {
        const data = await sendToApi(
          // Send full history (already has the new user message appended)
          [...conversation.historyRef.current],
          generateId()
        );

        pushToHistory({ role: "assistant", content: data.message });
        addMessage("bot", data.message);

        // Handle qualification score (set only once)
        if (data.qualificationScore && !state.qualificationScore) {
          setQualificationScore(data.qualificationScore);
          if (data.leadData) mergeLeadData(data.leadData);
        }

        // Handle save_lead action
        if (data.action === "save_lead" && !state.leadSaved) {
          setLeadSaved(data.leadData ?? {});
        }

        // Handle book_viewing action
        if (data.action === "book_viewing") {
          setViewingRequested();
        }

        // Increment unread badge when panel is closed
        if (!open) setUnread((n) => n + 1);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Connection error. Please check your internet and try again.";
        addMessage("bot", msg, true);
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      open,
      state.qualificationScore,
      state.leadSaved,
      conversation.historyRef,
      addMessage,
      pushToHistory,
      setLoading,
      setQualificationScore,
      setLeadSaved,
      setViewingRequested,
      mergeLeadData,
    ]
  );

  return {
    // Panel controls
    open, setOpen, pulse, unread,

    // Input
    input, setInput, inputRef,

    // Conversation
    ...conversation,

    // Handlers
    send, handleGdprAccept, handleGdprDecline
  };
}
