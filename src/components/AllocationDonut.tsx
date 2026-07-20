"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PositionMetrics } from "@/lib/finance";
import { formatCompactCurrency, formatPercent } from "@/lib/format";
import { colorForKey } from "@/lib/palette";

const ASSET_TYPE_COLORS: Record<string, string> = {
  STOCK: "hsl(172 40% 55%)",
  ETF: "hsl(38 45% 62%)",
  CRYPTO: "hsl(280 30% 65%)",
  CASH: "hsl(30 5% 55%)",
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
      color: ASSET_TYPE_COLORS[name] ?? "hsl(30 5% 55%)",
    }));

  if (totalPLN <= 0 || byPosition.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] text-sm text-[color:var(--muted)]">
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
      <div className="section-label mb-3">{title}</div>
      <div className="relative h-[160px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={72}
              stroke="hsl(30 8% 5.5%)"
              strokeWidth={2}
              paddingAngle={1}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              content={({ payload }) => {
                const p = payload?.[0];
                if (!p) return null;
                const value = Number(p.value);
                const pct = totalPLN > 0 ? value / totalPLN : 0;
                return (
                  <div className="rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-3 py-2 text-xs shadow-xl">
                    <div className="font-medium">{String(p.name)}</div>
                    <div className="tabular mt-0.5 text-[color:var(--muted-strong)]">
                      {formatCompactCurrency(value, "PLN")} · {formatPercent(pct)}
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 space-y-1.5 text-xs">
        {data.slice(0, 5).map((slice) => {
          const pct = totalPLN > 0 ? slice.value / totalPLN : 0;
          return (
            <li key={slice.name} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="flex-1 truncate">{slice.name}</span>
              <span className="tabular text-[color:var(--muted)]">
                {(pct * 100).toFixed(1)}%
              </span>
            </li>
          );
        })}
        {data.length > 5 && (
          <li className="text-[color:var(--muted)]">
            +{data.length - 5} more
          </li>
        )}
      </ul>
    </div>
  );
}
