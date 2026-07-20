import type { Currency } from "@prisma/client";
import type { FxRatesToPLN } from "./fx/nbp";

export type { FxRatesToPLN } from "./fx/nbp";
export { fetchNbpRates, fetchFxRatesWithFallback } from "./fx/nbp";

export function convertToPLN(
  value: number,
  from: Currency,
  rates: FxRatesToPLN
): number {
  return value * rates[from];
}

export function convertPLNTo(
  value: number,
  to: Currency,
  rates: FxRatesToPLN
): number {
  const rate = rates[to];
  if (rate === 0) return 0;
  return value / rate;
}

export function convert(
  value: number,
  from: Currency,
  to: Currency,
  rates: FxRatesToPLN
): number {
  if (from === to) return value;
  return convertPLNTo(convertToPLN(value, from, rates), to, rates);
}
