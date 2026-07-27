import { describe, expect, it } from "vitest";
import type { Position } from "@prisma/client";
import type { LivePrice } from "./prices";
import type { FxRatesToPLN } from "./fx";
import { computePositionMetrics, computePortfolioTotals } from "./finance";

const RATES: FxRatesToPLN = { PLN: 1, EUR: 4, USD: 5 };

function position(overrides: Partial<Position>): Position {
  return {
    id: "p1",
    userId: "u1",
    ticker: "AAPL",
    name: "Apple Inc",
    assetType: "STOCK",
    quantity: 10,
    purchasePrice: 100,
    purchaseCurrency: "USD",
    purchaseDate: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  } as Position;
}

function price(overrides: Partial<LivePrice>): LivePrice {
  return {
    price: 150,
    currency: "USD",
    fetchedAt: new Date(),
    isStale: false,
    isFallback: false,
    ...overrides,
  };
}

describe("computePositionMetrics", () => {
  it("converts native value and cost to PLN and computes P/L", () => {
    const m = computePositionMetrics(
      position({ quantity: 10, purchasePrice: 100, purchaseCurrency: "USD" }),
      price({ price: 150, currency: "USD" }),
      RATES
    );

    expect(m.currentValueNative).toBe(1500);
    expect(m.costNative).toBe(1000);
    // USD rate is 5 -> value 7500 PLN, cost 5000 PLN
    expect(m.currentValuePLN).toBe(7500);
    expect(m.costPLN).toBe(5000);
    expect(m.pnlPLN).toBe(2500);
    expect(m.pnlPct).toBeCloseTo(0.5, 10);
  });

  it("handles a loss (negative P/L)", () => {
    const m = computePositionMetrics(
      position({ quantity: 2, purchasePrice: 200, purchaseCurrency: "USD" }),
      price({ price: 150, currency: "USD" }),
      RATES
    );
    expect(m.pnlPLN).toBeLessThan(0);
    expect(m.pnlPct).toBeCloseTo(-0.25, 10);
  });

  it("mixes purchase currency and price currency independently", () => {
    // Bought in EUR, quoted in USD.
    const m = computePositionMetrics(
      position({ quantity: 1, purchasePrice: 100, purchaseCurrency: "EUR" }),
      price({ price: 100, currency: "USD" }),
      RATES
    );
    expect(m.costPLN).toBe(400); // 100 EUR * 4
    expect(m.currentValuePLN).toBe(500); // 100 USD * 5
  });

  it("returns 0 pnlPct when cost basis is zero", () => {
    const m = computePositionMetrics(
      position({ quantity: 100, purchasePrice: 0, purchaseCurrency: "PLN" }),
      price({ price: 1, currency: "PLN" }),
      RATES
    );
    expect(m.costPLN).toBe(0);
    expect(m.pnlPct).toBe(0);
  });
});

describe("computePortfolioTotals", () => {
  it("aggregates value, cost, P/L and groups by asset type", () => {
    const stock = computePositionMetrics(
      position({ assetType: "STOCK", quantity: 10, purchasePrice: 100, purchaseCurrency: "USD" }),
      price({ price: 150, currency: "USD" }),
      RATES
    );
    const crypto = computePositionMetrics(
      position({ id: "p2", assetType: "CRYPTO", quantity: 1, purchasePrice: 1000, purchaseCurrency: "USD" }),
      price({ price: 2000, currency: "USD" }),
      RATES
    );

    const totals = computePortfolioTotals([stock, crypto]);

    expect(totals.totalValuePLN).toBe(7500 + 10000);
    expect(totals.totalCostPLN).toBe(5000 + 5000);
    expect(totals.totalPnlPLN).toBe(7500);
    expect(totals.totalPnlPct).toBeCloseTo(7500 / 10000, 10);
    expect(totals.byAssetType.STOCK).toBe(7500);
    expect(totals.byAssetType.CRYPTO).toBe(10000);
  });

  it("returns zeroed totals for an empty portfolio", () => {
    const totals = computePortfolioTotals([]);
    expect(totals.totalValuePLN).toBe(0);
    expect(totals.totalCostPLN).toBe(0);
    expect(totals.totalPnlPLN).toBe(0);
    expect(totals.totalPnlPct).toBe(0);
    expect(totals.byAssetType).toEqual({});
  });
});
