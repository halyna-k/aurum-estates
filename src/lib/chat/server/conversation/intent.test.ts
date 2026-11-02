import { describe, expect, it } from "vitest";
import { FIELDS } from "@/lib/chat/server/answers/fields";
import { isFinished, looksLikeQuestion, parseConfirmation } from "./intent";

describe("looksLikeQuestion", () => {
  it.each([
    "How much is the deposit?",
    "can I have a pet",
    "do you allow dogs",
    "2 bedrooms?",
    "when is the property available",
  ])("sees %j as a question", (text) => {
    expect(looksLikeQuestion(text)).toBe(true);
  });

  it.each(["when possible", "Tom Ford", "2", "next week", "yes"])(
    "sees %j as an answer",
    (text) => {
      expect(looksLikeQuestion(text)).toBe(false);
    },
  );
});

describe("isFinished", () => {
  it.each([
    "no thanks",
    "No, thanks",
    "No? thanks",
    "No",
    "that's all",
    "thanks",
    "Thank you very much",
    "bye",
  ])("ends the chat after %j", (text) => {
    expect(isFinished(text)).toBe(true);
  });

  it.each([
    "No, I have another question",
    "What are the fees?",
    "thanks, but can I view it",
    "Thanks! When will the agent call?",
    "yes",
  ])("keeps the chat going after %j", (text) => {
    expect(isFinished(text)).toBe(false);
  });
});

describe("parseConfirmation", () => {
  it.each(["yes", "Yes please", "yep", "correct", "that's right", "all correct", "looks good"])(
    "reads %j as yes",
    (text) => {
      expect(parseConfirmation(text)).toEqual({ kind: "yes" });
    },
  );

  it("does not treat a vague reply as yes", () => {
    expect(parseConfirmation("ok")).toEqual({ kind: "unclear" });
    expect(parseConfirmation("maybe")).toEqual({ kind: "unclear" });
  });

  it("reads a plain no", () => {
    expect(parseConfirmation("no")).toEqual({ kind: "no" });
    expect(parseConfirmation("not really")).toEqual({ kind: "no" });
  });

  it.each([
    ["change my email", "email"],
    ["the budget is wrong", "budget"],
    ["yes but change the phone", "phone"],
    ["email", "email"],
    ["no, the move in date", "moveInDate"],
    ["the number of people is wrong", "occupants"],
    ["my phone number is wrong", "phone"],
  ])("reads %j as a change to %s", (text, field) => {
    expect(parseConfirmation(text)).toEqual({ kind: "change", field });
  });
});

describe("labels used as quick replies", () => {
  it.each(FIELDS.map((spec) => [spec.label, spec.key] as const))(
    "reads the label %s as a change to %s",
    (label, field) => {
      expect(parseConfirmation(label)).toEqual({ kind: "change", field });
    },
  );

  it("reads the confirmation quick replies", () => {
    expect(parseConfirmation("Yes, that is correct")).toEqual({ kind: "yes" });
    expect(parseConfirmation("Change something")).toEqual({ kind: "no" });
  });
});
