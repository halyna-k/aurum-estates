import "server-only";

import * as chrono from "chrono-node";
import { findPhoneNumbersInText, parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

export type ParseFailure = "unclear" | "too_low" | "out_of_range" | "in_the_past";

export type ParseResult<T> = { ok: true; value: T } | { ok: false; reason: ParseFailure };

const ok = <T>(value: T): ParseResult<T> => ({ ok: true, value });
const fail = (reason: ParseFailure): ParseResult<never> => ({
  ok: false,
  reason,
});

/* ---------- Dates ---------- */
const pad = (n: number) => String(n).padStart(2, "0");

function toIso(date: Date): string {
  return [date.getUTCFullYear(), pad(date.getUTCMonth() + 1), pad(date.getUTCDate())].join("-");
}

/** Returns a date at UTC noon using London's current calendar date. */
function londonToday(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return new Date(Date.UTC(get("year"), get("month") - 1, get("day"), 12));
}

const NUMERIC_DATE = /\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2}|\d{4}))?\b/;

function numericDate(text: string, today: Date): Date | null {
  const match = NUMERIC_DATE.exec(text);

  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const yearText = match[3];

  const year = yearText
    ? yearText.length === 2
      ? 2000 + Number(yearText)
      : Number(yearText)
    : today.getUTCFullYear();

  const date = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;

  // Without a year, use the next occurrence.
  if (!yearText && toIso(date) < toIso(today)) date.setUTCFullYear(year + 1);

  return date;
}

const MONTH_ONLY =
  /^(?:(?:in |during |early |mid |late |the start of |the end of |end of )*)(january|february|march|april|may|june|july|august|september|october|november|december)$/i;

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export function parseMoveInDate(text: string, now = new Date()): ParseResult<string> {
  const today = londonToday(now);
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[.!]+$/, "");
  if (!t) return fail("unclear");
  let date: Date | null = null;

  const numericMatch = NUMERIC_DATE.test(t);

  if (numericMatch) {
    date = numericDate(t, today);

    // Do not allow invalid numeric dates to fall through to chrono.
    if (!date) return fail("unclear");
  } else if (
    /\b(asap|as soon as possible|immediately|straight away|right away|now|today|this month)\b/.test(
      t,
    )
  ) {
    date = today;
  } else if (/\bnext week\b/.test(t)) {
    date = new Date(today);
    date.setUTCDate(date.getUTCDate() + 7);
  } else if (/\bnext month\b/.test(t)) {
    date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1, 12));
  } else {
    const monthOnly = MONTH_ONLY.exec(t);

    if (monthOnly) {
      const month = MONTHS.indexOf(monthOnly[1].toLowerCase());
      const year =
        month < today.getUTCMonth() ? today.getUTCFullYear() + 1 : today.getUTCFullYear();

      date = month === today.getUTCMonth() ? today : new Date(Date.UTC(year, month, 1, 12));
    } else {
      date = chrono.en.GB.parseDate(text, today, {
        forwardDate: true,
      });
    }
  }

  if (!date || Number.isNaN(date.getTime())) return fail("unclear");

  const iso = toIso(date);
  if (iso < toIso(today)) return fail("in_the_past");

  const limit = new Date(
    Date.UTC(today.getUTCFullYear() + 2, today.getUTCMonth(), today.getUTCDate(), 12),
  );

  if (iso > toIso(limit)) return fail("out_of_range");

  return ok(iso);
}

