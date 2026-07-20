import type { PortfolioTotals } from "@/lib/finance";
import { convertPLNTo, type FxResult } from "@/lib/fx";
import {
  formatCompactCurrency,
  formatCurrency,
  formatSignedCompact,
  formatSignedPercent,
} from "@/lib/format";

export function HeroSummary({
  totals,
  positionCount,
  fx,
}: {
  totals: PortfolioTotals;
  positionCount: number;
  fx: FxResult;
}) {
  const positive = totals.totalPnlPLN >= 0;
  const eurValue = convertPLNTo(totals.totalValuePLN, "EUR", fx.rates);
  const usdValue = convertPLNTo(totals.totalValuePLN, "USD", fx.rates);
  const pnlColor = positive ? "var(--positive)" : "var(--negative)";

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card card-accent">
        <div className="section-title">Total value</div>
        <div className="mt-2 flex items-baseline gap-3">
          <div className="tabular text-4xl font-semibold tracking-tight sm:text-5xl">
            {formatCurrency(totals.totalValuePLN, "PLN")}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[color:var(--muted)]">
          <span className="tabular">
            ≈ {formatCompactCurrency(eurValue, "EUR")}
          </span>
          <span className="tabular">
            ≈ {formatCompactCurrency(usdValue, "USD")}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Cost basis" value={formatCurrency(totals.totalCostPLN, "PLN")} />
          <Stat
            label="P/L"
            value={formatSignedCompact(totals.totalPnlPLN, "PLN")}
            color={pnlColor}
          />
          <Stat
            label="Return"
            value={formatSignedPercent(totals.totalPnlPct)}
            color={pnlColor}
          />
          <Stat label="Positions" value={String(positionCount)} />
        </div>
      </div>

      <div className="card">
        <div className="section-title">Allocation split</div>
        <ul className="mt-3 space-y-2">
          {Object.entries(totals.byAssetType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, value]) => {
              const pct = totals.totalValuePLN > 0 ? value / totals.totalValuePLN : 0;
              return (
                <li key={type}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="uppercase tracking-wider text-[color:var(--muted)]">
                      {type}
                    </span>
                    <span className="tabular">
                      {formatCompactCurrency(value, "PLN")} ·{" "}
                      {(pct * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[color:var(--surface-2)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--teal)]"
                      style={{ width: `${Math.max(pct * 100, 2)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          {Object.keys(totals.byAssetType).length === 0 && (
            <li className="text-xs text-[color:var(--muted)]">
              Add positions to see the allocation split.
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
        {label}
      </div>
      <div
        className="tabular mt-1 text-base font-medium"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
