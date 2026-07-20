import type { Currency } from "@prisma/client";

// Hardcoded prices for Stage 1. Replaced with real API calls in Stage 3.
// Ticker keys are uppercased; cash tickers always return 1 in their own currency.
const HARDCODED: Record<string, { price: number; currency: Currency }> = {
  AAPL: { price: 195.5, currency: "USD" },
  MSFT: { price: 415.2, currency: "USD" },
  CDR: { price: 118.4, currency: "PLN" },
  PKN: { price: 62.8, currency: "PLN" },
  VWCE: { price: 122.9, currency: "EUR" },
  BTC: { price: 68000, currency: "USD" },
  ETH: { price: 3500, currency: "USD" },
  SOL: { price: 155, currency: "USD" },
};

export type LivePrice = {
  price: number;
  currency: Currency;
  isFallback: boolean;
};

export function getLivePrice(
  ticker: string,
  purchaseCurrency: Currency
): LivePrice {
  const key = ticker.toUpperCase();

  if (key === "PLN" || key === "EUR" || key === "USD") {
    return { price: 1, currency: key as Currency, isFallback: false };
  }

  const hit = HARDCODED[key];
  if (hit) {
    return { ...hit, isFallback: false };
  }

  // Unknown ticker: fall back to purchase price treated as current price
  // so the UI does not explode. Stage 3 replaces this with real fetches.
  return { price: 0, currency: purchaseCurrency, isFallback: true };
}