/* ---------- Names, email, phone ---------- */
const NAME_LEAD =
  /^(?:(?:hi|hello|hey)\b[\s,!.]*)?(?:my name is|my name's|i am|i'm|im|it is|it's|this is|name is|call me)\s+/i;
const NAME_WORD = /^\p{L}[\p{L}'’.-]*$/u;

function titleCase(word: string): string {
  return word.toLowerCase().replace(/(^|[-'’])\p{L}/gu, (m) => m.toUpperCase());
}

export function parseName(text: string): ParseResult<string> {
  const name = text
    .trim()
    .replace(NAME_LEAD, "")
    .replace(/[.!]+$/, "")
    .replace(/\s+/g, " ");
  const words = name.split(" ");
  const letters = name.replace(/[^\p{L}]/gu, "");

  if (words.length < 2 || words.length > 5 || letters.length < 3 || name.length > 60)
    return fail("unclear");

  if (!words.every((word) => NAME_WORD.test(word))) return fail("unclear");

  const flat = name === name.toLowerCase() || name === name.toUpperCase();
  return ok(flat ? words.map(titleCase).join(" ") : name);
}

const EMAIL =
  /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+/i;

export function parseEmail(text: string): ParseResult<string> {
  const match = EMAIL.exec(text);
  const email = match?.[0].toLowerCase();

  if (!email || email.length > 254 || !z.string().email().safeParse(email).success)
    return fail("unclear");

  return ok(email);
}

/** Returns an E.164 phone number, for example +447911123456. */
export function parsePhone(text: string): ParseResult<string> {
  const found = findPhoneNumbersInText(text, "GB").find((hit) => hit.number.isValid());
  return found ? ok(found.number.number) : fail("unclear");
}

export function formatPhone(e164: string): string {
  const phone = parsePhoneNumberFromString(e164);
  if (!phone) return e164;
  return phone.countryCallingCode === "44" ? phone.formatNational() : phone.formatInternational();
}

/* ---------- Numbers ---------- */
const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

const NUMBER_TOKEN = new RegExp(`\\b(\\d+|${Object.keys(NUMBER_WORDS).join("|")})\\b`, "gi");

function counts(text: string): number[] {
  return [...text.matchAll(NUMBER_TOKEN)].map(
    (match) => NUMBER_WORDS[match[1].toLowerCase()] ?? Number(match[1]),
  );
}

/** Distinguishes negative amounts from ranges such as 2,000 - 2,500. */
function isNegative(text: string): boolean {
  const withoutRanges = text.replace(
    /(\d[\d,]*(?:\.\d+)?)\s*-\s*£?\s*(\d[\d,]*(?:\.\d+)?)/g,
    "$1 $2",
  );

  return (
    /(?:^|[^\d])-\s*(?:£\s*)?\d/.test(withoutRanges) || /\bminus\s*(?:£\s*)?\d/i.test(withoutRanges)
  );
}

function inRange(value: number, min: number, max: number): ParseResult<number> {
  return Number.isFinite(value) && value >= min && value <= max ? ok(value) : fail("out_of_range");
}

export function parseBedrooms(text: string): ParseResult<number> {
  if (/\bstudio\b/i.test(text)) return ok(0);
  if (isNegative(text)) return fail("out_of_range");
  const found = counts(text);
  return found.length ? inRange(Math.max(...found), 0, 10) : fail("unclear");
}

export function parseOccupants(text: string): ParseResult<number> {
  if (/\b(just me|only me|myself|on my own|alone)\b/i.test(text)) return ok(1);
  if (isNegative(text)) return fail("out_of_range");
  const found = counts(text);
  if (!found.length) return fail("unclear");

  // For ranges, use the upper bound instead of adding both numbers.
  const isRange = /\d\s*-\s*\d/.test(text);
  const total = isRange ? Math.max(...found) : found.reduce((sum, value) => sum + value, 0);

  return inRange(total, 1, 10);
}

/** Extracts amounts such as £2,500, 2.5k or 600 per week. */
function amounts(text: string): number[] {
  return [...text.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k|thousand)?/gi)]
    .map((match) => Number(match[1].replace(/,/g, "")) * (match[2] ? 1000 : 1))
    .filter(Number.isFinite);
}

const WEEKLY = /\b(pw|p\/w|per week|a week|weekly|each week)\b|\/w\b/i;
const MONTHLY = /\b(pcm|per month|a month|monthly|each month)\b|\/m\b/i;

/** Monthly rental budget in GBP. */
export function parseBudget(text: string): ParseResult<number> {
  if (isNegative(text)) return fail("out_of_range");
  const found = amounts(text);
  if (!found.length) return fail("unclear");
  const top = Math.max(...found);
  const monthly = WEEKLY.test(text) ? Math.round((top * 52) / 12) : Math.round(top);
  return inRange(monthly, 300, 50_000);
}

/** Gross annual income in GBP. */
export function parseIncome(text: string): ParseResult<number> {
  if (/\b(none|nothing|nil|zero|no income)\b/i.test(text)) return ok(0);
  if (isNegative(text)) return fail("out_of_range");
  const found = amounts(text);
  if (!found.length) return fail("unclear");
  const top = Math.max(...found);
  const annual = WEEKLY.test(text) ? top * 52 : MONTHLY.test(text) ? top * 12 : top;
  return inRange(Math.round(annual), 0, 1_000_000);
}

/* ---------- Choices ---------- */
export function parseYesNo(text: string): ParseResult<boolean> {
  const t = text.trim().toLowerCase();
  if (/^(no|nope|nah|n|none|not really|i do not|i don't|we don't|we do not)\b/.test(t))
    return ok(false);
  if (
    /^(yes|yeah|yep|yup|y|sure|correct|definitely|of course|i do|we do|i have|we have|i can|we can)\b/.test(
      t,
    )
  )
    return ok(true);
  return fail("unclear");
}

const ANIMALS =
  /\b(dogs?|puppy|puppies|cats?|kittens?|rabbits?|birds?|fish|hamsters?|guinea pigs?|pets?)\b/i;

export function parsePets(text: string): ParseResult<boolean> {
  const t = text.trim().toLowerCase();
  if (
    /\b(no pets?|without pets?|don't have (?:any )?pets?|do not have (?:any )?pets?|no animals?)\b/i.test(
      t,
    )
  )
    return ok(false);
  const answer = parseYesNo(text);
  if (answer.ok) return answer;
  return ANIMALS.test(text) ? ok(true) : fail("unclear");
}

type Choice<T extends string> = readonly [T, RegExp];

function pick<T extends string>(text: string, choices: readonly Choice<T>[]): ParseResult<T> {
  const hit = choices.find(([, pattern]) => pattern.test(text));
  return hit ? ok(hit[0]) : fail("unclear");
}

export function parsePropertyType(text: string) {
  return pick(text, [
    ["studio", /\bstudio\b/i],
    ["room", /\b(room|house ?share|flat ?share)\b/i],
    ["house", /\b(house|maisonette|terraced|semi|detached|bungalow)\b/i],
    ["flat", /\b(flat|apartment)\b/i],
    ["other", /\bother\b/i],
  ] as const);
}

export function parseEmployment(text: string) {
  return pick(text, [
    [
      "self_employed",
      /\b(self[- ]?employed|freelanc(?:e|er|ing)|contractor|own business|sole trader)\b/i,
    ],
    ["unemployed", /\b(unemployed|not working|between jobs|out of work)\b/i],
    ["student", /\b(student|studying|university|college)\b/i],
    ["retired", /\bretired\b/i],
    ["employed", /\b(employed|working|full[- ]?time|part[- ]?time|job|employee)\b/i],
    ["other", /\bother\b/i],
  ] as const);
}

/* ---------- Free text and declining ---------- */
function titleArea(value: string): string {
  return value
    .split(" ")
    .map((word) => (/\d/.test(word) ? word.toUpperCase() : titleCase(word)))
    .join(" ");
}

const POSTCODE = /^[a-z]{1,2}\d{1,2}[a-z]?(?: ?\d[a-z]{2})?$/i;

export function parseArea(text: string): ParseResult<string> {
  const value = text
    .trim()
    .replace(/[.!]+$/, "")
    .replace(/\s+/g, " ");
  if (!value || value.length > 100) return fail("unclear");
  if (POSTCODE.test(value)) return ok(value.toUpperCase());
  const letters = value.replace(/[^\p{L}]/gu, "");

  if (letters.length < 2 || !/^[\p{L}\p{N}\s,'’&.-]+$/u.test(value)) return fail("unclear");

  return ok(value === value.toLowerCase() ? titleArea(value) : value);
}

export function parseRequirements(text: string): ParseResult<string> {
  const value = text
    .trim()
    .replace(/[.!]+$/, "")
    .replace(/\s+/g, " ");

  if (value.length < 2 || value.length > 300) return fail("unclear");

  return ok(value);
}

const NIGHT = /\b(nights?|midnight|overnight)\b/i;
const DAY_OR_TIME =
  /\b(mon|tues?|wed|thu(?:rs?)?|fri|sat|sun)(?:day|sday|nesday|rsday|urday)?s?\b|\b(weekdays?|weekends?|mornings?|afternoons?|evenings?|lunch(?:time)?|any ?time|any day|flexible|whenever|today|tomorrow)\b|\b\d{1,2}(?::\d{2})?\s?(?:am|pm)\b|\b\d{1,2}:\d{2}\b/i;

export function parseViewing(text: string, now = new Date()): ParseResult<string> {
  const value = text.trim().replace(/\s+/g, " ");
  if (value.length < 2 || value.length > 300 || NIGHT.test(value)) return fail("unclear");
  const hasTime =
    DAY_OR_TIME.test(value) || chrono.en.GB.parseDate(value, londonToday(now)) !== null;
  return hasTime ? ok(value) : fail("unclear");
}

export function isDecline(text: string): boolean {
  return /\b(skip|pass|prefer not|rather not|not comfortable|don't want to (say|share)|do not want to (say|share)|no comment)\b/i.test(
    text,
  );
}
