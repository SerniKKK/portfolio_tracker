"use client";

import { useMemo, useState } from "react";
import type { PositionMetrics } from "@/lib/finance";
import { AllocationDonut } from "./AllocationDonut";
import { MarketWidget } from "./MarketWidget";
import { PositionsTable } from "./PositionsTable";
import { toTradingViewSymbol } from "@/lib/tradingview";

export function DashboardBody({ metrics }: { metrics: PositionMetrics[] }) {
  const marketable = useMemo(
    () => metrics.filter((m) => m.position.assetType !== "CASH"),
    [metrics]
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    marketable[0]?.position.id ?? null
  );

  const selected =
    marketable.find((m) => m.position.id === selectedId) ?? marketable[0];
  const tvSymbol = selected
    ? toTradingViewSymbol(selected.position.ticker, selected.position.assetType)
    : null;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-6 shadow-xl backdrop-blur">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Allocation</h2>
            <span className="text-xs text-[color:var(--muted)]">
              Share of total value
            </span>
          </div>
          <AllocationDonut metrics={metrics} />
        </section>

        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-6 shadow-xl backdrop-blur">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Market view</h2>
              {selected && (
                <div className="text-xs text-[color:var(--muted)]">
                  {selected.position.name} · {selected.position.ticker}
                </div>
              )}
            </div>
            <span className="text-right text-[10px] text-[color:var(--muted)]">
              Widget shows real-time TradingView data.
              <br />
              Table prices are cached (5-15 min).
            </span>
          </div>

          {tvSymbol ? (
            <MarketWidget symbol={tvSymbol} />
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-sm text-[color:var(--muted)]">
              Select a stock, ETF or crypto position to see a market chart.
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-6 shadow-xl backdrop-blur">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Positions</h2>
          <span className="text-xs text-[color:var(--muted)]">
            {metrics.length} {metrics.length === 1 ? "entry" : "entries"} · click a
            row to load its market chart
          </span>
        </div>

        {metrics.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">
            No positions yet. Add your first one above.
          </p>
        ) : (
          <PositionsTable
            metrics={metrics}
            selectedId={selected?.position.id ?? null}
            onSelect={(id) => setSelectedId(id)}
          />
        )}
      </section>
    </>
  );
}
