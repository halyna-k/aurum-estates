import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/agency/properties";
import { type Context, type Session, newSession } from "./session";
import { buildSummary } from "./summary";

const ctx: Context = { incomeToAnnualRent: 2.5 };

function sessionWith(patch: Partial<Session>): Session {
  return { ...newSession(), ...patch };
}

describe("buildSummary", () => {
  it("lists the details in question order with British dates, money and phone numbers", () => {
    const summary = buildSummary(
      sessionWith({
        answers: {
          fullName: "Tom Ford",
          email: "tom@example.com",
          phone: "+447911123456",
          propertyType: "studio",
          bedrooms: 0,
          budget: 2500,
          area: "Chelsea",
          moveInDate: "2026-11-15",
          employmentStatus: "self_employed",
          annualIncome: 0,
          hasGuarantor: false,
          occupants: 2,
          hasPets: true,
          viewingPreference: "Weekends",
        },
      }),
      ctx,
    );

    expect(summary.split("\n")).toEqual([
      "Name: Tom Ford",
      "Email: tom@example.com",
      "Phone: 07911 123456",
      "Property type: Studio",
      "Bedrooms: Studio",
      "Budget: £2,500 a month",
      "Area: Chelsea",
      "Move-in date: 15 Nov 2026",
      "Employment: Self-employed",
      "Income: £0 a year",
      "Guarantor: No",
      "People: 2",
      "Pets: Yes",
      "Viewing: Weekends",
    ]);
  });

  it("says when a detail was not given, so the applicant can see what is missing", () => {
    const summary = buildSummary(
      sessionWith({
        answers: { fullName: "Tom Ford", email: "tom@example.com" },
        declined: ["phone", "occupants"],
      }),
      ctx,
    );

    expect(summary).toContain("Phone: Not given");
    expect(summary).toContain("People: Not given");
  });

  it("names the property and leaves out what it already tells us", () => {
    const property = PROPERTIES[0];
    const summary = buildSummary(
      sessionWith({
        answers: { fullName: "Tom Ford", email: "tom@example.com", propertyId: property.id },
      }),
      { ...ctx, propertyRentPcm: property.rentPcm },
      property,
    );

    expect(summary.split("\n").slice(0, 4)).toEqual([
      "Name: Tom Ford",
      "Email: tom@example.com",
      "Phone: Not given",
      `Property: ${property.address}`,
    ]);
    expect(summary).not.toContain("Bedrooms");
    expect(summary).not.toContain("Budget");
  });

  it("leaves out the guarantor when income covers the rent", () => {
    const summary = buildSummary(
      sessionWith({
        answers: {
          fullName: "Tom Ford",
          email: "tom@example.com",
          budget: 2000,
          annualIncome: 80000,
        },
      }),
      ctx,
    );
    expect(summary).not.toContain("Guarantor");
  });
});
