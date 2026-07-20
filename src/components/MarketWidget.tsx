"use client";

import { useEffect, useRef } from "react";

const WIDGET_HEIGHT = 460;

// TradingView Advanced Real-Time Chart embed with explicit pixel height.
// `autosize` misreads container size at hydration and overflows; a fixed
// numeric height keeps the widget inside its card cleanly.
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

    container.innerHTML = `<div class="tradingview-widget-container__widget" style="height:${WIDGET_HEIGHT}px;width:100%"></div>`;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: WIDGET_HEIGHT,
      symbol,
      interval: "D",
      timezone: "Europe/Warsaw",
      theme: "dark",
      style: "1",
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
      style={{ height: WIDGET_HEIGHT }}
      className="tradingview-widget-container scale-in w-full overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]"
    />
  );
}
