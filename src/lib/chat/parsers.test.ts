import { describe, expect, it } from "vitest";
import {
  formatPhone,
  isDecline,
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
  parseText,
  parseYesNo,
} from "./parsers";

// Friday 23 October 2026, London time.
const NOW = new Date("2026-10-23T12:00:00Z");

const value = <T>(result: { ok: boolean; value?: T }) => (result.ok ? result.value : undefined);
const reason = (result: { ok: boolean; reason?: string }) =>
  result.ok ? undefined : result.reason;

describe("parseMoveInDate", () => {
  it.each([
    ["asap", "2026-10-23"],
    ["as soon as possible", "2026-10-23"],
    ["this month", "2026-10-23"],
    ["October", "2026-10-23"],
    ["next week", "2026-10-30"],
    ["next month", "2026-11-01"],
    ["December", "2026-12-01"],
    ["15 November", "2026-11-15"],
    ["15/11/2026", "2026-11-15"],
    ["in two weeks", "2026-11-06"],
  ])("reads %s", (text, expected) => {
    expect(value(parseMoveInDate(text, NOW))).toBe(expected);
  });

  it("rejects dates in the past", () => {
    expect(reason(parseMoveInDate("1 October 2026", NOW))).toBe("in_the_past");
  });

  it("rejects dates more than two years away", () => {
    expect(reason(parseMoveInDate("15 November 2031", NOW))).toBe("out_of_range");
  });

  it("rejects text without a date", () => {
    expect(reason(parseMoveInDate("whenever it suits", NOW))).toBe("unclear");
  });
});

describe("parseName", () => {
  it("strips the introduction and tidies the case", () => {
    expect(value(parseName("my name is john smith"))).toBe("John Smith");
  });

  it("keeps mixed case and punctuation", () => {
    expect(value(parseName("I'm Anna-Marie O'Brien."))).toBe("Anna-Marie O'Brien");
  });

  it.each(["Tom", "12345", "tom 99 smith", "a b", "x".repeat(70)])("rejects %s", (text) => {
    expect(reason(parseName(text))).toBe("unclear");
  });
});

describe("parseEmail", () => {
  it("finds the address inside a sentence", () => {
    expect(value(parseEmail("It is Tom.Smith@Example.com."))).toBe("tom.smith@example.com");
  });

  it.each(["not an email", "tom@", "tom@example"])("rejects %s", (text) => {
    expect(reason(parseEmail(text))).toBe("unclear");
  });
});

describe("parsePhone", () => {
  it("accepts a UK mobile and stores it in international form", () => {
    expect(value(parsePhone("07911 123456"))).toBe("+447911123456");
    expect(value(parsePhone("my number is +44 7911 123456"))).toBe("+447911123456");
  });

  it("accepts a number from another country", () => {
    expect(value(parsePhone("+33 6 12 34 56 78"))).toBe("+33612345678");
  });

  it("rejects numbers that are too short", () => {
    expect(reason(parsePhone("0775656533"))).toBe("unclear");
    expect(reason(parsePhone("call me"))).toBe("unclear");
  });

  it("formats a UK number the way people write it", () => {
    expect(formatPhone("+447911123456")).toBe("07911 123456");
  });
});

describe("parseBedrooms and parseOccupants", () => {
  it("understands studios, digits and words", () => {
    expect(value(parseBedrooms("a studio please"))).toBe(0);
    expect(value(parseBedrooms("2"))).toBe(2);
    expect(value(parseBedrooms("two bedrooms"))).toBe(2);
    expect(value(parseBedrooms("2 or 3"))).toBe(3);
  });

  it("rejects implausible numbers of bedrooms", () => {
    expect(reason(parseBedrooms("25"))).toBe("out_of_range");
    expect(reason(parseBedrooms("lots"))).toBe("unclear");
  });

  it("adds up the people in the household", () => {
    expect(value(parseOccupants("just me"))).toBe(1);
    expect(value(parseOccupants("2 adults and 1 child"))).toBe(3);
  });

  it("rejects implausible households", () => {
    expect(reason(parseOccupants("150"))).toBe("out_of_range");
    expect(reason(parseOccupants("1000"))).toBe("out_of_range");
    expect(reason(parseOccupants("me and my partner"))).toBe("unclear");
  });
});

describe("parseBudget", () => {
  it.each([
    ["£2,500", 2500],
    ["2.5k", 2500],
    ["up to 3k a month", 3000],
    ["between 2000 and 2500", 2500],
    ["£600 per week", 2600],
  ])("reads %s", (text, expected) => {
    expect(value(parseBudget(text))).toBe(expected);
  });

  it("rejects amounts that are not realistic for a London rental", () => {
    expect(reason(parseBudget("£50"))).toBe("out_of_range");
    expect(reason(parseBudget("a lot"))).toBe("unclear");
  });
});

describe("parseIncome", () => {
  it.each([
    ["£45,000", 45000],
    ["35k", 35000],
    ["3500 a month", 42000],
    ["none", 0],
  ])("reads %s", (text, expected) => {
    expect(value(parseIncome(text))).toBe(expected);
  });

  it("rejects text without an amount", () => {
    expect(reason(parseIncome("enough"))).toBe("unclear");
  });
});

describe("parseYesNo and parsePets", () => {
  it("reads plain answers", () => {
    expect(value(parseYesNo("yes"))).toBe(true);
    expect(value(parseYesNo("No thanks"))).toBe(false);
    expect(reason(parseYesNo("maybe"))).toBe("unclear");
  });

  it("recognises pets by name but never guesses", () => {
    expect(value(parsePets("I have a dog"))).toBe(true);
    expect(value(parsePets("no pets"))).toBe(false);
    expect(reason(parsePets("crocodile"))).toBe("unclear");
  });
});

describe("choices", () => {
  it("reads employment status", () => {
    expect(value(parseEmployment("I'm self-employed"))).toBe("self_employed");
    expect(value(parseEmployment("unemployed"))).toBe("unemployed");
    expect(value(parseEmployment("working full time"))).toBe("employed");
    expect(value(parseEmployment("a student"))).toBe("student");
  });

  it("reads property type", () => {
    expect(value(parsePropertyType("a one bed flat"))).toBe("flat");
    expect(value(parsePropertyType("room in a houseshare"))).toBe("room");
    expect(value(parsePropertyType("studio"))).toBe("studio");
    expect(reason(parsePropertyType("castle"))).toBe("unclear");
  });
});

describe("free text and declining", () => {
  it("accepts short free text and rejects empty or numeric answers", () => {
    expect(value(parseText("  Any   weekday evening ", 300))).toBe("Any weekday evening");
    expect(reason(parseText("", 300))).toBe("unclear");
    expect(reason(parseText("12345", 300))).toBe("unclear");
  });

  it("detects a polite refusal", () => {
    expect(isDecline("I'd rather not say")).toBe(true);
    expect(isDecline("skip")).toBe(true);
    expect(isDecline("yes")).toBe(false);
  });
});
