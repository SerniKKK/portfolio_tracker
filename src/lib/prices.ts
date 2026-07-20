import type { Position, Currency } from "@prisma/client";
import { fetchCryptoPricesUSD } from "./prices/coingecko";
import { fetchStockQuotes } from "./prices/finnhub";
import { readPriceCache, writePriceCache } from "./cache/prices";
import { CRYPTO_TTL_MS, STOCK_TTL_MS, isStale } from "./cache/ttl";

export type LivePrice = {
  price: number;
  currency: Currency;
  fetchedAt: Date | null;
  isStale: boolean;
  isFallback: boolean;
};

export type LivePriceMap = Map<string, LivePrice>;

const CASH_TICKERS = new Set<Currency>(["PLN", "EUR", "USD"]);

export async function fetchLivePrices(
  positions: Position[]
): Promise<LivePriceMap> {
  const cryptoTickers = positions
    .filter((p) => p.assetType === "CRYPTO")
    .map((p) => p.ticker.toUpperCase());
  const stockTickers = positions
    .filter((p) => p.assetType === "STOCK" || p.assetType === "ETF")
    .map((p) => p.ticker.toUpperCase());

  const cached = await readPriceCache([...cryptoTickers, ...stockTickers]);

  const cryptoToFetch = [...new Set(cryptoTickers)].filter((t) =>
    isStale(cached.get(t)?.fetchedAt, CRYPTO_TTL_MS)
  );
  const stocksToFetch = [...new Set(stockTickers)].filter((t) =>
    isStale(cached.get(t)?.fetchedAt, STOCK_TTL_MS)
  );

  const [cryptoRes, stocksRes] = await Promise.allSettled([
    cryptoToFetch.length > 0
      ? fetchCryptoPricesUSD(cryptoToFetch)
      : Promise.resolve(new Map<string, number>()),
    stocksToFetch.length > 0
      ? fetchStockQuotes(stocksToFetch)
      : Promise.resolve(new Map<string, { price: number; currency: Currency }>()),
  ]);

  const freshWrites: Array<{ ticker: string; price: number; currency: Currency }> = [];
  const now = new Date();

  if (cryptoRes.status === "fulfilled") {
    for (const [ticker, price] of cryptoRes.value) {
      freshWrites.push({ ticker, price, currency: "USD" });
      cached.set(ticker, { price, currency: "USD", fetchedAt: now });
    }
  }
  if (stocksRes.status === "fulfilled") {
    for (const [ticker, quote] of stocksRes.value) {
      freshWrites.push({ ticker, price: quote.price, currency: quote.currency });
      cached.set(ticker, { ...quote, fetchedAt: now });
    }
  }

  if (freshWrites.length > 0) {
    await writePriceCache(freshWrites);
  }

  const result: LivePriceMap = new Map();

  for (const p of positions) {
    if (p.assetType !== "CASH") continue;
    const key = p.ticker.toUpperCase() as Currency;
    if (CASH_TICKERS.has(key)) {
      result.set(key, {
        price: 1,
        currency: key,
        fetchedAt: now,
        isStale: false,
        isFallback: false,
      });
    }
  }

  const ttlForType = (t: string) =>
    t === "CRYPTO" ? CRYPTO_TTL_MS : STOCK_TTL_MS;

  for (const p of positions) {
    if (p.assetType === "CASH") continue;
    const key = p.ticker.toUpperCase();
    const c = cached.get(key);
    if (!c) {
      result.set(key, {
        price: 0,
        currency: p.purchaseCurrency,
        fetchedAt: null,
        isStale: true,
        isFallback: true,
      });
      continue;
    }
    result.set(key, {
      price: c.price,
      currency: c.currency,
      fetchedAt: c.fetchedAt,
      isStale: isStale(c.fetchedAt, ttlForType(p.assetType)),
      isFallback: false,
    });
  }

  return result;
}

export function lookupPrice(
  ticker: string,
  purchaseCurrency: Currency,
  map: LivePriceMap
): LivePrice {
  const hit = map.get(ticker.toUpperCase());
  if (hit) return hit;
  return {
    price: 0,
    currency: purchaseCurrency,
    fetchedAt: null,
    isStale: true,
    isFallback: true,
  };
}
