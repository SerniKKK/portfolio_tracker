import type { Position, Currency } from "@prisma/client";
import { fetchCryptoPricesUSD } from "./prices/coingecko";
import { fetchStockQuotes } from "./prices/finnhub";

export type LivePrice = {
  price: number;
  currency: Currency;
  isFallback: boolean;
};

export type LivePriceMap = Map<string, LivePrice>;

const CASH_TICKERS = new Set<Currency>(["PLN", "EUR", "USD"]);

export async function fetchLivePrices(
  positions: Position[]
): Promise<LivePriceMap> {
  const cryptoTickers = positions
    .filter((p) => p.assetType === "CRYPTO")
    .map((p) => p.ticker);
  const stockTickers = positions
    .filter((p) => p.assetType === "STOCK" || p.assetType === "ETF")
    .map((p) => p.ticker);

  const [cryptoRes, stockRes] = await Promise.allSettled([
    cryptoTickers.length > 0 ? fetchCryptoPricesUSD(cryptoTickers) : Promise.resolve(new Map()),
    stockTickers.length > 0 ? fetchStockQuotes(stockTickers) : Promise.resolve(new Map()),
  ]);

  const result: LivePriceMap = new Map();

  for (const p of positions) {
    if (p.assetType !== "CASH") continue;
    const key = p.ticker.toUpperCase() as Currency;
    if (CASH_TICKERS.has(key)) {
      result.set(key, { price: 1, currency: key, isFallback: false });
    }
  }

  if (cryptoRes.status === "fulfilled") {
    for (const [ticker, price] of cryptoRes.value) {
      result.set(ticker.toUpperCase(), {
        price,
        currency: "USD",
        isFallback: false,
      });
    }
  }

  if (stockRes.status === "fulfilled") {
    for (const [symbol, quote] of stockRes.value) {
      result.set(symbol.toUpperCase(), { ...quote, isFallback: false });
    }
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
  return { price: 0, currency: purchaseCurrency, isFallback: true };
}
