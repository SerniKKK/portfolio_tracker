"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  AreaSeries,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";

export type HistoryPoint = {
  date: string; // ISO
  totalValuePLN: number;
  totalCostPLN: number;
};

export function PortfolioHistoryChart({ data }: { data: HistoryPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    const chart: IChartApi = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8a94a6",
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: "rgba(31, 44, 72, 0.6)" },
        horzLines: { color: "rgba(31, 44, 72, 0.6)" },
      },
      timeScale: {
        timeVisible: false,
        borderColor: "rgba(31, 44, 72, 0.6)",
      },
      rightPriceScale: {
        borderColor: "rgba(31, 44, 72, 0.6)",
      },
      crosshair: { mode: 1 },
      autoSize: true,
    });

    const valueSeries = chart.addSeries(AreaSeries, {
      lineColor: "#2dd4bf",
      topColor: "rgba(45, 212, 191, 0.35)",
      bottomColor: "rgba(45, 212, 191, 0.02)",
      lineWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: (v: number) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PLN",
            maximumFractionDigits: 0,
          }).format(v),
        minMove: 1,
      },
    });

    const costSeries = chart.addSeries(LineSeries, {
      color: "rgba(212, 175, 55, 0.7)",
      lineWidth: 1,
      lineStyle: 2, // dashed
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    valueSeries.setData(
      sorted.map((p) => ({
        time: toUtcTimestamp(p.date),
        value: p.totalValuePLN,
      }))
    );
    costSeries.setData(
      sorted.map((p) => ({
        time: toUtcTimestamp(p.date),
        value: p.totalCostPLN,
      }))
    );

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] text-sm text-[color:var(--muted)]">
        No history yet. A snapshot is taken every day you visit, plus one at
        end of day. Come back tomorrow.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
      <div ref={containerRef} className="h-[280px] w-full" />
      <div className="mt-2 flex items-center justify-end gap-4 text-[11px] text-[color:var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-full bg-[color:var(--teal)]" />
          Value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 border-t border-dashed border-[color:var(--gold)]" />
          Cost basis
        </span>
      </div>
    </div>
  );
}

function toUtcTimestamp(iso: string): UTCTimestamp {
  return Math.floor(new Date(iso).getTime() / 1000) as UTCTimestamp;
}
