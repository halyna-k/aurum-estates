"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onChatRequest } from "@/lib/chat/events";
import { useConversation } from "./useConversation";

const PULSE_DELAY_MS = 5000;

export function useChat() {
  const conversation = useConversation();
  const { messages, state } = conversation;
  const { setProperty } = conversation;

  const [open, setOpen] = useState(false);
  const [seenCount, setSeenCount] = useState(0);
  const [pulseDue, setPulseDue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const acknowledged = Boolean(state.privacyAcknowledgedAt);

  // The greeting counts as unread until the panel has been opened once.
  const unread = open ? 0 : messages.slice(seenCount).filter((m) => m.role === "assistant").length;

  useEffect(() => {
    if (open) return;

    const id = setTimeout(() => {
      setPulseDue(true);
    }, PULSE_DELAY_MS);

    return () => clearTimeout(id);
  }, [open]);

const pulse = pulseDue && !open;

  const openChat = useCallback(() => {
    setPulseDue(false);
    setOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setSeenCount(messages.length);
    setPulseDue(false);
    setOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, [messages.length]);

  useEffect(
    () =>
      onChatRequest((propertyId) => {
        if (propertyId) setProperty(propertyId);
        setPulseDue(false);
        setOpen(true);
      }),
    [setProperty],
  );

  useEffect(() => {
    if (!open || !acknowledged) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, acknowledged]);

  return { ...conversation, open, openChat, closeChat, unread, pulse, inputRef, launcherRef };
}
