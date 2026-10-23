import * as chrono from "chrono-node";
import { findPhoneNumbersInText, parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

/** Server only: libphonenumber-js is too large for the browser bundle. */

export type ParseFailure = "unclear" | "out_of_range" | "in_the_past";

export type ParseResult<T> = { ok: true; value: T } | { ok: false; reason: ParseFailure };

const ok = <T>(value: T): ParseResult<T> => ({ ok: true, value });
const fail = (reason: ParseFailure): ParseResult<never> => ({ ok: false, reason });

/* ---------- Dates ---------- */

const pad = (n: number) => String(n).padStart(2, "0");

function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Today's calendar date in London, as a local noon Date so arithmetic never crosses a day. */
function londonToday(now: Date): Date {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" })
    .format(now)
    .split("-")
    .map(Number);
  return new Date(year, month - 1, day, 12);
}

const MONTH_ONLY =
  /^(?:in |during |early |mid |late |the start of |the end of |end of )*(january|february|march|april|may|june|july|august|september|october|november|december)$/i;

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
  let date: Date | null = null;

  const monthOnly = MONTH_ONLY.exec(t);
  if (
    /\b(asap|as soon as possible|immediately|straight away|right away|now|today|this month)\b/.test(
      t,
    )
  ) {
    date = today;
  } else if (/\bnext week\b/.test(t)) {
    date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 12);
  } else if (/\bnext month\b/.test(t)) {
    date = new Date(today.getFullYear(), today.getMonth() + 1, 1, 12);
  } else if (monthOnly) {
    const month = MONTHS.indexOf(monthOnly[1].toLowerCase());
    const year = month < today.getMonth() ? today.getFullYear() + 1 : today.getFullYear();
    // The current month means "from today", any later month means its first day.
    date = month === today.getMonth() ? today : new Date(year, month, 1, 12);
  } else {
    date = chrono.en.GB.parseDate(text, today, { forwardDate: true });
  }

  if (!date) return fail("unclear");
  const iso = toIso(date);
  if (iso < toIso(today)) return fail("in_the_past");
  const limit = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate(), 12);
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

  if (words.length < 2 || words.length > 5 || letters.length < 3 || name.length > 60) {
    return fail("unclear");
  }
  if (!words.every((word) => NAME_WORD.test(word))) return fail("unclear");

  const flat = name === name.toLowerCase() || name === name.toUpperCase();
  return ok(flat ? words.map(titleCase).join(" ") : name);
}

const EMAIL = /[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]*[^\s@<>()",;:.]/;

export function parseEmail(text: string): ParseResult<string> {
  const match = EMAIL.exec(text);
  const email = match?.[0].toLowerCase();
  if (!email || email.length > 254 || !z.email().safeParse(email).success) return fail("unclear");
  return ok(email);
}

/** Returns the number in E.164 form, for example +447911123456. */
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
    (m) => NUMBER_WORDS[m[1].toLowerCase()] ?? Number(m[1]),
  );
}

function inRange(value: number, min: number, max: number): ParseResult<number> {
  return value >= min && value <= max ? ok(value) : fail("out_of_range");
}

export function parseBedrooms(text: string): ParseResult<number> {
  if (/\bstudio\b/i.test(text)) return ok(0);
  const found = counts(text);
  return found.length ? inRange(Math.max(...found), 0, 10) : fail("unclear");
}

export function parseOccupants(text: string): ParseResult<number> {
  if (/\b(just me|only me|myself|on my own|alone)\b/i.test(text)) return ok(1);
  const found = counts(text);
  return found.length
    ? inRange(
        found.reduce((a, b) => a + b, 0),
        1,
        10,
      )
    : fail("unclear");
}

/** Amounts such as £2,500, 2.5k or 600 per week. Several figures give the highest one. */
function amounts(text: string): number[] {
  return [...text.matchAll(/(\d[\d,]*(?:\.\d+)?)\s*(k|thousand)?/gi)]
    .map((m) => Number(m[1].replace(/,/g, "")) * (m[2] ? 1000 : 1))
    .filter(Number.isFinite);
}

const WEEKLY = /\b(pw|p\/w|per week|a week|weekly|each week)\b|\/w\b/i;
const MONTHLY = /\b(pcm|per month|a month|monthly|each month)\b|\/m\b/i;

/** Monthly rent budget in GBP. Weekly figures are converted to a calendar month. */
export function parseBudget(text: string): ParseResult<number> {
  const found = amounts(text);
  if (!found.length) return fail("unclear");
  const top = Math.max(...found);
  const monthly = WEEKLY.test(text) ? Math.round((top * 52) / 12) : Math.round(top);
  return inRange(monthly, 300, 50_000);
}

/** Gross annual income in GBP. Monthly and weekly figures are annualised. */
export function parseIncome(text: string): ParseResult<number> {
  if (/\b(none|nothing|nil|zero|no income)\b/i.test(text)) return ok(0);
  const found = amounts(text);
  if (!found.length) return fail("unclear");
  const top = Math.max(...found);
  const annual = WEEKLY.test(text) ? top * 52 : MONTHLY.test(text) ? top * 12 : top;
  return inRange(Math.round(annual), 0, 1_000_000);
}

/* ---------- Choices ---------- */

export function parseYesNo(text: string): ParseResult<boolean> {
  const t = text.trim().toLowerCase();
  if (/^(no|nope|nah|n|none|not really|i do not|i don'?t|we don'?t|we do not)\b/.test(t))
    return ok(false);
  if (
    /^(yes|yeah|yep|yup|y|sure|correct|definitely|of course|i do|we do|i have|we have|i can|we can)\b/.test(
      t,
    )
  ) {
    return ok(true);
  }
  return fail("unclear");
}

const ANIMALS =
  /\b(dogs?|puppy|puppies|cats?|kittens?|rabbits?|birds?|fish|hamsters?|guinea pigs?|pets?)\b/i;

export function parsePets(text: string): ParseResult<boolean> {
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
    ["self_employed", /\b(self[- ]?employed|freelanc\w*|contractor|own business|sole trader)\b/i],
    ["unemployed", /\b(unemployed|not working|between jobs|out of work)\b/i],
    ["student", /\b(student|studying|university|college)\b/i],
    ["retired", /\bretired\b/i],
    ["employed", /\b(employed|working|full[- ]?time|part[- ]?time|job|employee)\b/i],
    ["other", /\bother\b/i],
  ] as const);
}

/* ---------- Free text and declining ---------- */

export function parseText(text: string, max: number): ParseResult<string> {
  const value = text.trim().replace(/\s+/g, " ");
  if (value.length < 2 || value.length > max || !/\p{L}/u.test(value)) return fail("unclear");
  return ok(value);
}

export function isDecline(text: string): boolean {
  return /\b(skip|pass|prefer not|rather not|not comfortable|don'?t want to (say|share)|no comment)\b/i.test(
    text,
  );
}
