import { describe, expect, it } from "vitest";
import { agency } from "@/agency/config";
import { PROPERTIES } from "@/agency/properties";
import type { Property } from "@/types/property";
import { FIELD_ORDER, fieldSpec } from "@/lib/chat/server/answers/fields";
import { afterSave, restartTurn, takeTurn, type Turn } from "./flow";
import { type Context, type Session, newSession } from "./session";

const NOW = new Date("2026-10-23T12:00:00Z");

function ctxFor(property?: Property): Context {
  return { propertyRentPcm: property?.rentPcm, incomeToAnnualRent: 2.5 };
}

function turn(session: Session, text: string, property?: Property): Turn {
  return takeTurn({ session, text, ctx: ctxFor(property), agency, property, now: NOW });
}

/** Feeds the messages one by one and returns the last turn. */
function converse(messages: string[], start = newSession(), property?: Property): Turn {
  let current = start;
  let last: Turn | undefined;
  for (const text of messages) {
    last = turn(current, text, property);
    current = last.session;
  }
  if (!last) throw new Error("no messages");
  return last;
}

const message = (t: Turn) => (t.kind === "say" ? t.message : "");
const replies = (t: Turn) => (t.kind === "save" ? [] : t.suggestions);

const CONTACT = ["Tom Ford", "tom@example.com", "07911 123456"];
const FULL = [
  ...CONTACT,
  "flat",
  "2",
  "£2,500",
  "Chelsea",
  "asap",
  "employed",
  "£45,000",
  "yes",
  "2",
  "no pets",
  "weekday evenings",
];

describe("greeting", () => {
  it("ends with the first question", () => {
    const first = fieldSpec(FIELD_ORDER[0]).question.toLowerCase();
    expect(agency.chat.opening.toLowerCase()).toContain(first);
  });
});

describe("collecting details", () => {
  it("asks the questions in order and ends with a summary to confirm", () => {
    const last = converse(FULL);
    expect(last.session.phase).toBe("confirming");
    expect(message(last)).toContain("Name: Tom Ford");
    expect(message(last)).toContain("Phone: 07911 123456");
    expect(message(last)).toContain("Move-in date: 23 Oct 2026");
    expect(message(last)).toContain("Guarantor: Yes");
    expect(message(last).endsWith("Is that all correct?")).toBe(true);
  });

  it("asks again when a number is not realistic", () => {
    const last = converse([
      ...CONTACT,
      "flat",
      "2",
      "£2,500",
      "Chelsea",
      "asap",
      "employed",
      "£45,000",
      "yes",
      "150",
    ]);
    expect(message(last)).toBe("That seems a lot. Could you check the number of people, please?");
  });

  it("moves on after two unclear answers about an optional detail", () => {
    const last = converse([...FULL.slice(0, 12), "crocodile", "a crocodile"]);
    expect(message(last)).toBe(
      `No problem, let us move on.\n\n${fieldSpec("viewingPreference").question}`,
    );
  });

  it("does not accept nights as a time for a viewing", () => {
    const last = converse([...FULL.slice(0, 13), "nights"]);
    expect(message(last)).toBe(fieldSpec("viewingPreference").retry);
  });

  it("does not accept a negative budget or income", () => {
    expect(message(converse([...CONTACT, "flat", "2", "-900"]))).toBe(fieldSpec("budget").recheck);
    const income = converse([
      ...CONTACT,
      "flat",
      "2",
      "£2,500",
      "Chelsea",
      "asap",
      "employed",
      "-900",
    ]);
    expect(message(income)).toBe(fieldSpec("annualIncome").recheck);
  });

  it("shows what was left out in the summary", () => {
    const last = converse([
      ...CONTACT,
      "flat",
      "2",
      "£2,500",
      "Chelsea",
      "asap",
      "employed",
      "£45,000",
      "yes",
      "18",
      "18",
      "no pets",
      "weekday evenings",
    ]);
    expect(message(last)).toContain("People: Not given");
  });

  it("lets the applicant skip an optional question", () => {
    const last = converse(["Tom Smith", "tom@example.com", "I'd rather not say"]);
    expect(message(last)).toBe(`That is fine.\n\n${fieldSpec("propertyType").question}`);
  });

  it("does not ask for a guarantor when income covers the rent", () => {
    const last = converse([
      ...CONTACT,
      "flat",
      "2",
      "£2,000",
      "Chelsea",
      "asap",
      "employed",
      "£80,000",
    ]);
    expect(message(last)).toBe(fieldSpec("occupants").question);
  });

  it("skips what a property enquiry already tells us", () => {
    const property = PROPERTIES[0];
    const start = newSession(property.id);
    const last = converse(CONTACT, start, property);
    expect(message(last)).toBe(fieldSpec("moveInDate").question);
  });

  it("answers a question with the model and then repeats the current question", () => {
    const last = converse(["How much is the deposit?"]);
    expect(last).toMatchObject({ kind: "ask_model", then: fieldSpec("fullName").question });
    expect(last.session.answers).toEqual({});
  });

  it("hands over to a person when the email cannot be read", () => {
    const last = converse(["Tom Smith", "hmm", "no idea", "x"]);
    expect(message(last)).toContain(agency.chat.humanContact.phone);
    expect(last.session.phase).toBe("closed");
  });

  it("restarts politely when the session has expired", () => {
    const last = restartTurn(newSession(), ctxFor());
    expect(message(last)).toBe(
      `Sorry, our chat timed out, so let us start again.\n\n${fieldSpec("fullName").question}`,
    );
  });
});

