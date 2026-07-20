import type { Currency } from "@prisma/client";

export type FxRatesToPLN = Record<Currency, number>;

// Static fallback used when NBP is unreachable so the app keeps rendering.
const FALLBACK_RATES: FxRatesToPLN = {
  PLN: 1,
  EUR: 4.28,
  USD: 3.95,
};

export async function fetchNbpRates(): Promise<FxRatesToPLN> {
  const res = await fetch(
    "https://api.nbp.pl/api/exchangerates/tables/A/?format=json",
    { next: { revalidate: 60 * 60 } }
  );
  if (!res.ok) throw new Error(`NBP request failed: ${res.status}`);

  const data = (await res.json()) as Array<{
    rates: Array<{ code: string; mid: number }>;
  }>;

  const rates = data[0]?.rates;
  if (!rates) throw new Error("Missing rates in NBP response");

  const eur = rates.find((r) => r.code === "EUR")?.mid;
  const usd = rates.find((r) => r.code === "USD")?.mid;
  if (typeof eur !== "number" || typeof usd !== "number") {
    throw new Error("Missing EUR/USD in NBP response");
  }

  return { PLN: 1, EUR: eur, USD: usd };
}

export async function fetchFxRatesWithFallback(): Promise<{
  rates: FxRatesToPLN;
  isFallback: boolean;
}> {
  try {
    const rates = await fetchNbpRates();
    return { rates, isFallback: false };
  } catch {
    return { rates: FALLBACK_RATES, isFallback: true };
  }
}
