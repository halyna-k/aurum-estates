import "server-only";

import type { LeadField } from "@/types/chat";
import type { LeadAnswers } from "@/types/lead";
import {
  type ParseFailure,
  type ParseResult,
  parseArea,
  parseBedrooms,
  parseBudget,
  parseEmail,
  parseEmployment,
  parseIncome,
  parseMoveInDate,
  parseName,
  parseOccupants,
  parsePets,
  parsePhone,
  parsePropertyType,
  parseRequirements,
  parseViewing,
  parseYesNo,
} from "./parsers";

type Asked = Exclude<LeadField, "propertyId">;

interface FieldSpec<K extends Asked = Asked> {
  key: K;
  /** Name of the detail in the summary and in the list of things to change. */
  label: string;
  question: string;
  /** Shown above the input while this question is open: the format, or why it is asked. */
  hint?: string;
  /** Used when the answer was not understood. */
  retry: string;
  /** Used when the answer was understood but is not realistic. */
  recheck?: string;
  /** Used for a date that has already passed. */
  past?: string;
  /** Quick replies offered with the question. Each one must be a valid answer. */
  choices?: string[];
  /** Contact details cannot be declined: the agent could not reply without them. */
  required?: boolean;
  /** Sensitive or not essential: the applicant may skip it, and a Skip reply is offered. */
  skippable?: boolean;
  parse: (text: string, now: Date) => ParseResult<NonNullable<LeadAnswers[K]>>;
}

const field = <K extends Asked>(spec: FieldSpec<K>) => spec;

/** The questions, in the order they are asked. */
export const FIELDS = [
  field({
    key: "fullName",
    label: "Name",
    question: "May I take your full name, please?",
    hint: "First and last name.",
    retry: "Sorry, I did not catch that. Could I have your first and last name, please?",
    required: true,
    parse: parseName,
  }),
  field({
    key: "email",
    label: "Email",
    question: "Thank you. What is the best email address to reach you on?",
    retry: "That does not look like an email address. Could you check it, please?",
    required: true,
    parse: parseEmail,
  }),
  field({
    key: "phone",
    label: "Phone",
    question: "What is the best phone number to reach you on?",
    hint: "The agent may call to arrange a viewing. You can skip this question.",
    retry:
      "Could you check that number, please? Include the country code if it is not a UK number.",
    skippable: true,
    parse: parsePhone,
  }),
  field({
    key: "propertyType",
    label: "Property type",
    question: "What type of property are you looking for?",
    hint: "A studio, flat, house or room.",
    retry: "Sorry, was that a studio, flat, house or room?",
    choices: ["Studio", "Flat", "House", "Room"],
    parse: parsePropertyType,
  }),
  field({
    key: "bedrooms",
    label: "Bedrooms",
    question: "How many bedrooms would you like?",
    hint: "Type a number, for example 2.",
    retry: "Sorry, how many bedrooms would you like? Please type a number, for example 2.",
    recheck: "That does not look right. Could you check the number of bedrooms, please?",
    parse: parseBedrooms,
  }),
  field({
    key: "budget",
    label: "Budget",
    question: "What is your monthly budget for the rent?",
    hint: "For example £2,500 a month. A weekly amount is fine too.",
    retry: "Sorry, could you give your budget as an amount, for example £2,500 a month?",
    recheck: "That figure is unusual for a London rental. Could you check it, please?",
    parse: parseBudget,
  }),
  field({
    key: "area",
    label: "Area",
    question: "Which area of London would you like to live in?",
    hint: "An area or a postcode, for example Chelsea or SW3.",
    retry: "Sorry, which area of London would you prefer?",
    parse: parseArea,
  }),
  field({
    key: "moveInDate",
    label: "Move-in date",
    question: "When would you like to move in?",
    hint: "Type a date such as 15/11/2026 or 15 November, a month, or say as soon as possible.",
    retry:
      "Sorry, I could not read that date. Please give it as day, month and year, for example 15/11/2026, or say next month.",
    recheck: "That date is too far away. Could you give a date within the next two years?",
    past: "That date has already passed. When would you like to move in?",
    parse: parseMoveInDate,
  }),
  field({
    key: "employmentStatus",
    label: "Employment",
    question: "What is your employment status?",
    hint: "Employed, self-employed, student, retired or unemployed. You can skip this question.",
    retry:
      "Sorry, which of these best describes you: employed, self-employed, student, retired or unemployed?",
    skippable: true,
    parse: parseEmployment,
  }),
  field({
    key: "annualIncome",
    label: "Income",
    question: "Roughly what is your annual income before tax?",
    hint: "A rough figure is fine, for example £45,000. The agent uses it to check affordability.",
    retry: "Sorry, could you give an approximate yearly amount, for example £45,000?",
    recheck: "That figure seems unusual. Could you check it, please?",
    parse: parseIncome,
  }),
  field({
    key: "hasGuarantor",
    label: "Guarantor",
    question: "Would you be able to provide a guarantor if needed?",
    hint: "Someone who agrees to pay the rent if you cannot.",
    retry: "Sorry, would you be able to provide a guarantor: yes or no?",
    choices: ["Yes", "No"],
    parse: parseYesNo,
  }),
  field({
    key: "occupants",
    label: "People",
    question: "How many people will be living in the property, including you?",
    hint: "Type a number, for example 2.",
    retry:
      "Sorry, how many people will live there, including you? Please type a number, for example 2.",
    recheck: "That seems incorrect. Could you check the number of people, please?",
    parse: parseOccupants,
  }),
  field({
    key: "hasPets",
    label: "Pets",
    question: "Do you have any pets?",
    hint: "This is only for the agent to know.",
    retry: "Sorry, do you have any pets: yes or no?",
    choices: ["Yes", "No"],
    parse: parsePets,
  }),
  field({
    key: "requirements",
    label: "Requirements",
    question: "Do you have any additional requirements?",
    hint: "You can mention parking, a garden or other preferences. You can skip this question.",
    retry: "Sorry, could you tell me if you have any additional requirements?",
    choices: ["Parking", "Garden", "Lift", "Furnished", "Unfurnished"],
    skippable: true,
    parse: parseRequirements,
  }),
  field({
    key: "viewingPreference",
    label: "Viewing",
    question: "Do you have any preferred days or times for a viewing?",
    hint: "For example weekday evenings or Saturday morning. You can skip this question.",
    retry:
      "Sorry, which days or times would suit you for a viewing? For example weekday evenings or Saturday morning.",
    skippable: true,
    parse: parseViewing,
  }),
];

export type AskedField = (typeof FIELDS)[number]["key"];

// Compile-time check: every field the assistant can collect has a question.
const _allAsked: [Exclude<Asked, AskedField>] extends [never] ? true : false = true;
void _allAsked;

export const FIELD_ORDER: AskedField[] = FIELDS.map((spec) => spec.key);

export function fieldSpec(key: AskedField): (typeof FIELDS)[number] {
  const spec = FIELDS.find((item) => item.key === key);
  if (!spec) throw new Error(`Unknown field: ${key}`);

  return spec;
}

export function isAsked(key: string): key is AskedField {
  return (FIELD_ORDER as string[]).includes(key);
}

const DEFAULT_RECHECK = "That does not look right. Could you check it, please?";

/** The message that asks again after an answer that could not be used. */
export function retryText(spec: FieldSpec, reason: ParseFailure): string {
  if (reason === "unclear") return spec.retry;
  if (reason === "in_the_past" && spec.past) return spec.past;
  return spec.recheck ?? DEFAULT_RECHECK;
}
