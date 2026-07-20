import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computePositionMetrics, computePortfolioTotals } from "@/lib/finance";
import { fetchLivePrices, lookupPrice } from "@/lib/prices";
import { fetchFxRates } from "@/lib/fx";
import { PositionForm } from "@/components/PositionForm";
import { DashboardBody } from "@/components/DashboardBody";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { UserMenu } from "@/components/UserMenu";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const positions = await prisma.position.findMany({
    where: { userId: session.user.id },
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

  const hasStaleData =
    fxResult.isStale || metrics.some((m) => m.livePrice.isStale);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--teal)]" />
          <span className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
            Portfolio Tracker
          </span>
          {hasStaleData && (
            <span className="ml-2 text-xs text-[color:var(--muted)]">
              Some data is stale or unavailable
            </span>
          )}
        </div>
        <UserMenu />
      </header>

      <PortfolioSummary
        totals={totals}
        positionCount={positions.length}
        fx={fxResult}
      />

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-6 shadow-xl backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold">Add position</h2>
        <PositionForm />
      </section>

      <DashboardBody metrics={metrics} />
    </main>
  );
}
