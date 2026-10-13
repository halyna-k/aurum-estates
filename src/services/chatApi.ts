import type { ChatReply, ChatRequest } from "@/types/chat";

const REQUEST_TIMEOUT_MS = 30_000;

const FALLBACK_ERROR =
  "Sorry, something went wrong. Please try again, or contact the agency directly.";
const NETWORK_ERROR = "I could not connect. Please check your connection and try again.";
const TIMEOUT_ERROR = "That is taking longer than expected. Please try again.";
const RATE_LIMIT_ERROR =
  "You are sending messages too quickly. Please wait a moment and try again.";

function readError(data: unknown): string | undefined {
  if (typeof data === "object" && data !== null && "error" in data) {
    return typeof data.error === "string" ? data.error : undefined;
  }
  return undefined;
}

function isChatReply(data: unknown): data is ChatReply {
  if (typeof data !== "object" || data === null) return false;
  const reply = data as Record<string, unknown>;
  return (
    typeof reply.message === "string" &&
    typeof reply.leadData === "object" &&
    reply.leadData !== null &&
    Array.isArray(reply.declinedFields) &&
    typeof reply.leadSaved === "boolean"
  );
}

export async function sendMessage(request: ChatRequest, signal?: AbortSignal): Promise<ChatReply> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error(timeout.aborted ? TIMEOUT_ERROR : NETWORK_ERROR);
  }

  const data: unknown = await res.json().catch(() => null);

  if (res.status === 429) throw new Error(RATE_LIMIT_ERROR);
  if (!res.ok) throw new Error(readError(data) ?? FALLBACK_ERROR);
  if (!isChatReply(data)) throw new Error(FALLBACK_ERROR);

  console.log("Chat API response:", data);
  return data;
}
