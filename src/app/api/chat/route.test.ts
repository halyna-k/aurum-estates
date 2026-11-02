import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { ChatReply } from "@/types/chat";
import { POST } from "./route";

const SESSION_ID = "5f0f3a4e-2b8c-4a43-9a43-6f5c6e0d8f10";
const ACKNOWLEDGED = "2026-10-23T12:00:00.000Z";

beforeAll(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret-of-at-least-thirty-two-characters");
  vi.stubEnv("GROQ_API_KEY", "");
});

async function send(message: string, ip: string, extra: Record<string, unknown> = {}) {
  const request = new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({
      message,
      history: [],
      sessionId: SESSION_ID,
      privacyAcknowledgedAt: ACKNOWLEDGED,
      ...extra,
    }),
  });
  const response = await POST(request);
  return {
    status: response.status,
    body: (await response.json()) as ChatReply & { error?: string },
  };
}

/** Sends the messages in turn, passing the signed session back each time. */
async function converse(messages: string[], ip: string, extra: Record<string, unknown> = {}) {
  let token: string | undefined;
  let last = await send(messages[0], ip, extra);
  token = last.body.sessionToken;
  for (const message of messages.slice(1)) {
    last = await send(message, ip, { ...extra, sessionToken: token });
    token = last.body.sessionToken;
  }
  return last;
}

describe("POST /api/chat", () => {
  it("takes a lead from the first question to the goodbye", async () => {
    const ip = "10.0.0.1";
    const answers = [
      "Tom Ford",
      "tom@example.com",
      "07911 123456",
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

    const summary = await converse(answers, ip);
    expect(summary.body.message).toContain("Name: Tom Ford");
    expect(summary.body.message).toContain("Move-in date:");
    expect(summary.body.leadSaved).toBe(false);

    const saved = await send("yes", ip, { sessionToken: summary.body.sessionToken });
    expect(saved.status).toBe(200);
    expect(saved.body.leadSaved).toBe(true);
    expect(saved.body.closed).toBe(false);
    expect(saved.body.message).toContain("Thank you, Tom.");
    expect(saved.body.agentPreview?.qualification).toBe("conditional");

    const bye = await send("no thanks", ip, { sessionToken: saved.body.sessionToken });
    expect(bye.body.closed).toBe(true);
    expect(bye.body.message).toContain("Goodbye");
  });

  it("offers a Skip reply for the phone number", async () => {
    const { body } = await converse(["Tom Ford", "tom@example.com"], "10.0.0.9");
    expect(body.suggestions).toEqual(["Skip"]);
    const skipped = await send("Skip", "10.0.0.9", { sessionToken: body.sessionToken });
    expect(skipped.body.message).toContain("What type of property");
  });

  it("does not say the details are saved before the applicant confirms", async () => {
    const first = await converse(["Tom Ford", "tom@example.com"], "10.0.0.2");
    expect(first.body.leadSaved).toBe(false);
    expect(first.body.message).not.toMatch(/recorded|passed your details/i);
  });

  it("answers a question without the model by pointing to the team, then repeats the question", async () => {
    const { body } = await send("How much is the deposit?", "10.0.0.3");
    expect(body.message).toContain("020 7946 0123");
    expect(body.message.endsWith("May I take your full name, please?")).toBe(true);
  });

  it("starts again politely when the session token cannot be trusted", async () => {
    const { body } = await send("Tom Ford", "10.0.0.4", { sessionToken: "forged.token" });
    expect(body.message).toContain("timed out");
  });

  it("does not skip the property questions when no property is chosen, and skips them when one is", async () => {
    const withProperty = await converse(
      ["Tom Ford", "tom@example.com", "07911 123456"],
      "10.0.0.5",
      {
        propertyId: "brook-street-14",
      },
    );
    expect(withProperty.body.message).toBe("When would you like to move in?");

    const without = await converse(["Tom Ford", "tom@example.com", "07911 123456"], "10.0.0.6");
    expect(without.body.message).toContain("What type of property");
  });

  it("rejects a malformed request and a missing secret", async () => {
    const bad = await send("", "10.0.0.7");
    expect(bad.status).toBe(400);

    vi.stubEnv("SESSION_SECRET", "");
    const noSecret = await send("Tom Ford", "10.0.0.8");
    expect(noSecret.status).toBe(500);
    vi.stubEnv("SESSION_SECRET", "test-secret-of-at-least-thirty-two-characters");
  });
});
