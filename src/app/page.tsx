import { prisma } from "@/lib/prisma";
import { computePositionMetrics, computePortfolioTotals } from "@/lib/finance";
import { PositionForm } from "@/components/PositionForm";
import { PositionsTable } from "@/components/PositionsTable";
import { PortfolioSummary } from "@/components/PortfolioSummary";

export const dynamic = "force-dynamic";

export default async function Home() {
  const positions = await prisma.position.findMany({
    orderBy: { createdAt: "desc" },
  });

  const metrics = positions.map(computePositionMetrics);
  const totals = computePortfolioTotals(metrics);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--teal)]" />
          <span className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
            Portfolio Tracker
          </span>
        </div>
        <span className="text-xs text-[color:var(--muted)]">
          Stage 2 · prices and FX are still placeholders
        </span>
      </header>

      <PortfolioSummary totals={totals} positionCount={positions.length} />

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-6 shadow-xl backdrop-blur">
        <h2 className="mb-4 text-lg font-semibold">Add position</h2>
        <PositionForm />
      </section>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-6 shadow-xl backdrop-blur">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Positions</h2>
          <span className="text-xs text-[color:var(--muted)]">
            {positions.length} {positions.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {positions.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">
            No positions yet. Add your first one above.
          </p>
        ) : (
          <PositionsTable metrics={metrics} />
        )}
      </section>
    </main>
  );
}