describe("confirming", () => {
  const confirming = converse(FULL).session;

  it("saves after a clear yes", () => {
    expect(turn(confirming, "yes").kind).toBe("save");
  });

  it("does not save after a vague reply", () => {
    const reply = turn(confirming, "hmm");
    expect(reply.kind).toBe("say");
    expect(message(reply)).toContain("is everything correct");
  });

  it("changes one detail and shows the summary again", () => {
    const asked = turn(confirming, "no");
    expect(message(asked)).toContain("Which detail");

    const email = turn(asked.session, "email");
    expect(message(email)).toBe(`Of course.\n\n${fieldSpec("email").question}`);

    const again = turn(email.session, "new.address@example.com");
    expect(again.session.phase).toBe("confirming");
    expect(message(again)).toContain("Email: new.address@example.com");
    expect(message(again)).toContain("Name: Tom Ford");
  });

  it("answers a question without confirming", () => {
    expect(turn(confirming, "Is the deposit refundable?")).toMatchObject({
      kind: "ask_model",
      then: "Is that all correct?",
    });
  });
});

describe("after the lead is saved", () => {
  const { session: saved, message: thanks } = afterSave(converse(FULL).session, agency);

  it("thanks the applicant by first name and offers more help", () => {
    expect(saved.phase).toBe("saved");
    expect(thanks).toContain("Thank you, Tom.");
    expect(thanks).toContain(agency.chat.humanContact.hours);
    expect(thanks.endsWith("Is there anything else I can help you with?")).toBe(true);
  });

  it("says goodbye and closes the chat when there is nothing else", () => {
    const last = turn(saved, "no thanks");
    expect(last.session.phase).toBe("closed");
    expect(message(last)).toContain("Goodbye");
  });

  it("answers further questions and asks again", () => {
    expect(turn(saved, "What happens next?")).toMatchObject({
      kind: "ask_model",
      then: "Is there anything else I can help you with?",
    });
  });

  it("does not go on once the chat has closed", () => {
    const closed = turn(saved, "bye").session;
    expect(message(turn(closed, "hello"))).toContain("This chat has ended");
  });
});

describe("quick replies", () => {
  it("offers Skip on optional questions only", () => {
    expect(replies(converse(["Tom Ford"]))).toEqual([]);
    expect(replies(converse(CONTACT.slice(0, 2)))).toEqual(["Skip"]);
  });

  it("offers the choices for a closed question", () => {
    expect(replies(converse(CONTACT))).toEqual(["Studio", "Flat", "House", "Room", "Skip"]);
  });

  it("offers yes or no after the summary", () => {
    expect(replies(converse(FULL))).toEqual(["Yes, that is correct", "Change something"]);
  });

  it("lists the details that can be changed", () => {
    const asked = turn(converse(FULL).session, "Change something");
    expect(replies(asked)).toContain("Move-in date");
    expect(replies(asked)).toContain("Email");
  });

  it("offers a way to finish once the lead is saved, and nothing after the goodbye", () => {
    const saved = afterSave(converse(FULL).session, agency);
    expect(saved.suggestions).toEqual(["No, thanks"]);
    expect(replies(turn(saved.session, "No, thanks"))).toEqual([]);
  });

  it("keeps the same replies when a question is answered by the model", () => {
    expect(replies(converse(["Tom Ford", "tom@example.com", "How much is the deposit?"]))).toEqual([
      "Skip",
    ]);
  });
});
