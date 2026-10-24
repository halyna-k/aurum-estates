import { describe, expect, it } from "vitest";
import {
  type Context,
  type Session,
  applyAnswer,
  newSession,
  nextField,
  openSession,
  sealSession,
} from "./session";

const NOW = new Date("2026-10-23T12:00:00Z");
const SECRET = "test-secret-of-at-least-thirty-two-characters";
const ctx: Context = { incomeToAnnualRent: 2.5 };

function session(patch: Partial<Session> = {}): Session {
  return { ...newSession(), ...patch };
}

describe("nextField", () => {
  it("starts with the name and then the email", () => {
    expect(nextField(session(), ctx)).toBe("fullName");
    expect(
      nextField(session({ answers: { fullName: "Tom Ford", email: "t@example.com" } }), ctx),
    ).toBe("phone");
  });

  it("does not ask about a declined field again", () => {
    const s = session({
      answers: { fullName: "Tom Ford", email: "t@example.com" },
      declined: ["phone"],
    });
    expect(nextField(s, ctx)).toBe("propertyType");
  });

  it("skips the guarantor when income comfortably covers the rent", () => {
    const s = session({
      answers: { fullName: "Tom Ford", email: "t@example.com", budget: 2000, annualIncome: 60000 },
      declined: ["phone", "propertyType", "bedrooms", "area", "moveInDate", "employmentStatus"],
    });
    expect(nextField(s, ctx)).toBe("occupants");
  });

  it("asks about a guarantor when income is below the guide", () => {
    const s = session({
      answers: { fullName: "Tom Ford", email: "t@example.com", budget: 2000, annualIncome: 40000 },
      declined: ["phone", "propertyType", "bedrooms", "area", "moveInDate", "employmentStatus"],
    });
    expect(nextField(s, ctx)).toBe("hasGuarantor");
  });

  it("asks about a guarantor when the income was not given", () => {
    const s = session({
      answers: { fullName: "Tom Ford", email: "t@example.com", budget: 2000 },
      declined: [
        "phone",
        "propertyType",
        "bedrooms",
        "area",
        "moveInDate",
        "employmentStatus",
        "annualIncome",
      ],
    });
    expect(nextField(s, ctx)).toBe("hasGuarantor");
  });

  it("does not repeat what a property enquiry already tells us", () => {
    const s = session({
      answers: { fullName: "Tom Ford", email: "t@example.com", propertyId: "brook-street-14" },
      declined: ["phone"],
    });
    expect(nextField(s, { ...ctx, propertyRentPcm: 6500 })).toBe("moveInDate");
  });

  it("finishes when every field is answered or declined", () => {
    const s = session({
      answers: { fullName: "Tom Ford", email: "t@example.com" },
      declined: [
        "phone",
        "propertyType",
        "bedrooms",
        "budget",
        "area",
        "moveInDate",
        "employmentStatus",
        "annualIncome",
        "hasGuarantor",
        "occupants",
        "hasPets",
        "viewingPreference",
      ],
    });
    expect(nextField(s, ctx)).toBeUndefined();
  });
});

describe("applyAnswer", () => {
  it("stores a good answer", () => {
    const { session: next, outcome } = applyAnswer(
      session(),
      "fullName",
      "my name is tom ford",
      NOW,
    );
    expect(outcome.kind).toBe("accepted");
    expect(next.answers.fullName).toBe("Tom Ford");
  });

  it("asks again after an unclear answer and then gives up on an optional field", () => {
    const first = applyAnswer(session(), "hasPets", "crocodile", NOW);
    expect(first.outcome).toEqual({
      kind: "retry",
      message: "Sorry, do you have any pets: yes or no?",
    });

    const second = applyAnswer(first.session, "hasPets", "a crocodile", NOW);
    expect(second.outcome.kind).toBe("skipped");
    expect(second.session.declined).toContain("hasPets");
    expect(second.session.answers.hasPets).toBeUndefined();
  });

  it("uses the recheck text for an unrealistic number", () => {
    const { outcome } = applyAnswer(session(), "occupants", "150", NOW);
    expect(outcome).toEqual({
      kind: "retry",
      message: "That seems a lot. Could you check the number of people, please?",
    });
  });

  it("resets the attempts once an answer is accepted", () => {
    const failed = applyAnswer(session(), "occupants", "150", NOW).session;
    const fixed = applyAnswer(failed, "occupants", "2", NOW).session;
    expect(fixed.answers.occupants).toBe(2);
    expect(fixed.attempts.occupants).toBeUndefined();
  });

  it("lets the applicant decline an optional question", () => {
    const { session: next, outcome } = applyAnswer(
      session(),
      "annualIncome",
      "I'd rather not say",
      NOW,
    );
    expect(outcome.kind).toBe("declined");
    expect(next.declined).toContain("annualIncome");
  });

  it("does not let the applicant decline the name or the email", () => {
    const { outcome } = applyAnswer(session(), "email", "I'd rather not say", NOW);
    expect(outcome.kind).toBe("retry");
  });

  it("hands over to a person after three failed attempts on a required field", () => {
    let current = session();
    for (const text of ["hmm", "no idea", "x"]) {
      const result = applyAnswer(current, "email", text, NOW);
      current = result.session;
      if (text === "x") {
        expect(result.outcome.kind).toBe("handover");
        expect(current.phase).toBe("closed");
      } else {
        expect(result.outcome.kind).toBe("retry");
      }
    }
  });

  it("does not change the session it was given", () => {
    const original = session();
    applyAnswer(original, "fullName", "Tom Ford", NOW);
    expect(original.answers).toEqual({});
  });
});

describe("sealed session", () => {
  const sample = session({
    answers: { fullName: "Tom Ford", email: "t@example.com", propertyId: "brook-street-14" },
    declined: ["phone"],
    attempts: { occupants: 1 },
  });

  it("round-trips", () => {
    expect(openSession(sealSession(sample, SECRET, NOW), SECRET, NOW)).toEqual(sample);
  });

  it("rejects a changed body", () => {
    const [, signature] = sealSession(sample, SECRET, NOW).split(".");
    const forged = Buffer.from(
      JSON.stringify({ session: { ...sample, phase: "saved" }, issuedAt: NOW.getTime() }),
    ).toString("base64url");
    expect(openSession(`${forged}.${signature}`, SECRET, NOW)).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    expect(
      openSession(sealSession(sample, "another-secret-another-secret-1234", NOW), SECRET, NOW),
    ).toBeNull();
  });

  it("rejects an expired token", () => {
    const later = new Date(NOW.getTime() + 3 * 60 * 60 * 1000);
    expect(openSession(sealSession(sample, SECRET, NOW), SECRET, later)).toBeNull();
  });

  it.each(["", "abc", "a.b.c", "....", "not-a-token"])("rejects %j", (token) => {
    expect(openSession(token, SECRET, NOW)).toBeNull();
  });

  it("drops fields that no longer exist", () => {
    const old = { ...sample, answers: { ...sample.answers, retiredField: "x" } } as Session;
    const opened = openSession(sealSession(old, SECRET, NOW), SECRET, NOW);
    expect(opened?.answers).not.toHaveProperty("retiredField");
  });
});
