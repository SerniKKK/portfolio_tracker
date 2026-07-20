import type { Currency } from "@prisma/client";

// Hardcoded FX rates for Stage 2. Replaced with real NBP rates in Stage 3.
// All rates are expressed as: 1 unit of FROM = X PLN.
const HARDCODED_RATES_TO_PLN: Record<Currency, number> = {
  PLN: 1,
  EUR: 4.28,
  USD: 3.95,
};

export function getRateToPLN(from: Currency): number {
  return HARDCODED_RATES_TO_PLN[from];
}

export function convertToPLN(value: number, from: Currency): number {
  return value * HARDCODED_RATES_TO_PLN[from];
}

export function convertPLNTo(value: number, to: Currency): number {
  const rate = HARDCODED_RATES_TO_PLN[to];
  if (rate === 0) return 0;
  return value / rate;
}

export function convert(value: number, from: Currency, to: Currency): number {
  if (from === to) return value;
  return convertPLNTo(convertToPLN(value, from), to);
}
