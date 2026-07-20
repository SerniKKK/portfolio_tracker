import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchLivePrices, lookupPrice } from "@/lib/prices";
import { fetchFxRates } from "@/lib/fx";
import {
  computePositionMetrics,
  computePortfolioTotals,
} from "@/lib/finance";
import { upsertDailySnapshot } from "@/lib/snapshots";

// Vercel Cron hits this daily. Iterates all users, computes totals via the
// same code path as the SSR page, and upserts today's snapshot per user.
// The DB-backed price/FX cache means this makes at most one API call per
// distinct ticker across the whole cron run.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  const fx = await fetchFxRates();

  const results: Array<{ userId: string; snapshot: boolean; positions: number }> = [];

  for (const user of users) {
    const positions = await prisma.position.findMany({
      where: { userId: user.id },
    });
    if (positions.length === 0) {
      results.push({ userId: user.id, snapshot: false, positions: 0 });
      continue;
    }

    const priceMap = await fetchLivePrices(positions);
    const metrics = positions.map((p) =>
      computePositionMetrics(
        p,
        lookupPrice(p.ticker, p.purchaseCurrency, priceMap),
        fx.rates
      )
    );
    const totals = computePortfolioTotals(metrics);

    await upsertDailySnapshot(
      user.id,
      totals.totalValuePLN,
      totals.totalCostPLN
    );
    results.push({
      userId: user.id,
      snapshot: true,
      positions: positions.length,
    });
  }

  return NextResponse.json({
    users: users.length,
    processed: results.length,
    snapshots: results.filter((r) => r.snapshot).length,
    results,
  });
}
