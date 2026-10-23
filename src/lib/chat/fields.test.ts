import { describe, expect, it } from "vitest";
import { FIELDS, FIELD_ORDER, fieldSpec, retryText } from "./fields";

const NOW = new Date("2026-10-23T12:00:00Z");

describe("question flow", () => {
  it("asks for contact details first and for viewing times last", () => {
    expect(FIELD_ORDER.slice(0, 2)).toEqual(["fullName", "email"]);
    expect(FIELD_ORDER.at(-1)).toBe("viewingPreference");
  });

  it("has no repeated fields", () => {
    expect(new Set(FIELD_ORDER).size).toBe(FIELD_ORDER.length);
  });

  it("lets applicants decline everything except name and email", () => {
    const required = FIELDS.filter((spec) => spec.required).map((spec) => spec.key);
    expect(required).toEqual(["fullName", "email"]);
  });

  it("asks short questions that end with a question mark", () => {
    for (const spec of FIELDS.filter((s) => s.key !== "phone")) {
      expect(spec.question.endsWith("?")).toBe(true);
      expect(spec.question.length).toBeLessThan(100);
    }
  });
});

describe("retry messages", () => {
  it("uses the retry text when the answer was not understood", () => {
    expect(retryText(fieldSpec("email"), "unclear")).toBe(fieldSpec("email").retry);
  });

  it("uses the recheck text for unrealistic answers", () => {
    expect(retryText(fieldSpec("occupants"), "out_of_range")).toContain("seems a lot");
  });

  it("falls back to a generic recheck", () => {
    expect(retryText(fieldSpec("fullName"), "out_of_range")).toContain("does not look right");
  });
});

describe("answers from the earlier test conversation", () => {
  it("rejects what the first prototype accepted", () => {
    expect(fieldSpec("occupants").parse("150", NOW).ok).toBe(false);
    expect(fieldSpec("occupants").parse("1000", NOW).ok).toBe(false);
    expect(fieldSpec("budget").parse("£50", NOW).ok).toBe(false);
    expect(fieldSpec("phone").parse("0775656533", NOW).ok).toBe(false);
    expect(fieldSpec("hasPets").parse("crocodile", NOW).ok).toBe(false);
  });

  it("reads the dates the prototype got wrong", () => {
    expect(fieldSpec("moveInDate").parse("asap", NOW)).toEqual({ ok: true, value: "2026-10-23" });
    expect(fieldSpec("moveInDate").parse("this month", NOW)).toEqual({
      ok: true,
      value: "2026-10-23",
    });
    expect(fieldSpec("moveInDate").parse("next week", NOW)).toEqual({
      ok: true,
      value: "2026-10-30",
    });
  });
});
