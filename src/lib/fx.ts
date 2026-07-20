import type { Currency } from "@prisma/client";
import { fetchNbpRates } from "./fx/nbp";
import { readFxCache, writeFxCache } from "./cache/fx";
import { FX_TTL_MS, isStale } from "./cache/ttl";

export type FxRatesToPLN = Record<Currency, number>;

export type FxResult = {
  rates: FxRatesToPLN;
  fetchedAt: Date | null;
  isStale: boolean;
  isFallback: boolean;
};

// Absolute last resort when both API and DB cache are empty (fresh install).
const HARDCODED_FALLBACK: FxRatesToPLN = {
  PLN: 1,
  EUR: 4.28,
  USD: 3.95,
};

export async function fetchFxRates(): Promise<FxResult> {
  const cache = await readFxCache();
  const eurCached = cache.get("EUR");
  const usdCached = cache.get("USD");

  const eurFresh = eurCached && !isStale(eurCached.fetchedAt, FX_TTL_MS);
  const usdFresh = usdCached && !isStale(usdCached.fetchedAt, FX_TTL_MS);

  if (eurFresh && usdFresh && eurCached && usdCached) {
    const oldest =
      eurCached.fetchedAt < usdCached.fetchedAt
        ? eurCached.fetchedAt
        : usdCached.fetchedAt;
    return {
      rates: { PLN: 1, EUR: eurCached.rateToPLN, USD: usdCached.rateToPLN },
      fetchedAt: oldest,
      isStale: false,
      isFallback: false,
    };
  }

  try {
    const live = await fetchNbpRates();
    await writeFxCache([
      { currency: "EUR", rateToPLN: live.EUR },
      { currency: "USD", rateToPLN: live.USD },
    ]);
    return {
      rates: live,
      fetchedAt: new Date(),
      isStale: false,
      isFallback: false,
    };
  } catch {
    if (eurCached && usdCached) {
      const oldest =
        eurCached.fetchedAt < usdCached.fetchedAt
          ? eurCached.fetchedAt
          : usdCached.fetchedAt;
      return {
        rates: { PLN: 1, EUR: eurCached.rateToPLN, USD: usdCached.rateToPLN },
        fetchedAt: oldest,
        isStale: true,
        isFallback: false,
      };
    }
    return {
      rates: HARDCODED_FALLBACK,
      fetchedAt: null,
      isStale: true,
      isFallback: true,
    };
  }
}

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
