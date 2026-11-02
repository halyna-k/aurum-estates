import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/agency/properties";
import { maxDeposit } from "../property";

describe("maxDeposit", () => {
  it("allows five weeks of rent below £50,000 a year", () => {
    expect(maxDeposit(3200)).toBe(3692);
    expect(maxDeposit(4166)).toBe(4806);
  });

  it("allows six weeks of rent from £50,000 a year", () => {
    expect(maxDeposit(4167)).toBe(5769);
    expect(maxDeposit(6500)).toBe(9000);
  });
});

describe("demo properties", () => {
  it.each(PROPERTIES)("$id keeps its deposit within the legal cap", (property) => {
    expect(property.deposit).toBeLessThanOrEqual(maxDeposit(property.rentPcm));
  });
});
