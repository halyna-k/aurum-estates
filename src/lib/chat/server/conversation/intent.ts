import "server-only";

import type { AskedField } from "@/lib/chat/server/answers/fields";

const QUESTION_START =
  /^(what|how|when|where|why|who|which|can|could|is|are|do|does|did|will|would|should|may|am)\b/i;

/** A question rather than an answer. Short openers such as "when possible" stay answers. */
export function looksLikeQuestion(text: string): boolean {
  const t = text.trim();
  return t.includes("?") || (QUESTION_START.test(t) && t.split(/\s+/).length >= 3);
}

const FINISHED =
  /^(no|nope|nothing|that'?s all|that is all|all good|all done|i'?m good|im good|thanks|thank you|cheers|bye|goodbye|not right now)\b/i;
const MORE_TO_SAY = /\b(but|another|also|one more|actually|question)\b/i;

const ASKING = /\b(what|how|when|where|why|who|which|can|could|will|would|should)\b/i;

/** The applicant has nothing more to ask. */
export function isFinished(text: string): boolean {
  const t = text.trim();
  return FINISHED.test(t) && !MORE_TO_SAY.test(t) && !ASKING.test(t) && t.split(/\s+/).length <= 7;
}

export type Confirmation =
  { kind: "yes" } | { kind: "no" } | { kind: "unclear" } | { kind: "change"; field: AskedField };

const YES =
  /^(yes|yeah|yep|yup|y|correct|that'?s (right|correct)|all correct|looks (good|right)|confirm(ed)?|perfect)\b/i;
const NO = /^(no|nope|nah|not quite|not really|incorrect|wrong)\b/i;
const CHANGE_CUE =
  /\b(change|wrong|incorrect|mistake|not (right|correct)|but|except|actually|update|fix|edit)\b/i;

/** Order matters: "phone number" must not be read as the number of people. */
const FIELD_WORDS: [AskedField, RegExp][] = [
  ["occupants", /\b(people|occupants|household|tenants)\b/i],
  ["fullName", /\bname\b/i],
  ["email", /\be-?mail\b/i],
  ["phone", /\b(phone|mobile|telephone|(my|the) number)\b/i],
  ["propertyType", /\b(property type|type of property)\b/i],
  ["bedrooms", /\b(bedrooms?|beds?)\b/i],
  ["budget", /\b(budget|rent|price)\b/i],
  ["area", /\b(area|location)\b/i],
  ["moveInDate", /\b(move[- ]?in|moving|date)\b/i],
  ["employmentStatus", /\b(employment|job|work|occupation)\b/i],
  ["annualIncome", /\b(income|salary|earn\w*)\b/i],
  ["hasGuarantor", /\bguarantor\b/i],
  ["hasPets", /\bpets?\b/i],
  ["viewingPreference", /\b(viewing|view)\b/i],
];

function mentionedField(text: string): AskedField | undefined {
  return FIELD_WORDS.find(([, pattern]) => pattern.test(text))?.[0];
}

/** Reads the reply to "Is that all correct?". Only a clear yes confirms. */
export function parseConfirmation(text: string): Confirmation {
  const t = text.trim();
  const field = mentionedField(t);

  if (CHANGE_CUE.test(t)) return field ? { kind: "change", field } : { kind: "no" };
  if (YES.test(t)) return { kind: "yes" };
  if (NO.test(t)) return field ? { kind: "change", field } : { kind: "no" };
  if (field) return { kind: "change", field };
  return { kind: "unclear" };
}
