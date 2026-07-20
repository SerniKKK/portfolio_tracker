import type { Currency } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CachedFxRow = { currency: Currency; rateToPLN: number; fetchedAt: Date };

export async function readFxCache(): Promise<Map<Currency, CachedFxRow>> {
  const rows = await prisma.fxRate.findMany();
  const out = new Map<Currency, CachedFxRow>();
  for (const row of rows) {
    out.set(row.currency, {
      currency: row.currency,
      rateToPLN: row.rateToPLN,
      fetchedAt: row.fetchedAt,
    });
  }
  return out;
}

export async function writeFxCache(
  entries: Array<{ currency: Currency; rateToPLN: number }>
): Promise<void> {
  if (entries.length === 0) return;
  const now = new Date();
  await Promise.all(
    entries.map((e) =>
      prisma.fxRate.upsert({
        where: { currency: e.currency },
        create: {
          currency: e.currency,
          rateToPLN: e.rateToPLN,
          fetchedAt: now,
        },
        update: { rateToPLN: e.rateToPLN, fetchedAt: now },
      })
    )
  );
}
