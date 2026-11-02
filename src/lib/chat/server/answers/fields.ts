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
  parseViewing,
  parseYesNo,
} from "./parsers";

type Asked = Exclude<LeadField, "propertyId">;

interface FieldSpec<K extends Asked = Asked> {
  key: K;
  /** Name of the detail in the summary and in the list of things to change. */
  label: string;
  question: string;
  /** Used when the answer was not understood. */
  retry: string;
  /** Used when the answer was understood but is not realistic. */
  recheck?: string;
  /** Quick replies offered with the question. Each one must be a valid answer. */
  choices?: string[];
  /** Contact details cannot be declined. */
  required?: boolean;
  parse: (text: string, now: Date) => ParseResult<NonNullable<LeadAnswers[K]>>;
}

const field = <K extends Asked>(spec: FieldSpec<K>) => spec;

/** The questions, in the order they are asked. */
export const FIELDS = [
  field({
    key: "fullName",
    label: "Name",
    question: "May I take your full name, please?",
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
    question: "And a contact number, please? You can skip this if you prefer.",
    retry:
      "Could you check that number, please? Include the country code if it is not a UK number.",
    parse: parsePhone,
  }),
  field({
    key: "propertyType",
    label: "Property type",
    question: "What type of property are you looking for: a studio, flat, house or room?",
    retry: "Sorry, was that a studio, flat, house or room?",
    choices: ["Studio", "Flat", "House", "Room"],
    parse: parsePropertyType,
  }),
  field({
    key: "bedrooms",
    label: "Bedrooms",
    question: "How many bedrooms would you like?",
    retry: "Sorry, how many bedrooms would you like? A number is fine, or say studio.",
    recheck: "That does not look right. Could you check the number of bedrooms, please?",
    choices: ["0", "1", "2", "3"],
    parse: parseBedrooms,
  }),
  field({
    key: "budget",
    label: "Budget",
    question: "What is your monthly budget for the rent?",
    retry: "Sorry, could you give your budget as an amount, for example £2,500 a month?",
    recheck: "That figure is unusual for a London rental. Could you check it, please?",
    parse: parseBudget,
  }),
  field({
    key: "area",
    label: "Area",
    question: "Which area of London would you like to live in?",
    retry: "Sorry, which area of London would you prefer?",
    parse: parseArea,
  }),
  field({
    key: "moveInDate",
    label: "Move-in date",
    question: "When would you like to move in?",
    retry: "Sorry, could you give a date or a month, for example 15 November?",
    recheck: "That date is not available. Could you give a date within the next two years?",
    choices: ["As soon as possible", "Next month"],
    parse: parseMoveInDate,
  }),
  field({
    key: "employmentStatus",
    label: "Employment",
    question:
      "What is your employment status: employed, self-employed, student, retired or unemployed?",
    retry:
      "Sorry, which of these best describes you: employed, self-employed, student, retired or unemployed?",
    choices: ["Employed", "Self-employed", "Student", "Retired", "Unemployed"],
    parse: parseEmployment,
  }),
  field({
    key: "annualIncome",
    label: "Income",
    question: "Roughly what is your annual income before tax?",
    retry: "Sorry, could you give an approximate yearly amount, for example £45,000?",
    recheck: "That figure seems unusual. Could you check it, please?",
    parse: parseIncome,
  }),
  field({
    key: "hasGuarantor",
    label: "Guarantor",
    question: "Would you be able to provide a guarantor if needed?",
    retry: "Sorry, would you be able to provide a guarantor: yes or no?",
    choices: ["Yes", "No"],
    parse: parseYesNo,
  }),
  field({
    key: "occupants",
    label: "People",
    question: "How many people will be living in the property, including you?",
    retry: "Sorry, how many people will live there, including you?",
    recheck: "That seems a lot. Could you check the number of people, please?",
    choices: ["1", "2", "3", "4"],
    parse: parseOccupants,
  }),
  field({
    key: "hasPets",
    label: "Pets",
    question: "Do you have any pets?",
    retry: "Sorry, do you have any pets: yes or no?",
    choices: ["Yes", "No"],
    parse: parsePets,
  }),
  field({
    key: "viewingPreference",
    label: "Viewing",
    question: "Do you have any preferred days or times for a viewing?",
    retry: "Sorry, which days or times would suit you for a viewing?",
    choices: ["Weekday evenings", "Weekends", "Any time"],
    parse: parseViewing,
  }),
];

export type AskedField = (typeof FIELDS)[number]["key"];

// Compile-time check: every field the assistant can collect has a question.
const _allAsked: [Exclude<Asked, AskedField>] extends [never] ? true : false = true;
void _allAsked;

export const FIELD_ORDER: AskedField[] = FIELDS.map((spec) => spec.key);

export function fieldSpec(key: AskedField): (typeof FIELDS)[number] {
  return FIELDS.find((spec) => spec.key === key)!;
}

export function isAsked(key: string): key is AskedField {
  return (FIELD_ORDER as string[]).includes(key);
}

const DEFAULT_RECHECK = "That does not look right. Could you check it, please?";

/** The message that asks again after an answer that could not be used. */
export function retryText(spec: FieldSpec, reason: ParseFailure): string {
  return reason === "unclear" ? spec.retry : (spec.recheck ?? DEFAULT_RECHECK);
}
