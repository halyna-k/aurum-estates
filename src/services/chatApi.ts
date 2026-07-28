import type { ChatMessage, ChatResponse } from "@/types/chat";

// sendMessage
// Single responsibility: POST to /api/chat and return a typed response.
// Throws a human-readable Error on any failure — callers handle the UI.

export async function sendMessage(
  messages: ChatMessage[],
  sessionId?: string
): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, sessionId }),
  });

  // Parse regardless of status — error body has { error: string }
  const data: ChatResponse & { error?: string } = await res.json();

  if (!res.ok || data.error) {
    // Surface Groq rate-limit as a friendly string
    throw new Error(
      data.error ?? `Unexpected error (${res.status}). Please try again.`
    );
  }

  return data;
}
