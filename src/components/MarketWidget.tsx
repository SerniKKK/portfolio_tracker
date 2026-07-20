"use client";

import { useEffect, useRef } from "react";

// TradingView Advanced Real-Time Chart embed. Given enough vertical space
// (~500px+), the top toolbar renders properly and offers chart-type switching
// (candles / bars / line / area), interval selection, and indicators, while
// we keep the left drawing toolbar hidden. Symbol change is locked so users
// switch by clicking rows in the table.
export function MarketWidget({
  symbol,
}: {
  symbol: string;
  displayName?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = `<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>`;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "Europe/Warsaw",
      theme: "dark",
      style: "1", // 1=candles, users can switch via the top toolbar
      locale: "en",
      backgroundColor: "rgba(20, 17, 15, 1)",
      gridColor: "rgba(58, 51, 45, 0.35)",
      toolbar_bg: "rgba(20, 17, 15, 1)",
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      withdateranges: true,
      hide_volume: false,
      studies: [],
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      key={symbol}
      className="tradingview-widget-container scale-in h-[500px] w-full overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] sm:h-[540px] lg:h-[560px]"
    />
  );
}
