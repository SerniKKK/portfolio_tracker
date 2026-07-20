"use client";

import { useMemo, useState } from "react";
import { simulate } from "@/lib/simulator";
import { MonteCarloChart } from "./MonteCarloChart";
import { formatCurrency, formatPercent } from "@/lib/format";

export function MonteCarloSection({ initialValue }: { initialValue: number }) {
  const [horizonYears, setHorizonYears] = useState(10);
  const [expectedReturnPct, setExpectedReturnPct] = useState(8);
  const [volatilityPct, setVolatilityPct] = useState(15);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [seed, setSeed] = useState(42);

  const result = useMemo(
    () =>
      simulate({
        initialValue,
        horizonMonths: horizonYears * 12,
        expectedReturnAnnual: expectedReturnPct / 100,
        volatilityAnnual: volatilityPct / 100,
        monthlyContribution,
        numPaths: 500,
        seed,
      }),
    [
      initialValue,
      horizonYears,
      expectedReturnPct,
      volatilityPct,
      monthlyContribution,
      seed,
    ]
  );

  const last = result.months.length - 1;
  const median = result.p50[last] ?? 0;
  const low = result.p10[last] ?? 0;
  const high = result.p90[last] ?? 0;

  return (
    <section className="card">
      <div className="mb-4">
        <h2 className="section-title">Monte Carlo scenarios</h2>
        <p className="mt-1 max-w-2xl text-xs text-[color:var(--muted)]">
          Simulation under your assumptions, not a forecast or investment
          advice. Past returns and volatility do not guarantee future results.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <NumberField
            label="Horizon (years)"
            value={horizonYears}
            onChange={setHorizonYears}
            min={1}
            max={40}
            step={1}
          />
          <NumberField
            label="Expected annual return (%)"
            value={expectedReturnPct}
            onChange={setExpectedReturnPct}
            min={-20}
            max={40}
            step={0.5}
          />
          <NumberField
            label="Annual volatility (%)"
            value={volatilityPct}
            onChange={setVolatilityPct}
            min={0}
            max={100}
            step={0.5}
          />
          <NumberField
            label="Monthly contribution (PLN)"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            min={0}
            step={100}
          />
          <NumberField
            label="Seed"
            value={seed}
            onChange={setSeed}
            min={0}
            step={1}
          />
          <div className="card-tight text-xs">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
              Value in {horizonYears} years
            </div>
            <div className="flex items-baseline justify-between py-0.5">
              <span className="text-[color:var(--muted)]">p10</span>
              <span className="tabular">{formatCurrency(low, "PLN")}</span>
            </div>
            <div className="flex items-baseline justify-between py-0.5 text-sm font-semibold text-[color:var(--gold)]">
              <span>p50</span>
              <span className="tabular">{formatCurrency(median, "PLN")}</span>
            </div>
            <div className="flex items-baseline justify-between py-0.5">
              <span className="text-[color:var(--muted)]">p90</span>
              <span className="tabular">{formatCurrency(high, "PLN")}</span>
            </div>
            <div className="mt-2 border-t border-[color:var(--border)] pt-2 text-[color:var(--muted)]">
              CAGR (median):{" "}
              <span className="tabular text-[color:var(--foreground)]">
                {formatPercent(
                  initialValue > 0
                    ? Math.pow(median / initialValue, 1 / horizonYears) - 1
                    : 0
                )}
              </span>
            </div>
          </div>
        </div>

        <MonteCarloChart result={result} startDate={new Date()} />
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wider text-[color:var(--muted)]">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="h-10 w-full rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 text-sm text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--teal)]/50"
      />
    </label>
  );
}
