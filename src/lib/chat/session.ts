import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { LeadAnswers } from "@/types/lead";
import { type AskedField, FIELD_ORDER, fieldSpec, isAsked, retryText } from "./fields";
import { isDecline } from "./parsers";

export type Phase = "collecting" | "confirming" | "saved" | "closed";

export interface Session {
  phase: Phase;
  answers: Partial<LeadAnswers>;
  declined: AskedField[];
  /** Failed attempts per field, so the assistant never asks the same thing forever. */
  attempts: Partial<Record<AskedField, number>>;
}

export interface Context {
  /** Rent of the property the applicant is enquiring about, if there is one. */
  propertyRentPcm?: number;
  /** Agency rule: income as a multiple of the annual rent. */
  incomeToAnnualRent: number;
}

export type Outcome =
  | { kind: "accepted" }
  | { kind: "declined" }
  | { kind: "retry"; message: string }
  | { kind: "skipped" }
  | { kind: "handover" };

/** A property enquiry already tells us these, so they are not asked again. */
const PROPERTY_FIELDS: AskedField[] = ["propertyType", "bedrooms", "area", "budget"];

const MAX_FAILED = { optional: 2, required: 3 };

export function newSession(propertyId?: string): Session {
  return {
    phase: "collecting",
    answers: propertyId ? { propertyId } : {},
    declined: [],
    attempts: {},
  };
}

/* ---------- What to ask next ---------- */

function isSettled(session: Session, key: AskedField): boolean {
  return session.answers[key] !== undefined || session.declined.includes(key);
}

function isSkipped(session: Session, key: AskedField, ctx: Context): boolean {
  if (ctx.propertyRentPcm !== undefined && PROPERTY_FIELDS.includes(key)) return true;

  if (key === "hasGuarantor") {
    const rent = ctx.propertyRentPcm ?? session.answers.budget;
    const income = session.answers.annualIncome;
    return (
      rent !== undefined && income !== undefined && income >= rent * 12 * ctx.incomeToAnnualRent
    );
  }

  return false;
}

/** The next field to ask about, or undefined when there is nothing left. */
export function nextField(session: Session, ctx: Context): AskedField | undefined {
  return FIELD_ORDER.find((key) => !isSettled(session, key) && !isSkipped(session, key, ctx));
}

/* ---------- Taking an answer ---------- */

function withAnswer(answers: Partial<LeadAnswers>, field: AskedField, value: unknown) {
  return { ...answers, [field]: value } as Partial<LeadAnswers>;
}

function withoutAttempts(attempts: Session["attempts"], field: AskedField): Session["attempts"] {
  return Object.fromEntries(
    Object.entries(attempts).filter(([key]) => key !== field),
  ) as Session["attempts"];
}

export function applyAnswer(
  session: Session,
  field: AskedField,
  text: string,
  now = new Date(),
): { session: Session; outcome: Outcome } {
  const spec = fieldSpec(field);
  const declining = isDecline(text);

  if (declining && !spec.required) {
    return {
      session: {
        ...session,
        declined: [...session.declined, field],
        attempts: withoutAttempts(session.attempts, field),
      },
      outcome: { kind: "declined" },
    };
  }

  const result = declining ? ({ ok: false, reason: "unclear" } as const) : spec.parse(text, now);

  if (result.ok) {
    return {
      session: {
        ...session,
        answers: withAnswer(session.answers, field, result.value),
        attempts: withoutAttempts(session.attempts, field),
      },
      outcome: { kind: "accepted" },
    };
  }

  const failed = (session.attempts[field] ?? 0) + 1;

  if (failed < (spec.required ? MAX_FAILED.required : MAX_FAILED.optional)) {
    return {
      session: { ...session, attempts: { ...session.attempts, [field]: failed } },
      outcome: { kind: "retry", message: retryText(spec, result.reason) },
    };
  }

  if (spec.required) {
    return { session: { ...session, phase: "closed" }, outcome: { kind: "handover" } };
  }

  return {
    session: {
      ...session,
      declined: [...session.declined, field],
      attempts: withoutAttempts(session.attempts, field),
    },
    outcome: { kind: "skipped" },
  };
}

/* ---------- Signing, so the browser cannot edit the session ---------- */

const MAX_AGE_MS = 2 * 60 * 60 * 1000;

const sessionSchema = z.object({
  phase: z.enum(["collecting", "confirming", "saved", "closed"]),
  answers: z.record(z.string(), z.unknown()),
  declined: z.array(z.string()),
  attempts: z.record(z.string(), z.number().int().min(0).max(10)),
});

const envelopeSchema = z.object({ session: sessionSchema, issuedAt: z.number() });

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function sealSession(session: Session, secret: string, now = new Date()): string {
  const body = Buffer.from(JSON.stringify({ session, issuedAt: now.getTime() })).toString(
    "base64url",
  );
  return `${body}.${sign(body, secret)}`;
}

/** Returns null for a forged, expired or outdated token, and the caller starts a new session. */
export function openSession(token: string, secret: string, now = new Date()): Session | null {
  const [body, signature, ...extra] = token.split(".");
  if (!body || !signature || extra.length) return null;

  const expected = Buffer.from(sign(body, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  let envelope;
  try {
    envelope = envelopeSchema.parse(JSON.parse(Buffer.from(body, "base64url").toString()));
  } catch {
    return null;
  }
  if (now.getTime() - envelope.issuedAt > MAX_AGE_MS) return null;

  const { session } = envelope;
  return {
    phase: session.phase,
    answers: Object.fromEntries(
      Object.entries(session.answers).filter(([key]) => key === "propertyId" || isAsked(key)),
    ) as Partial<LeadAnswers>,
    declined: session.declined.filter(isAsked),
    attempts: Object.fromEntries(
      Object.entries(session.attempts).filter(([key]) => isAsked(key)),
    ) as Session["attempts"],
  };
}
