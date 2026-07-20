import type { PortfolioTotals } from "@/lib/finance";
import { convertPLNTo, type FxResult } from "@/lib/fx";
import {
  formatCurrency,
  formatSignedCurrency,
  formatSignedPercent,
} from "@/lib/format";
import { formatFetchedAt } from "@/lib/format";

export function PortfolioSummary({
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
  const fxLabel = fx.isFallback
    ? "FX: fallback"
    : `FX: ${formatFetchedAt(fx.fetchedAt)}${fx.isStale ? " (stale)" : ""}`;

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard label="Total value" accent="teal">
        <div className="text-2xl font-semibold">
          {formatCurrency(totals.totalValuePLN, "PLN")}
        </div>
        <div className="mt-1 text-xs text-[color:var(--muted)]">
          {formatCurrency(eurValue, "EUR")} · {formatCurrency(usdValue, "USD")}
        </div>
        <div
          className="mt-1 text-[10px] uppercase tracking-wider"
          style={{
            color: fx.isFallback || fx.isStale
              ? "var(--negative)"
              : "var(--muted)",
          }}
        >
          {fxLabel}
        </div>
      </SummaryCard>

      <SummaryCard label="Total cost">
        <div className="text-2xl font-semibold">
          {formatCurrency(totals.totalCostPLN, "PLN")}
        </div>
        <div className="mt-1 text-xs text-[color:var(--muted)]">
          Money put in
        </div>
      </SummaryCard>

      <SummaryCard
        label="Profit / Loss"
        accent={positive ? "positive" : "negative"}
      >
        <div
          className="text-2xl font-semibold"
          style={{
            color: positive ? "var(--positive)" : "var(--negative)",
          }}
        >
          {formatSignedCurrency(totals.totalPnlPLN, "PLN")}
        </div>
        <div
          className="mt-1 text-xs"
          style={{
            color: positive ? "var(--positive)" : "var(--negative)",
          }}
        >
          {formatSignedPercent(totals.totalPnlPct)}
        </div>
      </SummaryCard>

      <SummaryCard label="Positions" accent="gold">
        <div className="text-2xl font-semibold">{positionCount}</div>
        <div className="mt-1 text-xs text-[color:var(--muted)]">
          {Object.keys(totals.byAssetType).length} asset{" "}
          {Object.keys(totals.byAssetType).length === 1 ? "type" : "types"}
        </div>
      </SummaryCard>
    </section>
  );
}

function SummaryCard({
  label,
  accent = "muted",
  children,
}: {
  label: string;
  accent?: "teal" | "gold" | "positive" | "negative" | "muted";
  children: React.ReactNode;
}) {
  const accentColor = {
    teal: "var(--teal)",
    gold: "var(--gold)",
    positive: "var(--positive)",
    negative: "var(--negative)",
    muted: "var(--muted)",
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-5 shadow-xl backdrop-blur">
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: accentColor }}
      />
      <div className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
        {label}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
