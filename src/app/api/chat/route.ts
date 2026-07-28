import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { ChatMessage, ChatResponse } from "@/types/chat";
import { SYSTEM_PROMPT } from "@/config/chatAi";
import { extractLeadData, checkRateLimit } from "@/lib/helpers";

// Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// POST /api/chat
export async function POST(req: NextRequest) {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    (process.env.NODE_ENV === "development" ? "dev-local" : "unknown");
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // Validate env
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set");
    return NextResponse.json(
      { error: "AI service is not configured." },
      { status: 500 }
    );
  }

  // Parse body
  let body: { messages: ChatMessage[]; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { messages } = body;

  // Validate messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Messages are required." }, { status: 400 });
  }

  // Sanitise — only allow user/assistant roles from client
  const safeMessages = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role,
      content: String(m.content).slice(0, 2000), // truncate for safety
    }));

  // Cap conversation length to last 20 messages (save tokens)
  const recentMessages = safeMessages.slice(-20);

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      max_tokens: 600,
      temperature: 0.4, // lower = more consistent, professional
      stream: false,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    // Extract any lead data embedded in the response
    const { action, leadData, qualificationScore, cleanMessage } =
      extractLeadData(rawContent);

    const response: ChatResponse = {
      message: cleanMessage,
      ...(action && { action: action as ChatResponse["action"] }),
      ...(leadData && { leadData }),
      ...(qualificationScore && {
        qualificationScore: qualificationScore as ChatResponse["qualificationScore"],
      }),
    };

    // If lead is ready to save → trigger background save (fire and forget)
    if (action === "save_lead" && leadData) {
      // We call our own lead API — non-blocking
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      fetch(`${baseUrl}/api/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData, qualificationScore }),
      }).catch((err) => console.error("Lead save error:", err));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Groq API error:", error);

    // Friendly error for client
    const message =
      error instanceof Error && error.message.includes("rate_limit")
        ? "I'm receiving a lot of requests right now. Please try again in a moment."
        : "I'm having a technical issue. Please try again shortly.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// GET /api/chat — health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    model: "llama-3.3-70b-versatile",
    timestamp: new Date().toISOString(),
  });
}
