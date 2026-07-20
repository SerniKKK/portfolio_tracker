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
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="card">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="section-title">Allocation</h2>
            <span className="text-[11px] text-[color:var(--muted)]">
              Share of total value
            </span>
          </div>
          <AllocationDonut metrics={metrics} />
        </div>

        <div className="card">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <div>
              <h2 className="section-title">Market view</h2>
              {selected ? (
                <div className="mt-0.5 text-sm">
                  <span className="font-medium">{selected.position.name}</span>
                  <span className="ml-2 text-[color:var(--muted)]">
                    {selected.position.ticker}
                  </span>
                </div>
              ) : (
                <div className="mt-0.5 text-xs text-[color:var(--muted)]">
                  Select a position below to load its chart
                </div>
              )}
            </div>
            <span className="text-right text-[10px] leading-tight text-[color:var(--muted)]">
              Real-time from TradingView.
              <br />
              Table prices cached 5-15 min.
            </span>
          </div>

          {tvSymbol ? (
            <MarketWidget symbol={tvSymbol} />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-[color:var(--border)] text-sm text-[color:var(--muted)]">
              No market chart for cash-only portfolios.
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="section-title">Positions</h2>
          <span className="text-[11px] text-[color:var(--muted)]">
            {metrics.length} {metrics.length === 1 ? "entry" : "entries"} · click
            a row to load its chart
          </span>
        </div>

        {metrics.length === 0 ? (
          <p className="text-sm text-[color:var(--muted)]">
            No positions yet. Use the button below to add your first one.
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
