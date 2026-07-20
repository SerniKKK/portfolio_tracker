"use client";

import { useMemo, useState } from "react";
import { simulate } from "@/lib/simulator";
import { MonteCarloChart } from "./MonteCarloChart";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Info } from "lucide-react";

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
  const cagr =
    initialValue > 0
      ? Math.pow(median / initialValue, 1 / horizonYears) - 1
      : 0;

  return (
    <section className="fade-up-delay-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
          <Sparkles className="size-4 text-[color:var(--accent-cream)]" />
        </div>
        <div>
          <div className="section-label">Monte Carlo scenarios</div>
          <div className="mt-1 font-serif text-2xl tracking-tight">
            Where could this be in {horizonYears} years?
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[color:var(--muted)]">
            <Info className="size-3" />
            Simulation under your assumptions. Not a forecast, not investment
            advice.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
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
            label="Expected return (annual %)"
            value={expectedReturnPct}
            onChange={setExpectedReturnPct}
            min={-20}
            max={40}
            step={0.5}
          />
          <NumberField
            label="Volatility (annual %)"
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

          <div className="rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] p-4 text-sm">
            <div className="section-label mb-3">
              Value in {horizonYears} years
            </div>
            <PctRow label="p10" value={formatCurrency(low, "PLN")} />
            <PctRow
              label="p50"
              value={formatCurrency(median, "PLN")}
              accent
            />
            <PctRow label="p90" value={formatCurrency(high, "PLN")} />
            <div className="mt-3 border-t border-[color:var(--border)] pt-3 text-xs text-[color:var(--muted)]">
              CAGR (median){" "}
              <span className="tabular ml-1 text-[color:var(--foreground)]">
                {formatPercent(cagr)}
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
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]"
      >
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="tabular"
      />
    </div>
  );
}

function PctRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <span
        className={
          accent
            ? "font-medium text-[color:var(--accent-gold)]"
            : "text-[color:var(--muted)]"
        }
      >
        {label}
      </span>
      <span
        className={`tabular ${accent ? "font-serif text-lg text-[color:var(--accent-gold)]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
