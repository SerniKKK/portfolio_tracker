import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computePositionMetrics, computePortfolioTotals } from "@/lib/finance";
import { fetchLivePrices, lookupPrice } from "@/lib/prices";
import { fetchFxRates } from "@/lib/fx";
import { getSnapshotsForUser, upsertDailySnapshot } from "@/lib/snapshots";
import { AppHeader } from "@/components/AppHeader";
import { HeroSummary } from "@/components/HeroSummary";
import { DashboardBody } from "@/components/DashboardBody";
import { PortfolioHistoryChart } from "@/components/PortfolioHistoryChart";
import { MonteCarloSection } from "@/components/MonteCarloSection";
import { Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  const userId = session.user.id;

  const positions = await prisma.position.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const [priceMap, fxResult] = await Promise.all([
    fetchLivePrices(positions),
    fetchFxRates(),
  ]);

  const metrics = positions.map((p) =>
    computePositionMetrics(
      p,
      lookupPrice(p.ticker, p.purchaseCurrency, priceMap),
      fxResult.rates
    )
  );
  const totals = computePortfolioTotals(metrics);

  if (positions.length > 0) {
    await upsertDailySnapshot(
      userId,
      totals.totalValuePLN,
      totals.totalCostPLN
    );
  }

  const snapshots = await getSnapshotsForUser(userId);
  const historyData = snapshots.map((s) => ({
    date: s.date.toISOString(),
    totalValuePLN: s.totalValuePLN,
    totalCostPLN: s.totalCostPLN,
  }));

  return (
    <>
      <AppHeader fx={fxResult} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <HeroSummary
          totals={totals}
          positionCount={positions.length}
          fx={fxResult}
        />

        <section className="fade-up rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="section-label flex items-center gap-1.5">
              <Activity className="size-3" />
              Portfolio value history
            </div>
            <span className="text-[11px] text-[color:var(--muted)]">
              {historyData.length}{" "}
              {historyData.length === 1 ? "snapshot" : "snapshots"} · daily
            </span>
          </div>
          <PortfolioHistoryChart data={historyData} />
        </section>

        <DashboardBody metrics={metrics} />

        <MonteCarloSection initialValue={totals.totalValuePLN} />

        <footer className="mt-4 flex flex-col items-center gap-1 pb-4 text-center text-[10px] text-[color:var(--muted)]">
          <div>
            Data from CoinGecko, Finnhub, and NBP. Cached in the app database.
          </div>
          <div>Not investment advice.</div>
        </footer>
      </main>
    </>
  );
}
