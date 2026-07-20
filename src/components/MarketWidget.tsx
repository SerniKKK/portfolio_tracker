"use client";

import { useEffect, useRef } from "react";

// TradingView Advanced Real-Time Chart Widget (free embed, not the paid library).
// Re-mounts on symbol change by clearing and re-appending the script.
export function MarketWidget({ symbol }: { symbol: string }) {
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
      style: "1",
      locale: "en",
      hide_side_toolbar: true,
      allow_symbol_change: false,
      backgroundColor: "rgba(17, 26, 46, 0.4)",
      gridColor: "rgba(31, 44, 72, 0.6)",
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
      className="tradingview-widget-container h-[420px] w-full overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)]"
    />
  );
}
