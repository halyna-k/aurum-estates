import "server-only";

import { z } from "zod";
import type { LeadField } from "@/types/chat";
import { EMPLOYMENT_STATUSES, type LeadAnswers } from "@/types/lead";
import { PROPERTY_TYPES } from "@/types/property";
import { MAX_MESSAGE_LENGTH } from "@/lib/chat/limits";

const text = (max: number) => z.string().trim().min(1).max(max);

/** What a saved answer must look like. A last check before a lead is built. */
const leadFieldShape = {
  fullName: text(200),
  email: z.string().trim().toLowerCase().email().max(320),
  phone: z.string().regex(/^\+\d{7,15}$/),
  propertyId: text(100),
  propertyType: z.enum(PROPERTY_TYPES),
  bedrooms: z.number().int().min(0).max(10),
  budget: z.number().min(300).max(50_000),
  area: text(200),
  moveInDate: z.iso.date(),
  employmentStatus: z.enum(EMPLOYMENT_STATUSES),
  annualIncome: z.number().min(0).max(1_000_000),
  hasGuarantor: z.boolean(),
  occupants: z.number().int().min(1).max(10),
  hasPets: z.boolean(),
  viewingPreference: text(300),
};

// Compile-time check: the schema covers exactly the keys of LeadAnswers.
type SameKeys<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const _keysMatch: SameKeys<keyof typeof leadFieldShape, keyof LeadAnswers> = true;
void _keysMatch;

const LEAD_FIELDS = Object.keys(leadFieldShape) as [LeadField, ...LeadField[]];

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

const historyMessageSchema = z.discriminatedUnion("role", [
  z.object({ role: z.literal("user"), content: text(MAX_MESSAGE_LENGTH) }),
  z.object({ role: z.literal("assistant"), content: text(4000) }),
]);

export const chatRequestSchema = z.object({
  message: text(MAX_MESSAGE_LENGTH),
  history: z.array(historyMessageSchema).max(40),
  sessionToken: z.string().max(4000).optional(),
  sessionId: z.uuid(),
  privacyAcknowledgedAt: z.iso.datetime(),
  propertyId: z.string().max(100).optional(),
});
