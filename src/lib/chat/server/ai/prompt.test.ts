import { describe, expect, it } from "vitest";
import { agency } from "@/agency/config";
import { PROPERTIES } from "@/agency/properties";
import { buildFaqPrompt } from "./prompt";

const prompt = buildFaqPrompt(agency, PROPERTIES, "Friday 23 October 2026 (2026-10-23)");

describe("buildFaqPrompt", () => {
  it("names the assistant, the agency and the contact details", () => {
    expect(prompt).toContain("You are Aura");
    expect(prompt).toContain("Aurum Estates");
    expect(prompt).toContain(agency.chat.humanContact.phone);
  });

  it("lists every property with its rent", () => {
    for (const property of PROPERTIES) expect(prompt).toContain(property.address);
    expect(prompt).toContain("£6,500 a month");
  });

  it("forbids asking questions and confirming viewings", () => {
    expect(prompt).toContain("Do not ask any question");
    expect(prompt).toContain("You cannot book or confirm a viewing");
  });

  it("stays well inside the free-tier token limit", () => {
    // About four characters per token: the old prompt was around 2,500 tokens.
    expect(prompt.length).toBeLessThan(5000);
  });
});
