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
  date: string;
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
        textColor: "hsl(30 5% 65%)",
        fontFamily: "inherit",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "hsl(30 6% 12%)" },
        horzLines: { color: "hsl(30 6% 12%)" },
      },
      timeScale: {
        timeVisible: false,
        borderColor: "hsl(30 6% 15%)",
      },
      rightPriceScale: {
        borderColor: "hsl(30 6% 15%)",
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "hsl(30 6% 25%)", labelBackgroundColor: "hsl(30 8% 8%)" },
        horzLine: { color: "hsl(30 6% 25%)", labelBackgroundColor: "hsl(30 8% 8%)" },
      },
      autoSize: true,
    });

    const priceFormat = {
      type: "custom" as const,
      formatter: (v: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "PLN",
          maximumFractionDigits: 0,
        }).format(v),
      minMove: 1,
    };

    const valueSeries = chart.addSeries(AreaSeries, {
      lineColor: "hsl(38 45% 62%)",
      topColor: "hsl(38 45% 62% / 0.28)",
      bottomColor: "hsl(38 45% 62% / 0.01)",
      lineWidth: 2,
      priceFormat,
    });

    const costSeries = chart.addSeries(LineSeries, {
      color: "hsl(30 6% 40%)",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat,
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
      <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[color:var(--border)]">
        <div className="text-sm text-[color:var(--muted-strong)]">
          No history yet
        </div>
        <div className="max-w-xs text-center text-xs text-[color:var(--muted)]">
          A snapshot is taken each day you visit, plus one at end of day. Come
          back tomorrow to see your line take shape.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} className="h-[320px] w-full" />
      <div className="mt-3 flex items-center justify-end gap-5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded-full bg-[color:var(--accent-gold)]" />
          Value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-3 border-t border-dashed border-[color:var(--muted)]" />
          Cost basis
        </span>
      </div>
    </div>
  );
}

function toUtcTimestamp(iso: string): UTCTimestamp {
  return Math.floor(new Date(iso).getTime() / 1000) as UTCTimestamp;
}
