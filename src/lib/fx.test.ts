import { describe, expect, it } from "vitest";
import type { FxRatesToPLN } from "./fx";
import { convert, convertPLNTo, convertToPLN } from "./fx";

const RATES: FxRatesToPLN = { PLN: 1, EUR: 4.28, USD: 3.95 };

describe("convertToPLN", () => {
  it("multiplies by the currency's PLN rate", () => {
    expect(convertToPLN(100, "USD", RATES)).toBeCloseTo(395, 10);
    expect(convertToPLN(100, "EUR", RATES)).toBeCloseTo(428, 10);
  });

  it("is identity for PLN", () => {
    expect(convertToPLN(123.45, "PLN", RATES)).toBe(123.45);
  });
});

describe("convertPLNTo", () => {
  it("divides by the target currency's PLN rate", () => {
    expect(convertPLNTo(395, "USD", RATES)).toBeCloseTo(100, 10);
  });

  it("guards against divide-by-zero", () => {
    expect(convertPLNTo(100, "USD", { PLN: 1, EUR: 4, USD: 0 })).toBe(0);
  });
});

describe("convert", () => {
  it("returns the value unchanged for same-currency conversion", () => {
    expect(convert(50, "EUR", "EUR", RATES)).toBe(50);
  });

  it("round-trips through PLN (USD -> EUR)", () => {
    // 100 USD -> PLN -> EUR
    const eur = convert(100, "USD", "EUR", RATES);
    expect(eur).toBeCloseTo((100 * 3.95) / 4.28, 10);
  });

  it("is reversible within floating-point tolerance", () => {
    const there = convert(100, "USD", "EUR", RATES);
    const back = convert(there, "EUR", "USD", RATES);
    expect(back).toBeCloseTo(100, 8);
  });
});
