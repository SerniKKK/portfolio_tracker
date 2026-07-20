import type { Currency } from "@prisma/client";

export type FxRatesToPLN = Record<Currency, number>;

export async function fetchNbpRates(): Promise<FxRatesToPLN> {
  const res = await fetch(
    "https://api.nbp.pl/api/exchangerates/tables/A/?format=json",
    { cache: "no-store" }
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
