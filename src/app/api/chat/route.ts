import { NextResponse, type NextRequest } from "next/server";
import Groq from "groq-sdk";

import { agency } from "@/agency/config";
import { PROPERTIES } from "@/agency/properties";
import { afterSave, restartTurn, takeTurn } from "@/lib/chat/server/conversation/flow";
import { MAX_BODY_CHARS, MAX_HISTORY_MESSAGES } from "@/lib/chat/limits";
import { aiConfig } from "@/lib/chat/server/ai/model";
import { buildFaqPrompt } from "@/lib/chat/server/ai/prompt";
import { chatRequestSchema, parseLeadAnswers } from "@/lib/chat/server/schemas";
import {
  type Context,
  newSession,
  openSession,
  sealSession,
} from "@/lib/chat/server/conversation/session";
import { buildLead, hasContact } from "@/lib/leads/buildLead";
import { saveLead } from "@/lib/leads/stores/memory";
import { isRateLimited } from "@/lib/rateLimit";
import type { AgentPreviewData, ChatMessage, ChatReply } from "@/types/chat";

export const maxDuration = 30;

let groqClient: Groq | undefined;

function getGroq(): Groq | undefined {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return undefined;
  groqClient ??= new Groq({ apiKey });
  return groqClient;
}

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

function clientKey(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function todayInLondon(): string {
  const now = new Date();
  const zone = { timeZone: "Europe/London" } as const;
  const long = new Intl.DateTimeFormat("en-GB", { ...zone, dateStyle: "full" }).format(now);
  const iso = new Intl.DateTimeFormat("en-CA", zone).format(now);
  return `${long} (${iso})`;
}

const findProperty = (id: string | undefined) => PROPERTIES.find((property) => property.id === id);

/** The model only answers general questions. It never changes the conversation. */
async function answerQuestion(
  history: ChatMessage[],
  question: string,
): Promise<string | undefined> {
  const groq = getGroq();
  if (!groq) {
    console.error("GROQ_API_KEY is not set");
    return undefined;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: aiConfig.model,
      messages: [
        { role: "system", content: buildFaqPrompt(agency, PROPERTIES, todayInLondon()) },
        ...history.slice(-MAX_HISTORY_MESSAGES),
        { role: "user", content: question },
      ],
      temperature: aiConfig.temperature,
      max_completion_tokens: aiConfig.maxTokens,
    });
    return completion.choices[0]?.message?.content?.trim() || undefined;
  } catch (error) {
    const status = error instanceof Groq.APIError ? error.status : undefined;
    console.error("Model request failed", { status });
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.error("SESSION_SECRET is not set");
    return fail("The assistant is not available right now.", 500);
  }

  if (!isSameOrigin(req)) return fail("Forbidden.", 403);
  if (isRateLimited(clientKey(req))) return fail("Too many requests.", 429);

  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) return fail("Request too large.", 413);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail("Invalid request.", 400);
  }

  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) return fail("Invalid request.", 400);
  const request = parsed.data;
  const now = new Date();

  // The session is signed, so the browser cannot change what has been recorded.
  const opened = request.sessionToken ? openSession(request.sessionToken, secret, now) : null;
  const timedOut = Boolean(request.sessionToken) && !opened;
  const requested = findProperty(request.propertyId);

  let session = opened ?? newSession(requested?.id);
  if (
    opened &&
    requested &&
    session.phase === "collecting" &&
    session.answers.propertyId !== requested.id
  ) {
    session = { ...session, answers: { ...session.answers, propertyId: requested.id } };
  }

  const property = findProperty(session.answers.propertyId);
  const ctx: Context = {
    propertyRentPcm: property?.rentPcm,
    incomeToAnnualRent: agency.triage.incomeToAnnualRent,
  };

  const turn = timedOut
    ? restartTurn(session, ctx)
    : takeTurn({ session, text: request.message, ctx, agency, property, now });

  let message: string;
  let suggestions: string[];
  let agentPreview: AgentPreviewData | undefined;
  session = turn.session;

  if (turn.kind === "say") {
    message = turn.message;
    suggestions = turn.suggestions;
  } else if (turn.kind === "ask_model") {
    const answer = await answerQuestion(request.history, request.message);
    const fallback = `Sorry, I cannot answer that just now. You can ask the team on ${agency.chat.humanContact.phone}.`;
    message = `${answer ?? fallback}\n\n${turn.then}`;
    suggestions = turn.suggestions;
  } else {
    const answers = parseLeadAnswers(session.answers);
    if (!hasContact(answers)) return fail("Invalid request.", 400);

    try {
      const lead = buildLead({
        answers,
        monthlyRent: property?.rentPcm ?? answers.budget,
        sessionId: request.sessionId,
        privacyAcknowledgedAt: request.privacyAcknowledgedAt,
        agency,
      });
      await saveLead(lead);

      if (agency.isDemo) {
        agentPreview = {
          reference: lead.sessionId.slice(0, 8),
          qualification: lead.qualification ?? "needs_review",
          status: lead.status,
        };
      }
    } catch {
      console.error("Lead could not be saved");
      return fail(
        `We could not save your details. Please try again, or contact us on ${agency.chat.humanContact.phone}.`,
        500,
      );
    }

    const done = afterSave(session, agency);
    session = done.session;
    message = done.message;
    suggestions = done.suggestions;
  }

  const reply: ChatReply = {
    message,
    sessionToken: sealSession(session, secret, now),
    leadData: session.answers,
    leadSaved: session.phase === "saved",
    closed: session.phase === "closed",
    suggestions,
    agentPreview,
  };

  return NextResponse.json(reply);
}
