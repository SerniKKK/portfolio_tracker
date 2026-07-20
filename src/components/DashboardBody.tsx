"use client";

import { useMemo, useState } from "react";
import type { PositionMetrics } from "@/lib/finance";
import { AllocationDonut } from "./AllocationDonut";
import { MarketWidget } from "./MarketWidget";
import { PositionsTable } from "./PositionsTable";
import { AddPositionButton } from "./AddPositionCard";
import { toTradingViewSymbol } from "@/lib/tradingview";
import { PieChart, LineChart, Wallet2 } from "lucide-react";

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
      <section className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="fade-up-delay-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <SectionHeader icon={PieChart} title="Allocation" hint="Share of total value" />
          <AllocationDonut metrics={metrics} />
        </div>

        <div className="fade-up-delay-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="section-label flex items-center gap-1.5">
                <LineChart className="size-3" /> Market view
              </div>
              {selected ? (
                <div className="mt-2">
                  <div className="text-base font-medium">{selected.position.name}</div>
                  <div className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
                    {selected.position.ticker} · {tvSymbol}
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-[color:var(--muted)]">
                  Select a position below to load its chart
                </div>
              )}
            </div>
            <div className="text-right text-[10px] leading-tight text-[color:var(--muted)]">
              Real-time from TradingView
              <br />
              <span className="text-[color:var(--border-strong)]">·</span> Table prices cached 5–15 min
            </div>
          </div>

          {tvSymbol && selected ? (
            <MarketWidget
              symbol={tvSymbol}
              displayName={selected.position.name}
            />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] text-sm text-[color:var(--muted)]">
              No market chart for cash-only portfolios.
            </div>
          )}
        </div>
      </section>

      <section className="fade-up-delay-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <SectionHeader
            icon={Wallet2}
            title="Positions"
            hint={
              metrics.length === 0
                ? undefined
                : `${metrics.length} ${metrics.length === 1 ? "entry" : "entries"} · click a row for its chart`
            }
            inline
          />
          <AddPositionButton />
        </div>

        {metrics.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[color:var(--border)] p-10 text-center">
            <div className="text-sm text-[color:var(--muted-strong)]">
              No positions yet
            </div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">
              Use the button above to add your first stock, ETF, crypto or cash holding.
            </div>
          </div>
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

function SectionHeader({
  icon: Icon,
  title,
  hint,
  inline,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
  inline?: boolean;
}) {
  return (
    <div className={inline ? "flex items-baseline gap-3" : "mb-5"}>
      <div className="section-label flex items-center gap-1.5">
        <Icon className="size-3" />
        {title}
      </div>
      {hint && (
        <span className="text-[11px] text-[color:var(--muted)]">{hint}</span>
      )}
    </div>
  );
}
