"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PositionMetrics } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import { colorForKey } from "@/lib/palette";

const ASSET_TYPE_COLORS: Record<string, string> = {
  STOCK: "#2dd4bf",
  ETF: "#d4af37",
  CRYPTO: "#c084fc",
  CASH: "#8a94a6",
};

type Slice = { name: string; value: number; color: string };

export function AllocationDonut({ metrics }: { metrics: PositionMetrics[] }) {
  const totalPLN = metrics.reduce((s, m) => s + m.currentValuePLN, 0);

  const byPosition: Slice[] = metrics
    .filter((m) => m.currentValuePLN > 0)
    .sort((a, b) => b.currentValuePLN - a.currentValuePLN)
    .map((m) => ({
      name: m.position.name,
      value: m.currentValuePLN,
      color: colorForKey(m.position.ticker),
    }));

  const byTypeMap = new Map<string, number>();
  for (const m of metrics) {
    if (m.currentValuePLN <= 0) continue;
    byTypeMap.set(
      m.position.assetType,
      (byTypeMap.get(m.position.assetType) ?? 0) + m.currentValuePLN
    );
  }
  const byType: Slice[] = [...byTypeMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      color: ASSET_TYPE_COLORS[name] ?? "#8a94a6",
    }));

  if (totalPLN <= 0 || byPosition.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-[color:var(--border)] text-sm text-[color:var(--muted)]">
        No allocation to show yet.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Chart title="By position" data={byPosition} totalPLN={totalPLN} />
      <Chart title="By asset type" data={byType} totalPLN={totalPLN} />
    </div>
  );
}

function Chart({
  title,
  data,
  totalPLN,
}: {
  title: string;
  data: Slice[];
  totalPLN: number;
}) {
  return (
    <div className="flex flex-col">
      <div className="section-title mb-3">{title}</div>
      <div className="h-[180px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              outerRadius={70}
              stroke="none"
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                const p = payload?.[0];
                if (!p) return null;
                const value = Number(p.value);
                const pct = totalPLN > 0 ? value / totalPLN : 0;
                return (
                  <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-xs shadow-lg">
                    <div className="font-medium">{String(p.name)}</div>
                    <div className="text-[color:var(--muted)]">
                      {formatCurrency(value, "PLN")} · {formatPercent(pct)}
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1.5 text-xs">
        {data.slice(0, 6).map((slice) => {
          const pct = totalPLN > 0 ? slice.value / totalPLN : 0;
          return (
            <li key={slice.name} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="flex-1 truncate">{slice.name}</span>
              <span className="tabular-nums text-[color:var(--muted)]">
                {formatPercent(pct)}
              </span>
            </li>
          );
        })}
        {data.length > 6 && (
          <li className="text-[color:var(--muted)]">
            +{data.length - 6} more
          </li>
        )}
      </ul>
    </div>
  );
}
