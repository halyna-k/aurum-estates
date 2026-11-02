/** Server only: decides what the assistant says next. Pure, so it is easy to test. */
import type { AgencyConfig } from "@/types/agency";
import type { Property } from "@/types/property";
import { fieldSpec } from "@/lib/chat/server/answers/fields";
import { isFinished, looksLikeQuestion, parseConfirmation } from "./intent";
import {
  type Context,
  type Session,
  applyAnswer,
  isSkipped,
  nextField,
  reopenField,
} from "./session";
import { buildSummary, summaryFields } from "./summary";

export type Turn =
  | { kind: "say"; session: Session; message: string; suggestions: string[] }
  /** The model answers the applicant's question, then `then` is added. */
  | { kind: "ask_model"; session: Session; then: string; suggestions: string[] }
  /** The applicant confirmed. The caller saves the lead, then calls afterSave. */
  | { kind: "save"; session: Session };

interface TurnInput {
  session: Session;
  text: string;
  ctx: Context;
  agency: AgencyConfig;
  property?: Property;
  now: Date;
}

const ANYTHING_ELSE = "Is there anything else I can help you with?";
const CONFIRM_QUESTION = "Is that all correct?";

export const SKIP = "Skip";
export const CONFIRM_REPLIES = ["Yes, that is correct", "Change something"];
export const NO_THANKS = "No, thanks";

const LEAD_IN = {
  accepted: "",
  declined: "That is fine.",
  skipped: "No problem, let us move on.",
} as const;

/** Quick replies that fit the question the applicant is about to answer. */
function repliesFor(session: Session, ctx: Context): string[] {
  switch (session.phase) {
    case "collecting": {
      const field = nextField(session, ctx);
      if (!field) return [];
      const spec = fieldSpec(field);
      return [...(spec.choices ?? []), ...(spec.required ? [] : [SKIP])];
    }
    case "confirming":
      return CONFIRM_REPLIES;
    case "saved":
      return [NO_THANKS];
    case "closed":
      return [];
  }
}

function say(session: Session, suggestions: string[], ...parts: string[]): Turn {
  return { kind: "say", session, suggestions, message: parts.filter(Boolean).join("\n\n") };
}

function askModel(session: Session, ctx: Context, then: string): Turn {
  return { kind: "ask_model", session, then, suggestions: repliesFor(session, ctx) };
}

function handover(agency: AgencyConfig): string {
  const { phone, email, hours } = agency.chat.humanContact;
  return `I am sorry, I am having trouble with that. Please contact the team on ${phone} or at ${email} (${hours}), and they will be happy to help.`;
}

function toConfirming(input: TurnInput, session: Session, leadIn = ""): Turn {
  const summary = `Thank you. Here is what I have:\n${buildSummary(session, input.ctx, input.property)}`;
  return say(
    { ...session, phase: "confirming" },
    CONFIRM_REPLIES,
    leadIn,
    summary,
    CONFIRM_QUESTION,
  );
}

function advance(input: TurnInput, session: Session, leadIn = ""): Turn {
  const upcoming = nextField(session, input.ctx);
  return upcoming
    ? say(session, repliesFor(session, input.ctx), leadIn, fieldSpec(upcoming).question)
    : toConfirming(input, session, leadIn);
}

function collect(input: TurnInput): Turn {
  const { session, text, ctx, agency, now } = input;
  const field = nextField(session, ctx);
  if (!field) return toConfirming(input, session);

  if (looksLikeQuestion(text)) return askModel(session, ctx, fieldSpec(field).question);

  const { session: next, outcome } = applyAnswer(session, field, text, now);
  if (outcome.kind === "retry") return say(next, repliesFor(next, ctx), outcome.message);
  if (outcome.kind === "handover") return say(next, [], handover(agency));
  return advance(input, next, LEAD_IN[outcome.kind]);
}

function confirm(input: TurnInput): Turn {
  const { session, text, ctx } = input;
  const answer = parseConfirmation(text);

  switch (answer.kind) {
    case "yes":
      return { kind: "save", session };
    case "no":
      return say(
        session,
        summaryFields(session, ctx).map((key) => fieldSpec(key).label),
        "No problem. Which detail would you like to change?",
      );
    case "change":
      if (isSkipped(session, answer.field, ctx)) {
        return say(
          session,
          CONFIRM_REPLIES,
          "I do not need to ask about that one. Is the rest correct, or would you like to change anything else?",
        );
      }
      return advance(input, reopenField(session, answer.field), "Of course.");
    case "unclear":
      return looksLikeQuestion(text)
        ? askModel(session, ctx, CONFIRM_QUESTION)
        : say(
            session,
            CONFIRM_REPLIES,
            "Sorry, is everything correct: yes or no? Or tell me which detail to change.",
          );
  }
}

function afterConfirmation(input: TurnInput): Turn {
  const { session, text, ctx, agency } = input;
  if (isFinished(text)) {
    return say(
      { ...session, phase: "closed" },
      [],
      `You are very welcome. Thank you for contacting ${agency.brand.name}. Goodbye.`,
    );
  }
  return askModel(session, ctx, ANYTHING_ELSE);
}

export function takeTurn(input: TurnInput): Turn {
  switch (input.session.phase) {
    case "collecting":
      return collect(input);
    case "confirming":
      return confirm(input);
    case "saved":
      return afterConfirmation(input);
    case "closed":
      return say(
        input.session,
        [],
        "This chat has ended. Please start a new chat if you need anything else.",
      );
  }
}

/** Used when the sealed session has expired or cannot be trusted. */
export function restartTurn(session: Session, ctx: Context): Turn {
  const first = nextField(session, ctx);
  return say(
    session,
    repliesFor(session, ctx),
    "Sorry, our chat timed out, so let us start again.",
    first ? fieldSpec(first).question : "",
  );
}

/** The message that follows a successful save. */
export function afterSave(session: Session, agency: AgencyConfig) {
  const firstName = session.answers.fullName?.split(" ")[0];
  const thanks = firstName ? `Thank you, ${firstName}.` : "Thank you.";
  return {
    session: { ...session, phase: "saved" as const },
    suggestions: [NO_THANKS],
    message: [
      `${thanks} I have passed your details to the team, and an agent will contact you during working hours (${agency.chat.humanContact.hours}).`,
      ANYTHING_ELSE,
    ].join("\n\n"),
  };
}
