import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("uses 2 decimals for values >= 1", () => {
    expect(formatPrice(64973, "USD")).toBe("$64,973.00");
    expect(formatPrice(1.45, "USD")).toBe("$1.45");
  });

  it("renders zero as $0.00", () => {
    expect(formatPrice(0, "USD")).toBe("$0.00");
  });

  it("keeps significant figures for sub-dollar values", () => {
    expect(formatPrice(0.0293, "USD")).toBe("$0.0293");
    expect(formatPrice(0.5, "USD")).toBe("$0.50");
  });

  it("does not collapse micro-cap prices to $0.00", () => {
    // PEPE ~ $0.00000293 — the bug this fixes.
    expect(formatPrice(0.00000293, "USD")).toBe("$0.00000293");
  });

  it("caps at 8 fraction digits", () => {
    const out = formatPrice(0.0000000001234, "USD");
    // beyond 8 decimals it rounds rather than growing unboundedly
    expect(out.replace(/[^0-9.]/g, "").split(".")[1].length).toBeLessThanOrEqual(8);
  });

  it("returns a dash for non-finite input", () => {
    expect(formatPrice(NaN, "USD")).toBe("-");
    expect(formatPrice(Infinity, "USD")).toBe("-");
  });
});
