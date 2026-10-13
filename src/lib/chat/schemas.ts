import { z } from "zod";
import { EMPLOYMENT_STATUSES, type LeadAnswers } from "@/types/lead";
import { PROPERTY_TYPES } from "@/types/property";
import type { LeadField } from "@/types/chat";
import { MAX_MESSAGE_LENGTH } from "./limits";

const MAX_ASSISTANT_LENGTH = 2000;

const text = (max: number) => z.string().trim().min(1).max(max);

/** The only fields the assistant may set. Anything else is dropped. */
const leadFieldShape = {
  fullName: text(200),
  email: z.string().trim().toLowerCase().email().max(320),
  phone: z.string().trim().regex(/^[+\d\s()-]{7,20}$/),
  propertyId: text(100),
  propertyType: z.enum(PROPERTY_TYPES),
  bedrooms: z.number().int().min(0).max(10),
  budget: z.number().positive().max(100_000),
  area: text(200),
  moveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES),
  annualIncome: z.number().min(0).max(10_000_000),
  hasGuarantor: z.boolean(),
  occupants: z.number().int().min(1).max(20),
  hasPets: z.boolean(),
  viewingPreference: text(300),
};

// Compile-time check: the schema covers exactly the keys of LeadAnswers.
type SameKeys<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _keysMatch: SameKeys<keyof typeof leadFieldShape, keyof LeadAnswers> = true;
void _keysMatch;

export const LEAD_FIELDS = Object.keys(leadFieldShape) as [LeadField, ...LeadField[]];

/** Keeps every valid field and silently drops invalid, unknown or null ones. */
export function parseLeadAnswers(input: unknown): Partial<LeadAnswers> {
  if (typeof input !== "object" || input === null) return {};

  const source = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const field of LEAD_FIELDS) {
    const value = source[field];
    if (value === undefined || value === null) continue;
    const parsed = leadFieldShape[field].safeParse(value);
    if (parsed.success) result[field] = parsed.data;
  }

  return result as Partial<LeadAnswers>;
}

export function parseFields(input: unknown): LeadField[] {
  if (!Array.isArray(input)) return [];
  return input.filter((f): f is LeadField => LEAD_FIELDS.includes(f as LeadField));
}

const chatMessageSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("user"), content: text(MAX_MESSAGE_LENGTH) }),
  z.object({ role: z.literal("assistant"), content: text(MAX_ASSISTANT_LENGTH) }),
]);

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(100)
    .refine((messages) => messages.at(-1)?.role === "user"),
  leadData: z.unknown(),
  declinedFields: z.unknown(),
  leadSaved: z.boolean(),
  sessionId: z.string().uuid(),
  privacyAcknowledgedAt: z.string().datetime(),
});

export const modelOutputSchema = z.object({
  message: text(MAX_ASSISTANT_LENGTH),
  leadData: z.unknown(),
  declinedFields: z.unknown(),
  confirmed: z.boolean().optional(),
});
