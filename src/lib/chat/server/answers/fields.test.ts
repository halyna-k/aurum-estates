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

  it("requires the name and the email", () => {
    const required = FIELDS.filter((spec) => spec.required).map((spec) => spec.key);
    expect(required).toEqual(["fullName", "email"]);
  });

  it("lets the applicant skip only what is sensitive or not essential", () => {
    const skippable = FIELDS.filter((spec) => spec.skippable).map((spec) => spec.key);
    expect(skippable).toEqual(["phone", "employmentStatus", "requirements", "viewingPreference"]);
  });

  it("asks questions that are short and read as questions", () => {
    for (const spec of FIELDS) {
      expect(spec.question).toContain("?");
      expect(spec.question.length).toBeLessThan(160);
    }
  });

  it("gives every detail its own label", () => {
    const labels = FIELDS.map((spec) => spec.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("hints", () => {
  it("keeps the question short and puts the format or the reason in the hint", () => {
    for (const spec of FIELDS) {
      expect(spec.question.endsWith("?"), spec.key).toBe(true);
      expect(spec.question.length, spec.key).toBeLessThan(80);
      expect(spec.hint?.length ?? 0, spec.key).toBeLessThan(110);
    }
  });

  it("explains the answer to every question that is not a plain contact detail", () => {
    for (const spec of FIELDS.filter((s) => s.key !== "email")) {
      expect(spec.hint, spec.key).toBeTruthy();
    }
  });

  it("says in the hint that a question can be skipped, when it can", () => {
    for (const spec of FIELDS.filter((field) => field.skippable)) {
      expect(spec.hint?.toLowerCase().includes("skip"), spec.key).toBe(Boolean(spec.skippable));
    }
  });

  it("uses Yes/No choices for boolean questions", () => {
    for (const key of ["hasGuarantor", "hasPets"] as const) {
      expect(fieldSpec(key).choices).toEqual(["Yes", "No"]);
    }
  });
});

describe("retry messages", () => {
  it("uses the retry text when the answer was not understood", () => {
    expect(retryText(fieldSpec("email"), "unclear")).toBe(fieldSpec("email").retry);
  });

  it("uses the recheck text for unrealistic answers", () => {
    expect(retryText(fieldSpec("occupants"), "out_of_range")).toContain("seems incorrect");
  });

  it("falls back to a generic recheck", () => {
    expect(retryText(fieldSpec("fullName"), "out_of_range")).toContain("does not look right");
  });
});

describe("answers from the earlier test conversation", () => {
  it("rejects what the first prototype accepted", () => {
    expect(fieldSpec("occupants").parse("0", NOW).ok).toBe(false);
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
