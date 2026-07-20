import type { Currency } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CachedPriceRow = {
  price: number;
  currency: Currency;
  fetchedAt: Date;
};

export async function readPriceCache(
  tickers: string[]
): Promise<Map<string, CachedPriceRow>> {
  const upper = [...new Set(tickers.map((t) => t.toUpperCase()))];
  if (upper.length === 0) return new Map();

  const rows = await prisma.priceCache.findMany({
    where: { ticker: { in: upper } },
  });

  const out = new Map<string, CachedPriceRow>();
  for (const row of rows) {
    out.set(row.ticker, {
      price: row.price,
      currency: row.currency,
      fetchedAt: row.fetchedAt,
    });
  }
  return out;
}

export async function writePriceCache(
  entries: Array<{ ticker: string; price: number; currency: Currency }>
): Promise<void> {
  if (entries.length === 0) return;
  const now = new Date();

  await Promise.all(
    entries.map((e) =>
      prisma.priceCache.upsert({
        where: {
          ticker_currency: {
            ticker: e.ticker.toUpperCase(),
            currency: e.currency,
          },
        },
        create: {
          ticker: e.ticker.toUpperCase(),
          currency: e.currency,
          price: e.price,
          fetchedAt: now,
        },
        update: { price: e.price, fetchedAt: now },
      })
    )
  );
}
