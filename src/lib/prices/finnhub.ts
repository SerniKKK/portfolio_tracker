import type { Currency } from "@prisma/client";

type FinnhubQuote = {
  c: number;
  d: number | null;
  dp: number | null;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
};

export type StockQuote = { price: number; currency: Currency };

// Finnhub returns the numeric price only. Currency is inferred from the
// exchange suffix used in the symbol. Extend as more markets are added.
function currencyForSymbol(symbol: string): Currency {
  const upper = symbol.toUpperCase();
  if (upper.endsWith(".WA")) return "PLN";
  if (upper.endsWith(".DE") || upper.endsWith(".PA") || upper.endsWith(".AS"))
    return "EUR";
  return "USD";
}

export async function fetchStockQuotes(
  symbols: string[]
): Promise<Map<string, StockQuote>> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) throw new Error("FINNHUB_API_KEY is not set");

  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const results = await Promise.all(
    unique.map(async (symbol): Promise<[string, StockQuote] | null> => {
      try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
          symbol
        )}&token=${apiKey}`;
        const res = await fetch(url, { next: { revalidate: 900 } });
        if (!res.ok) return null;
        const data = (await res.json()) as FinnhubQuote;
        if (!data.c || data.c === 0) return null;
        return [
          symbol,
          { price: data.c, currency: currencyForSymbol(symbol) },
        ];
      } catch {
        return null;
      }
    })
  );

  const out = new Map<string, StockQuote>();
  for (const r of results) {
    if (r) out.set(r[0], r[1]);
  }
  return out;
}
