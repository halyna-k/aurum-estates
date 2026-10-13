import { NextResponse, type NextRequest } from "next/server";
import Groq from "groq-sdk";

import { agency } from "@/agency/config";
import { PROPERTIES } from "@/agency/properties";
import { aiConfig } from "@/lib/chat/model";
import { FIELD_ORDER, buildSystemPrompt } from "@/lib/chat/prompt";
import {
  chatRequestSchema,
  modelOutputSchema,
  parseFields,
  parseLeadAnswers,
} from "@/lib/chat/schemas";
import { buildLead, hasContact } from "@/lib/leads/build";
import { saveLead } from "@/lib/leads/stores/memory";
import { isRateLimited } from "@/lib/rate-limit";
import type { AgentPreview, ChatReply, LeadField } from "@/types/chat";

const MAX_BODY_CHARS = 100_000;
const MAX_HISTORY_MESSAGES = 12;
const REQUIRED_FIELDS: LeadField[] = ["fullName", "email"];

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
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
}

export async function POST(req: NextRequest) {
  const groq = getGroq();
  if (!groq) {
    console.error("GROQ_API_KEY is not set");
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

  // The client state is untrusted: keep only valid fields, and never allow
  // the applicant to decline the contact details an agent needs to reply.
  const clientAnswers = parseLeadAnswers(request.leadData);
  const clientDeclined = parseFields(request.declinedFields);

  const systemPrompt = buildSystemPrompt(agency, {
    today: todayInLondon(),
    collected: clientAnswers,
    declined: clientDeclined,
    leadSaved: request.leadSaved,
  });

  let content: string;
  try {
    const completion = await groq.chat.completions.create({
      model: aiConfig.model,
      messages: [
        { role: "system", content: systemPrompt },
        ...request.messages.slice(-MAX_HISTORY_MESSAGES),
      ],
      temperature: aiConfig.temperature,
      max_completion_tokens: aiConfig.maxTokens,
      response_format: { type: "json_object" },
    });
    content = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (error) {
    const status = error instanceof Groq.APIError ? error.status : undefined;
    console.error("Model request failed", { status });
    if (status === 429) {
      return fail("I am receiving a lot of requests right now. Please try again in a moment.", 503);
    }
    return fail("I am having a technical issue. Please try again shortly.", 502);
  }

  let output;
  try {
    output = modelOutputSchema.parse(JSON.parse(content));
  } catch {
    console.error("Model returned an unusable reply");
    return fail("I am having a technical issue. Please try again shortly.", 502);
  }

  // Merge: the model may add or correct fields, never remove them.
  const leadData = { ...clientAnswers, ...parseLeadAnswers(output.leadData) };

  const declinedFields = [
    ...new Set([...clientDeclined, ...parseFields(output.declinedFields)]),
  ].filter((field) => !REQUIRED_FIELDS.includes(field) && leadData[field] === undefined);

  const remaining = FIELD_ORDER.filter(
    (field) => leadData[field] === undefined && !declinedFields.includes(field),
  );

  let leadSaved = request.leadSaved;
  let agentPreview: AgentPreview | undefined;

  // Save once the applicant has confirmed, and update the lead on later turns.
  if (remaining.length === 0 && hasContact(leadData) && (output.confirmed || request.leadSaved)) {
    const monthlyRent =
      PROPERTIES.find((property) => property.id === leadData.propertyId)?.rentPcm ??
      leadData.budget;

    try {
      const lead = buildLead({
        answers: leadData,
        monthlyRent,
        sessionId: request.sessionId,
        privacyAcknowledgedAt: request.privacyAcknowledgedAt,
        agency,
      });
      await saveLead(lead);
      leadSaved = true;

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
  }

  const reply: ChatReply = {
    message: output.message,
    leadData,
    declinedFields,
    leadSaved,
    agentPreview,
  };

  return NextResponse.json(reply);
}
