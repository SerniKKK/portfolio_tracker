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
        borderColor: "rgba(31, 44, 72, 0.6)",
      },
      rightPriceScale: {
        borderColor: "rgba(31, 44, 72, 0.6)",
      },
      crosshair: { mode: 1 },
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

    // p90 as filled area (upper bound of the cone).
    const upperArea = chart.addSeries(AreaSeries, {
      lineColor: "rgba(45, 212, 191, 0.5)",
      topColor: "rgba(45, 212, 191, 0.25)",
      bottomColor: "rgba(45, 212, 191, 0.02)",
      lineWidth: 1,
      priceFormat,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // p10 as filled area over the background — subtracts the "below cone" region
    // so only the band between p10 and p90 appears colored.
    const lowerArea = chart.addSeries(AreaSeries, {
      lineColor: "rgba(45, 212, 191, 0.5)",
      topColor: "rgba(11, 17, 32, 1)",
      bottomColor: "rgba(11, 17, 32, 1)",
      lineWidth: 1,
      priceFormat,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // p50 median line on top.
    const medianLine = chart.addSeries(LineSeries, {
      color: "#d4af37",
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
    <div>
      <div ref={containerRef} className="h-[320px] w-full" />
      <div className="mt-3 flex items-center justify-end gap-4 text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-[color:var(--teal)]/30" />
          p10 – p90
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-[color:var(--gold)]" />
          median
        </span>
      </div>
    </div>
  );
}
