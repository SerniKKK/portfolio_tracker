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
import type { SimulateResult } from "@/lib/simulator";

export function MonteCarloChart({
  result,
  startDate,
}: {
  result: SimulateResult;
  startDate: Date;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || result.months.length === 0) return;

    // Solid background matching the panel surface so the punch-out band trick
    // (lower area painted with this same color) blends seamlessly.
    const PLOT_BG = "hsl(30 9% 11%)";

    const chart: IChartApi = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: PLOT_BG },
        textColor: "hsl(30 5% 65%)",
        fontFamily: "inherit",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "hsl(30 6% 16%)" },
        horzLines: { color: "hsl(30 6% 16%)" },
      },
      timeScale: { borderColor: "hsl(30 6% 15%)" },
      rightPriceScale: { borderColor: "hsl(30 6% 15%)" },
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

    // Upper band (p90) — warm gold fill, kept strong enough to stay visible all
    // the way down to the p10 line (the lower area punches out below that).
    const upperArea = chart.addSeries(AreaSeries, {
      lineColor: "hsl(38 48% 66% / 0.85)",
      topColor: "hsl(38 48% 64% / 0.34)",
      bottomColor: "hsl(38 48% 64% / 0.16)",
      lineWidth: 1,
      priceFormat,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Lower area (p10) filled with the plot background to punch out below the cone
    const lowerArea = chart.addSeries(AreaSeries, {
      lineColor: "hsl(38 48% 66% / 0.6)",
      topColor: PLOT_BG,
      bottomColor: PLOT_BG,
      lineWidth: 1,
      priceFormat,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const medianLine = chart.addSeries(LineSeries, {
      color: "hsl(40 62% 74%)",
      lineWidth: 2,
      priceFormat,
    });

    const toTime = (monthOffset: number): UTCTimestamp => {
      const d = new Date(startDate);
      d.setUTCMonth(d.getUTCMonth() + monthOffset);
      d.setUTCHours(0, 0, 0, 0);
      return Math.floor(d.getTime() / 1000) as UTCTimestamp;
    };

    upperArea.setData(
      result.months.map((m, i) => ({ time: toTime(m), value: result.p90[i] }))
    );
    lowerArea.setData(
      result.months.map((m, i) => ({ time: toTime(m), value: result.p10[i] }))
    );
    medianLine.setData(
      result.months.map((m, i) => ({ time: toTime(m), value: result.p50[i] }))
    );

    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [result, startDate]);

  return (
    <div className="scale-in">
      <div ref={containerRef} className="h-[340px] w-full" />
      <div className="mt-3 flex items-center justify-end gap-5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-3 rounded-sm"
            style={{ backgroundColor: "hsl(38 48% 64% / 0.34)" }}
          />
          p10 – p90
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3" style={{ backgroundColor: "hsl(40 62% 74%)" }} />
          median
        </span>
      </div>
    </div>
  );
}
