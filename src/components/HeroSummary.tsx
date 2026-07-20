import type { PortfolioTotals } from "@/lib/finance";
import { convertPLNTo, type FxResult } from "@/lib/fx";
import {
  formatCompactCurrency,
  formatCurrency,
  formatSignedCompact,
  formatSignedPercent,
} from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, Layers, Wallet, Percent, Hash } from "lucide-react";

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
  const Arrow = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <section className="fade-up rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="section-label">Total portfolio value</div>
          <div className="mt-3 flex items-baseline gap-4">
            <div className="tabular font-serif text-5xl leading-none tracking-tight sm:text-6xl md:text-7xl">
              {formatCurrency(totals.totalValuePLN, "PLN")}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[color:var(--muted)]">
            <span className="tabular">
              ≈ {formatCompactCurrency(eurValue, "EUR")}
            </span>
            <span className="text-[color:var(--border-strong)]">·</span>
            <span className="tabular">
              ≈ {formatCompactCurrency(usdValue, "USD")}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-sm lg:self-end"
          style={{
            borderColor: `${pnlColor}30`,
            backgroundColor: `${pnlColor}12`,
            color: pnlColor,
          }}
        >
          <Arrow className="size-4" strokeWidth={2.2} />
          <span className="tabular font-medium">
            {formatSignedCompact(totals.totalPnlPLN, "PLN")}
          </span>
          <span className="text-[color:var(--border-strong)]">·</span>
          <span className="tabular">{formatSignedPercent(totals.totalPnlPct)}</span>
        </div>
      </div>

      <div className="hairline my-6" />

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Stat
          icon={Wallet}
          label="Cost basis"
          value={formatCurrency(totals.totalCostPLN, "PLN")}
        />
        <Stat
          icon={Percent}
          label="Total return"
          value={formatSignedPercent(totals.totalPnlPct)}
          color={pnlColor}
        />
        <Stat
          icon={Layers}
          label="Asset types"
          value={String(Object.keys(totals.byAssetType).length)}
        />
        <Stat
          icon={Hash}
          label="Positions"
          value={String(positionCount)}
        />
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
        <Icon className="size-3" />
        {label}
      </div>
      <div
        className="tabular mt-1.5 text-lg font-medium"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
    </div>
  );
}
